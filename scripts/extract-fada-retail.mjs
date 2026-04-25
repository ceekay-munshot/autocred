#!/usr/bin/env node
/**
 * extract-fada-retail.mjs — first real public-source parser for the
 * Industry retail data. Pulls a FADA monthly/annual press-release PDF
 * via Firecrawl, extracts text, and conservatively searches for the
 * Passenger Vehicle (PV) annual retail row.
 *
 * Run:
 *   npm run extract:fada
 *
 * Outputs:
 *   tmp/fada/fada-fy25-march25-raw.json    raw Firecrawl response
 *   tmp/fada/fada-fy25-march25.txt         extracted text only
 *
 *   public/data/fada-retail-fy25.json                <-- only if HIGH confidence
 *   public/data/fada-retail-fy25-review-needed.json  <-- otherwise
 *
 * Hard rules:
 *   - Never invents numbers. If the parser is not confident, the
 *     normalized output is NOT written; instead a review-needed file
 *     captures the snippets so an analyst can verify by hand.
 *   - Never logs the API key.
 *   - Refuses paid-source URLs (enforced by scripts/lib/firecrawl.mjs).
 *
 * Design of confidence:
 *   - HIGH    : Found a structured PV row (markdown table or aligned
 *               line) AND it contains a number in a plausible range
 *               for India PV annual retail (1,000,000 – 10,000,000)
 *               AND a YoY growth % is also present nearby.
 *   - MEDIUM  : Found a PV row + plausible number, but growth % was
 *               not co-located.
 *   - LOW     : "PV" / "Passenger Vehicle" appears but no number
 *               close to it parses cleanly.
 *
 * The plausible range is a structural sanity check (PV India retail
 * has been in the 1–10M range for >15 years) — it filters out
 * percentages, market-share decimals and small print, not value
 * claims. The parser never substitutes its own number for a missing
 * one; it either reports what is in the document, or it refuses.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pickContent, scrapeUrl } from "./lib/firecrawl.mjs";

const FADA_PDF_URL =
  "https://www.fada.in/images/press-release/167f3463b1a212FADA%20Releases%20FY%202025%20and%20March%202025%20Vehicle%20Retail%20Data.pdf";

const TMP_DIR = "tmp/fada";
const RAW_FILE = "fada-fy25-march25-raw.json";
const TEXT_FILE = "fada-fy25-march25.txt";

const PUBLIC_DATA_DIR = "public/data";
const NORMALIZED_FILE = "fada-retail-fy25.json";
const REVIEW_FILE = "fada-retail-fy25-review-needed.json";

const PV_PLAUSIBLE_MIN = 1_000_000; // 10 lakh
const PV_PLAUSIBLE_MAX = 10_000_000; // 1 crore

function fail(msg) {
  console.error(`\n[ERROR] ${msg}\n`);
  process.exit(1);
}

/**
 * Parse Indian-style or international-style integers.
 * "42,01,737" → 4201737
 * "4,201,737" → 4201737
 * Numbers below 1000 with a decimal are treated as percentages and
 * returned with isPercent=true.
 */
function parseNumberToken(raw) {
  const cleaned = raw.replace(/,/g, "").trim();
  if (!/^\d+(\.\d+)?$/.test(cleaned)) return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value)) return null;
  return { raw, value };
}

function extractNumberTokens(line) {
  const tokens = line.match(/\d[\d,]*(?:\.\d+)?/g) ?? [];
  return tokens.map(parseNumberToken).filter(Boolean);
}

/**
 * Find the most likely PV row. Returns:
 *   { kind: "table" | "line", text, numbers, percent? } | null
 */
function findPvRow(text) {
  const lines = text.split(/\r?\n/);

  // Strategy 1 — markdown-style table row whose first cell is "PV"
  // or "Passenger Vehicle".
  for (const line of lines) {
    if (!line.includes("|")) continue;
    const cells = line
      .split("|")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);
    if (cells.length < 2) continue;
    const firstCell = cells[0];
    if (
      /^pv\b/i.test(firstCell) ||
      /^passenger\s*vehicle/i.test(firstCell) ||
      /^p\.v\.?$/i.test(firstCell)
    ) {
      const allNumbers = extractNumberTokens(cells.slice(1).join(" "));
      return { kind: "table", text: line, cells, numbers: allNumbers };
    }
  }

  // Strategy 2 — plain-text line beginning with PV or containing
  // "Passenger Vehicle".
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      /^pv\s+\d/i.test(trimmed) ||
      /^p\.v\.\s+\d/i.test(trimmed) ||
      /passenger\s+vehicle/i.test(trimmed)
    ) {
      const numbers = extractNumberTokens(trimmed);
      if (numbers.length === 0) continue;
      return { kind: "line", text: trimmed, numbers };
    }
  }

  return null;
}

/**
 * Pick the FY25 annual PV total + growth % from a row's numbers.
 *
 * FADA annual tables typically read:
 *   PV | <FY current units> | <FY previous units> | <YoY %>
 *   or
 *   PV | <FY current units> | <FY previous units> | <YoY %> | <Mkt share>
 *
 * Heuristic:
 *   - "annual unit" candidate: largest number in PV plausible range.
 *   - "growth %" candidate: nearby small decimal (≤ 100, > 0 ish).
 *   - "previous-year unit" sanity: also in plausible range.
 */
function classifyPvRow(row) {
  const inRange = row.numbers.filter(
    (n) =>
      Number.isInteger(n.value) === false || // allow decimals (in range)
      (n.value >= PV_PLAUSIBLE_MIN && n.value <= PV_PLAUSIBLE_MAX)
  );

  const unitsCandidates = row.numbers.filter(
    (n) => n.value >= PV_PLAUSIBLE_MIN && n.value <= PV_PLAUSIBLE_MAX
  );

  // Treat anything with a decimal point and abs(value) ≤ 1000 as a %.
  const percentCandidates = row.numbers.filter(
    (n) => /\./.test(n.raw) && Math.abs(n.value) <= 1000
  );

  const fy25 = unitsCandidates[0] ?? null; // first plausible-range int
  const fy24 = unitsCandidates[1] ?? null;
  const growth = percentCandidates[0] ?? null;

  return {
    fy25,
    fy24,
    growth,
    allInRange: inRange,
    allNumbers: row.numbers,
  };
}

function decideConfidence(row, classified) {
  if (!row || !classified.fy25) return "Low";
  if (classified.fy25 && classified.growth) {
    if (
      classified.fy24 &&
      classified.fy24.value >= PV_PLAUSIBLE_MIN &&
      classified.fy24.value <= PV_PLAUSIBLE_MAX
    ) {
      return "High";
    }
    return "Medium";
  }
  if (classified.fy25) return "Medium";
  return "Low";
}

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

async function main() {
  if (!process.env.FIRECRAWL_API_KEY) {
    fail(
      "FIRECRAWL_API_KEY is not set. Add it to a local .env file or as a CI secret."
    );
  }

  await ensureDir(TMP_DIR);
  await ensureDir(PUBLIC_DATA_DIR);

  console.log("FADA FY25 retail extraction");
  console.log("===========================");
  console.log(`Source : ${FADA_PDF_URL}\n`);

  const env = await scrapeUrl({
    url: FADA_PDF_URL,
    formats: ["markdown"],
    onlyMainContent: true,
  });

  if (env.networkError) {
    fail(`Network error: ${env.networkError}`);
  }

  // Always save the raw response (with HTTP status), even on failure,
  // so the analyst can inspect the body offline.
  const rawPath = join(TMP_DIR, RAW_FILE);
  await writeFile(
    rawPath,
    JSON.stringify(
      {
        httpStatus: env.status,
        capturedAt: new Date().toISOString(),
        sourceUrl: FADA_PDF_URL,
        body: env.payload ?? { _raw: env.rawText },
      },
      null,
      2
    ),
    "utf8"
  );
  console.log(`Saved raw  : ${rawPath} (status ${env.status}, ${env.ms} ms)`);

  if (!env.ok) {
    console.log(
      `\nFirecrawl returned a non-OK / non-JSON response. See the raw file for details.`
    );
    if (env.payload) {
      const top = Object.keys(env.payload).slice(0, 8).join(", ");
      console.log(`  top-level keys: ${top}`);
      const hint =
        env.payload?.error ||
        env.payload?.message ||
        env.payload?.reason ||
        env.payload?.data?.metadata?.error;
      if (hint) console.log(`  message       : ${hint}`);
    }
    process.exit(1);
  }

  const picked = pickContent(env.payload);
  if (!picked) {
    console.log(
      `\nFirecrawl returned 200 but no extractable content field. Raw saved at ${rawPath}.`
    );
    if (env.payload && typeof env.payload === "object") {
      console.log(`  top-level keys: ${Object.keys(env.payload).join(", ")}`);
    }
    process.exit(1);
  }

  // Save the extracted text on its own for easy diffing.
  const textPath = join(TMP_DIR, TEXT_FILE);
  await writeFile(textPath, picked.content, "utf8");
  console.log(
    `Saved text : ${textPath} (${picked.content.length} chars via "${picked.field}")\n`
  );

  // Search for PV row.
  const row = findPvRow(picked.content);

  if (!row) {
    console.log("Result: no PV / Passenger Vehicle row located.");
    const reviewPath = join(PUBLIC_DATA_DIR, REVIEW_FILE);
    await writeFile(
      reviewPath,
      JSON.stringify(
        {
          sourceName: "FADA FY25 and March 2025 Vehicle Retail Data",
          sourceUrl: FADA_PDF_URL,
          sourceType: "Public",
          extractedAt: new Date().toISOString(),
          reason:
            "Parser could not locate a Passenger Vehicle row in the extracted text.",
          extractedFromField: picked.field,
          extractedTextSnippet: picked.content
            .split(/\r?\n/)
            .filter((l) => /pv|passenger/i.test(l))
            .slice(0, 20),
        },
        null,
        2
      ),
      "utf8"
    );
    console.log(`Wrote review-needed file: ${reviewPath}`);
    console.log("Industry tab intentionally NOT updated (manual review required).");
    process.exit(0);
  }

  const classified = classifyPvRow(row);
  const confidence = decideConfidence(row, classified);

  console.log(`PV row    : ${row.text}`);
  console.log(
    `Numbers   : ${row.numbers.map((n) => n.raw).join(" | ") || "(none)"}`
  );
  if (classified.fy25)
    console.log(`FY25 PV   : ${classified.fy25.value} units (raw "${classified.fy25.raw}")`);
  else console.log(`FY25 PV   : not confidently identified`);
  if (classified.fy24)
    console.log(`FY24 PV   : ${classified.fy24.value} units (raw "${classified.fy24.raw}")`);
  if (classified.growth)
    console.log(`Growth %  : ${classified.growth.value} % (raw "${classified.growth.raw}")`);
  console.log(`Confidence: ${confidence}`);

  if (confidence === "High") {
    const out = {
      sourceName: "FADA FY25 and March 2025 Vehicle Retail Data",
      sourceUrl: FADA_PDF_URL,
      sourceType: "Public",
      extractedAt: new Date().toISOString(),
      records: [
        {
          metricKey: "industry.pv.retail.sales.annual",
          metricName: "PV retail sales — annual",
          year: "FY25",
          value: classified.fy25.value,
          unit: "units",
          dataType: "Actual",
          sourceName: "FADA",
          sourceUrl: FADA_PDF_URL,
          confidence: "High",
          notes: `Extracted from FADA press-release PDF. Raw token "${classified.fy25.raw}". YoY growth co-located: ${classified.growth ? `${classified.growth.value}%` : "n/a"}.`,
        },
      ],
    };
    const outPath = join(PUBLIC_DATA_DIR, NORMALIZED_FILE);
    await writeFile(outPath, JSON.stringify(out, null, 2), "utf8");
    console.log(`\nWrote normalized: ${outPath}`);
    console.log(
      "Next step: run `npm run extract:fada` locally and confirm the value, then ask Claude to wire this single Actual datapoint into industryData.ts."
    );
    process.exit(0);
  }

  // Medium / Low — write review-needed file with everything we found.
  const reviewPath = join(PUBLIC_DATA_DIR, REVIEW_FILE);
  await writeFile(
    reviewPath,
    JSON.stringify(
      {
        sourceName: "FADA FY25 and March 2025 Vehicle Retail Data",
        sourceUrl: FADA_PDF_URL,
        sourceType: "Public",
        extractedAt: new Date().toISOString(),
        confidence,
        reason:
          confidence === "Medium"
            ? "PV row + plausible annual unit value found, but YoY growth % could not be co-located. Analyst should confirm by hand."
            : "Found a PV / Passenger Vehicle reference but no plausible annual unit value parsed cleanly.",
        rowKind: row.kind,
        rowText: row.text,
        numbers: row.numbers.map((n) => ({ raw: n.raw, value: n.value })),
        candidates: {
          fy25: classified.fy25,
          fy24: classified.fy24,
          growth: classified.growth,
        },
        extractedFromField: picked.field,
      },
      null,
      2
    ),
    "utf8"
  );
  console.log(`\nWrote review-needed file: ${reviewPath}`);
  console.log("Industry tab intentionally NOT updated (manual review required).");
  process.exit(0);
}

main().catch((err) => fail(err.stack ?? String(err)));
