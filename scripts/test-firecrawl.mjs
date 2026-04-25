#!/usr/bin/env node
/**
 * test-firecrawl.mjs — server-side smoke test for the Firecrawl
 * integration. Confirms that the API key works and that Firecrawl
 * can extract content from public landing pages we already trust
 * in the source registry. No dashboard data is persisted — only
 * the raw JSON response per target is written to
 * tmp/firecrawl-smoke/ for offline inspection (tmp/ is gitignored).
 *
 * Run:
 *   npm run test:firecrawl
 *
 * Hard rules:
 *   - Do not test paid sources.
 *   - Never log the API key or any header containing it.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pickContent, scrapeUrl } from "./lib/firecrawl.mjs";

/**
 * Public test URLs. All are already in src/data/sourceRegistry.ts as
 * Public sources. The FADA target is the FY25 retail-data PDF (the
 * /press-release index page returns 200 to Firecrawl but is a 404
 * from the origin — the PDF is the actual source of truth).
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
    label: "FADA — FY25 Vehicle Retail Data (PDF)",
    url:
      "https://www.fada.in/images/press-release/167f3463b1a212FADA%20Releases%20FY%202025%20and%20March%202025%20Vehicle%20Retail%20Data.pdf",
    filename: "fada-press-releases.json",
  },
];

const SMOKE_DIR = "tmp/firecrawl-smoke";

function fail(msg) {
  console.error(`\n[ERROR] ${msg}\n`);
  process.exit(1);
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

async function runOne(target) {
  let env;
  try {
    env = await scrapeUrl({ url: target.url });
  } catch (err) {
    return {
      ...target,
      ok: false,
      kind: "network",
      reason: err.message ?? String(err),
    };
  }

  if (env.networkError) {
    return {
      ...target,
      ok: false,
      kind: "network",
      ms: env.ms,
      reason: env.networkError,
    };
  }

  let savedPath = null;
  try {
    savedPath = await saveResponse(
      target.filename,
      env.payload ?? { _raw: env.rawText },
      env.status
    );
  } catch (err) {
    console.warn(`    (warning) failed to save debug JSON: ${err.message ?? err}`);
  }

  if (env.parseError) {
    return {
      ...target,
      ok: false,
      kind: "parse",
      status: env.status,
      ms: env.ms,
      savedPath,
      reason: `non-JSON response: ${env.parseError}`,
      preview: env.rawText.slice(0, 500),
    };
  }

  if (!env.ok) {
    const body = env.payload;
    return {
      ...target,
      ok: false,
      kind: "http",
      status: env.status,
      ms: env.ms,
      savedPath,
      reason:
        (body && (body.error || body.message || body.reason)) ??
        env.rawText.slice(0, 200),
    };
  }

  const picked = pickContent(env.payload);
  if (!picked) {
    return {
      ...target,
      ok: false,
      kind: "empty",
      status: env.status,
      ms: env.ms,
      savedPath,
      topKeys:
        env.payload && typeof env.payload === "object"
          ? Object.keys(env.payload)
          : [],
      message:
        (env.payload &&
          (env.payload.error || env.payload.message || env.payload.reason)) ||
        null,
      preview: JSON.stringify(env.payload).slice(0, 500),
    };
  }

  return {
    ...target,
    ok: true,
    status: env.status,
    ms: env.ms,
    savedPath,
    field: picked.field,
    chars: picked.content.length,
    preview: picked.content.replace(/\s+/g, " ").trim().slice(0, 300),
  };
}

function printResult(r) {
  if (r.ok) {
    console.log(
      `OK  (status ${r.status}, ${r.chars} chars via "${r.field}", ${r.ms} ms)`
    );
    console.log(`    saved   : ${r.savedPath ?? "(unsaved)"}`);
    console.log(`    preview : ${r.preview}`);
    return;
  }
  switch (r.kind) {
    case "network":
      console.log(`FAIL  (${r.ms ?? "?"} ms, network)`);
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
      console.log(
        `FAIL  (status ${r.status}, ${r.ms} ms, no extractable content)`
      );
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
  console.log(`Targets   : ${TEST_TARGETS.length}`);
  console.log(`Debug dir : ${SMOKE_DIR}/\n`);

  const results = [];
  for (const target of TEST_TARGETS) {
    process.stdout.write(`• ${target.label} ... `);
    const r = await runOne(target);
    results.push(r);
    printResult(r);
    console.log("");
  }

  const passed = results.filter((r) => r.ok).length;
  console.log(`Result: ${passed}/${results.length} extracted successfully.`);
  process.exit(passed === results.length ? 0 : 1);
}

main().catch((err) => fail(err.stack ?? String(err)));
