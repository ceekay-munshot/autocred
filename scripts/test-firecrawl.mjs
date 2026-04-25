#!/usr/bin/env node
/**
 * test-firecrawl.mjs — server-side smoke test for the Firecrawl
 * integration. Confirms that the API key works and that Firecrawl can
 * extract content from public landing pages we already trust in the
 * source registry. No dashboard data is persisted — only the raw JSON
 * response per target is written to tmp/firecrawl-smoke/ for offline
 * inspection (the tmp/ directory is gitignored).
 *
 * Run:
 *   npm run test:firecrawl
 *
 * Env loading:
 *   We rely on Node 22's native --env-file-if-exists flag (configured
 *   in package.json) to pull FIRECRAWL_API_KEY from a local `.env`.
 *   In CI the variable should be injected directly as a secret.
 *
 * Hard rules:
 *   - Do not test paid sources (SIAM paid reports, MarkLines, JATO,
 *     CMIE, Capitaline, Ace Equity, Bloomberg, Refinitiv, FactSet).
 *   - Do not write any dashboard data files from this script.
 *   - Never log the API key or any header containing it.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const FIRECRAWL_ENDPOINT = "https://api.firecrawl.dev/v1/scrape";

/**
 * Public test URLs. All are already in src/data/sourceRegistry.ts as
 * Public sources. Anything paid/login-walled is intentionally absent.
 * `filename` is the local debug-output filename (no path).
 */
const TEST_TARGETS = [
  {
    label: "Maruti Suzuki — Press Releases",
    url: "https://www.marutisuzuki.com/corporate/media/press-releases",
    filename: "maruti-press-releases.json",
  },
  {
    label: "Tata Motors — Annual Reports",
    url: "https://www.tatamotors.com/investors/financial-results/",
    filename: "tata-annual-reports.json",
  },
  {
    label: "FADA — Press Releases",
    url: "https://fada.in/press-release",
    filename: "fada-press-releases.json",
  },
];

const REQUEST_TIMEOUT_MS = 60_000;
const SMOKE_DIR = "tmp/firecrawl-smoke";

/**
 * Ordered list of response paths Firecrawl may use to deliver
 * extracted text. Probed top-to-bottom; the first non-empty string
 * wins. Easy to extend if the API surface changes again.
 */
const CONTENT_FIELDS = [
  ["data", "markdown"],
  ["data", "html"],
  ["data", "rawHtml"],
  ["data", "content"],
  ["markdown"],
  ["html"],
  ["content"],
];

function fail(msg) {
  console.error(`\n[ERROR] ${msg}\n`);
  process.exit(1);
}

function assertNoPaidUrl(url) {
  const blocked = [
    "marklines.com",
    "jato.com",
    "cmie.com",
    "capitaline.com",
    "aceanalyser.com",
    "bloomberg.com",
    "refinitiv.com",
    "lseg.com",
    "factset.com",
  ];
  const hit = blocked.find((b) => url.toLowerCase().includes(b));
  if (hit) {
    fail(`Refusing to scrape paid source (${hit}). Remove ${url} from TEST_TARGETS.`);
  }
}

function pickContent(payload) {
  if (!payload || typeof payload !== "object") return null;
  for (const path of CONTENT_FIELDS) {
    let val = payload;
    let ok = true;
    for (const key of path) {
      if (val == null || typeof val !== "object") {
        ok = false;
        break;
      }
      val = val[key];
    }
    if (!ok) continue;
    if (typeof val === "string" && val.trim().length > 0) {
      return { field: path.join("."), content: val };
    }
  }
  return null;
}

async function saveResponse(filename, payload, status) {
  const wrapped = {
    httpStatus: status,
    capturedAt: new Date().toISOString(),
    body: payload,
  };
  const fullPath = join(SMOKE_DIR, filename);
  await writeFile(fullPath, JSON.stringify(wrapped, null, 2), "utf8");
  return fullPath;
}

async function scrape({ label, url, filename }) {
  assertNoPaidUrl(url);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const start = Date.now();
  let response;
  try {
    response = await fetch(FIRECRAWL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
        onlyMainContent: true,
      }),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    return {
      label,
      url,
      filename,
      ok: false,
      kind: "network",
      reason: `network/timeout: ${err.message ?? err}`,
      ms: Date.now() - start,
    };
  }
  clearTimeout(timer);

  const ms = Date.now() - start;
  const status = response.status;

  let payload = null;
  let parseError = null;
  let rawText = "";
  try {
    rawText = await response.text();
    payload = rawText ? JSON.parse(rawText) : null;
  } catch (err) {
    parseError = err.message ?? String(err);
  }

  let savedPath = null;
  try {
    savedPath = await saveResponse(filename, payload ?? { _raw: rawText }, status);
  } catch (err) {
    console.warn(`    (warning) failed to save debug JSON: ${err.message ?? err}`);
  }

  if (!response.ok) {
    return {
      label,
      url,
      filename,
      savedPath,
      ok: false,
      kind: "http",
      status,
      reason:
        (payload && (payload.error || payload.message || payload.reason)) ??
        rawText.slice(0, 200),
      ms,
    };
  }

  if (parseError) {
    return {
      label,
      url,
      filename,
      savedPath,
      ok: false,
      kind: "parse",
      status,
      reason: `non-JSON response: ${parseError}`,
      preview: rawText.slice(0, 500),
      ms,
    };
  }

  const picked = pickContent(payload);
  if (!picked) {
    return {
      label,
      url,
      filename,
      savedPath,
      ok: false,
      kind: "empty",
      status,
      topKeys: payload && typeof payload === "object" ? Object.keys(payload) : [],
      message:
        (payload && (payload.error || payload.message || payload.reason)) || null,
      preview: JSON.stringify(payload).slice(0, 500),
      ms,
    };
  }

  return {
    label,
    url,
    filename,
    savedPath,
    ok: true,
    status,
    field: picked.field,
    chars: picked.content.length,
    preview: picked.content.replace(/\s+/g, " ").trim().slice(0, 300),
    ms,
  };
}

function printResult(r) {
  if (r.ok) {
    console.log(`OK  (status ${r.status}, ${r.chars} chars via "${r.field}", ${r.ms} ms)`);
    console.log(`    saved   : ${r.savedPath ?? "(unsaved)"}`);
    console.log(`    preview : ${r.preview}`);
    return;
  }

  switch (r.kind) {
    case "network":
      console.log(`FAIL  (${r.ms} ms, ${r.kind})`);
      console.log(`    reason  : ${r.reason}`);
      break;
    case "http":
      console.log(`FAIL  (status ${r.status}, ${r.ms} ms)`);
      console.log(`    saved   : ${r.savedPath ?? "(unsaved)"}`);
      console.log(`    reason  : ${r.reason}`);
      break;
    case "parse":
      console.log(`FAIL  (status ${r.status}, ${r.ms} ms, parse error)`);
      console.log(`    saved   : ${r.savedPath ?? "(unsaved)"}`);
      console.log(`    reason  : ${r.reason}`);
      console.log(`    raw     : ${r.preview}`);
      break;
    case "empty":
      console.log(`FAIL  (status ${r.status}, ${r.ms} ms, no extractable content)`);
      console.log(`    saved   : ${r.savedPath ?? "(unsaved)"}`);
      console.log(`    keys    : ${r.topKeys.join(", ") || "(none)"}`);
      if (r.message) console.log(`    msg     : ${r.message}`);
      console.log(`    raw     : ${r.preview}`);
      break;
  }
}

async function main() {
  if (!process.env.FIRECRAWL_API_KEY) {
    fail(
      "FIRECRAWL_API_KEY is not set. Add it to a local .env file (Node 22 --env-file-if-exists) or as a CI secret."
    );
  }

  await mkdir(SMOKE_DIR, { recursive: true });

  console.log("Firecrawl smoke test");
  console.log("====================");
  console.log(`Endpoint  : ${FIRECRAWL_ENDPOINT}`);
  console.log(`Targets   : ${TEST_TARGETS.length}`);
  console.log(`Debug dir : ${SMOKE_DIR}/\n`);

  const results = [];
  for (const target of TEST_TARGETS) {
    process.stdout.write(`• ${target.label} ... `);
    const r = await scrape(target);
    results.push(r);
    printResult(r);
    console.log("");
  }

  const passed = results.filter((r) => r.ok).length;
  const total = results.length;

  console.log(`Result: ${passed}/${total} extracted successfully.`);
  process.exit(passed === total ? 0 : 1);
}

main().catch((err) => fail(err.stack ?? String(err)));
