/**
 * firecrawlNotes.ts — operating rules for the Firecrawl integration.
 *
 * This module is intentionally documentation-only. It does not import
 * any Firecrawl SDK and never reads FIRECRAWL_API_KEY at runtime, so
 * the secret cannot leak into the client bundle.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  Where Firecrawl runs
 * ─────────────────────────────────────────────────────────────────────
 *  - Server-side / Node scripts only (e.g. scripts/test-firecrawl.mjs).
 *  - Never from React components, hooks, or anything in src/tabs/**.
 *  - Never under a VITE_ prefix — that would inline the key into the
 *    client bundle. The env var is exactly FIRECRAWL_API_KEY (no prefix).
 *
 * ─────────────────────────────────────────────────────────────────────
 *  What Firecrawl is allowed to touch
 * ─────────────────────────────────────────────────────────────────────
 *  ALLOWED — public landing pages already in src/data/sourceRegistry.ts:
 *    - Company IR / annual-report pages
 *    - Company press releases
 *    - NSE / BSE corporate filings
 *    - VAHAN (best-effort; see caveats below)
 *    - FADA press releases
 *    - SIAM public pages (only the headline / public sections)
 *    - Rating agency public pages (CRISIL / ICRA / CARE / India Ratings)
 *
 *  FORBIDDEN — anything in src/data/paidManualRegistry.ts:
 *    - SIAM detailed / model-wise paid reports
 *    - MarkLines, JATO, CMIE, Capitaline, Ace Equity
 *    - Bloomberg, Refinitiv (LSEG), FactSet
 *    - Any page that requires a login or paid subscription
 *
 * ─────────────────────────────────────────────────────────────────────
 *  Source-specific notes
 * ─────────────────────────────────────────────────────────────────────
 *  - VAHAN is a JS-heavy public dashboard. Firecrawl's JS rendering may
 *    pull the surface HTML, but the underlying data is fetched from
 *    internal XHR endpoints with form-state. Treat Firecrawl on VAHAN
 *    as best-effort discovery only; production refresh of registration
 *    counts will most likely need a scripted browser session that
 *    exports the official CSV, OR a manual analyst export.
 *  - SIAM public landing returns 403 to plain HTTP. Firecrawl with JS
 *    rendering is more likely to succeed but the deep statistics page
 *    (statistics.aspx) is paid; do not point Firecrawl there.
 *  - FADA monthly bulletins are PDFs with stable URLs. Once a month's
 *    PDF URL is known, Firecrawl can extract text reliably.
 *  - Company IR / press pages render mostly server-side and are the
 *    highest-yield Firecrawl targets.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  Refresh data flow (target architecture)
 * ─────────────────────────────────────────────────────────────────────
 *  1. A Node refresh script (under scripts/) calls Firecrawl with the
 *     FIRECRAWL_API_KEY from process.env.
 *  2. The script normalises results into DataQualityRecord[] and writes
 *     them to a versioned JSON file under src/data/generated/.
 *  3. The dashboard imports the generated JSON at build time. The
 *     browser never calls Firecrawl directly.
 *  4. Generated JSON files are committed (or attached to a CI artifact)
 *     so refresh is auditable.
 *
 *  Until that pipeline is built, the only Firecrawl entry point is the
 *  smoke test in scripts/test-firecrawl.mjs.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  Risks to keep in mind
 * ─────────────────────────────────────────────────────────────────────
 *  - Bundle leaks: never import Firecrawl client SDKs from src/.
 *  - Logging: never print Authorization headers or the raw key.
 *  - Robots / ToS: respect site terms; Firecrawl does not absolve us
 *    of compliance with each source's policy.
 *  - Rate limits: refresh scripts must back off on 429s.
 *  - Stale HTML: Firecrawl returns whatever the page renders today; we
 *    must record sourceDate in every emitted DataQualityRecord.
 */

export const FIRECRAWL_INTEGRATION_NOTES = {
  envVarName: "FIRECRAWL_API_KEY",
  // Anything that starts with VITE_ would be inlined into the client
  // bundle by Vite. The Firecrawl key MUST NOT be exposed there.
  forbiddenEnvPrefixes: ["VITE_"] as const,
  serverSideOnly: true,
  allowedSourceCategories: [
    "Company",
    "Exchange",
    "Industry",
    "Ratings",
    "Supporting",
  ] as const,
  forbiddenDomains: [
    "marklines.com",
    "jato.com",
    "cmie.com",
    "capitaline.com",
    "aceanalyser.com",
    "bloomberg.com",
    "refinitiv.com",
    "lseg.com",
    "factset.com",
  ] as const,
};
