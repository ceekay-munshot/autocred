#!/usr/bin/env node
/**
 * test-firecrawl.mjs — server-side smoke test for the Firecrawl
 * integration. Confirms that the API key works and that Firecrawl can
 * extract content from public landing pages we already trust in the
 * source registry. No data is persisted — this is a connectivity
 * check, not a refresh job.
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

const FIRECRAWL_ENDPOINT = "https://api.firecrawl.dev/v1/scrape";

/**
 * Public test URLs. All are already in src/data/sourceRegistry.ts as
 * Public sources. Anything paid/login-walled is intentionally absent.
 */
const TEST_TARGETS = [
  {
    label: "Maruti Suzuki — Press Releases",
    url: "https://www.marutisuzuki.com/corporate/media/press-releases",
  },
  {
    label: "Tata Motors — Annual Reports",
    url: "https://www.tatamotors.com/investors/financial-results/",
  },
  {
    label: "FADA — Press Releases",
    url: "https://fada.in/press-release",
  },
];

const REQUEST_TIMEOUT_MS = 60_000;

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

async function scrape({ label, url }) {
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
      ok: false,
      reason: `network/timeout: ${err.message ?? err}`,
      ms: Date.now() - start,
    };
  }
  clearTimeout(timer);

  const ms = Date.now() - start;

  if (!response.ok) {
    let body = "";
    try {
      body = (await response.text()).slice(0, 200);
    } catch {
      body = "(could not read body)";
    }
    return {
      label,
      url,
      ok: false,
      status: response.status,
      reason: body,
      ms,
    };
  }

  let payload;
  try {
    payload = await response.json();
  } catch (err) {
    return {
      label,
      url,
      ok: false,
      reason: `non-JSON response: ${err.message ?? err}`,
      ms,
    };
  }

  const markdown =
    payload?.data?.markdown ??
    payload?.markdown ??
    "";

  return {
    label,
    url,
    ok: typeof markdown === "string" && markdown.trim().length > 0,
    status: response.status,
    chars: typeof markdown === "string" ? markdown.length : 0,
    preview:
      typeof markdown === "string"
        ? markdown.replace(/\s+/g, " ").trim().slice(0, 160)
        : "",
    ms,
  };
}

async function main() {
  if (!process.env.FIRECRAWL_API_KEY) {
    fail(
      "FIRECRAWL_API_KEY is not set. Add it to a local .env file (Node 22 --env-file-if-exists) or as a CI secret."
    );
  }

  console.log("Firecrawl smoke test");
  console.log("====================");
  console.log(`Endpoint: ${FIRECRAWL_ENDPOINT}`);
  console.log(`Targets : ${TEST_TARGETS.length}\n`);

  const results = [];
  for (const target of TEST_TARGETS) {
    process.stdout.write(`• ${target.label} ... `);
    const r = await scrape(target);
    results.push(r);
    if (r.ok) {
      console.log(`OK  (${r.chars} chars, ${r.ms} ms)`);
      console.log(`    preview: ${r.preview}`);
    } else {
      console.log(`FAIL  (${r.ms} ms${r.status ? `, status ${r.status}` : ""})`);
      console.log(`    reason: ${r.reason}`);
    }
  }

  const passed = results.filter((r) => r.ok).length;
  const total = results.length;

  console.log(`\nResult: ${passed}/${total} extracted successfully.`);
  process.exit(passed === total ? 0 : 1);
}

main().catch((err) => fail(err.stack ?? String(err)));
