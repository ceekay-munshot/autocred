/**
 * Shared helpers for Firecrawl-driven Node scripts.
 *
 * Exposes the field-probing logic and the paid-domain blocklist so
 * every script that calls Firecrawl uses the exact same rules.
 *
 * NOTE: This file is intentionally never imported from src/. Only
 * scripts/ may use it. The Firecrawl API key is read here from
 * process.env, never inlined into the client bundle.
 */

export const FIRECRAWL_ENDPOINT = "https://api.firecrawl.dev/v1/scrape";

export const CONTENT_FIELDS = [
  ["data", "markdown"],
  ["data", "html"],
  ["data", "rawHtml"],
  ["data", "content"],
  ["markdown"],
  ["html"],
  ["content"],
];

const FORBIDDEN_DOMAINS = [
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

export function assertNoPaidUrl(url) {
  const hit = FORBIDDEN_DOMAINS.find((b) => url.toLowerCase().includes(b));
  if (hit) {
    throw new Error(
      `Refusing to scrape paid source (${hit}). URL: ${url}`
    );
  }
}

export function pickContent(payload) {
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

/**
 * Call Firecrawl /v1/scrape. Returns a normalized envelope:
 *   { ok, status, payload, rawText, ms, parseError, networkError }
 *
 * Never throws on HTTP errors — caller decides what to do. Network
 * failures and aborts return ok:false, networkError populated.
 *
 * Throws synchronously only if FIRECRAWL_API_KEY is missing or the
 * URL hits a paid-source guardrail.
 */
export async function scrapeUrl({ url, formats = ["markdown"], onlyMainContent = true, timeoutMs = 60_000 }) {
  if (!process.env.FIRECRAWL_API_KEY) {
    throw new Error(
      "FIRECRAWL_API_KEY is not set. Add it to a local .env file or as a CI secret."
    );
  }
  assertNoPaidUrl(url);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const start = Date.now();

  let response;
  try {
    response = await fetch(FIRECRAWL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
      },
      body: JSON.stringify({ url, formats, onlyMainContent }),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    return {
      ok: false,
      networkError: err.message ?? String(err),
      ms: Date.now() - start,
    };
  }
  clearTimeout(timer);

  const ms = Date.now() - start;
  const status = response.status;

  let rawText = "";
  let payload = null;
  let parseError = null;
  try {
    rawText = await response.text();
    payload = rawText ? JSON.parse(rawText) : null;
  } catch (err) {
    parseError = err.message ?? String(err);
  }

  return {
    ok: response.ok && !parseError,
    status,
    payload,
    rawText,
    ms,
    parseError,
  };
}
