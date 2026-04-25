import type { DataQualityRecord } from "../types/dataQuality";

/**
 * Industry-level records for the Indian Passenger Vehicle dashboard.
 *
 * Conventions:
 *  - Each row is a DataQualityRecord with company: "Industry".
 *  - "FY26" denotes the fiscal year ended 31 March 2026.
 *  - No values are fabricated. Until an analyst-verified number lands,
 *    rows are kept as Manual / NotAvailable / Paid with explicit notes.
 *  - When a row is wired to a real value, set value, dataType (Actual /
 *    Calculated / Estimated), confidence, sourceUrl, lastUpdated.
 *
 * Why so many Manual rows in this seed:
 *  - FADA, SIAM and VAHAN all block server-side fetches (403 from their
 *    landing pages) and serve numbers via JS dashboards or paid PDFs.
 *  - The dashboard refuses to invent values, so each metric area is
 *    declared upfront with its target source — analysts can fill them
 *    in row-by-row from the linked primary source.
 */

const TARGET_YEAR = "FY26";

const today = new Date().toISOString().slice(0, 10);

export const industryRecords: DataQualityRecord[] = [
  // ─────────────── Volumes (wholesale + retail + EV + export) ───────────────
  {
    metricKey: "industry.pv.wholesale.annual",
    metricName: "PV industry wholesale (domestic) — annual",
    company: "Industry",
    year: TARGET_YEAR,
    value: null,
    unit: "units",
    dataType: "Manual",
    sourceId: "siam-public",
    sourceName: "SIAM — Public Pages (industry summaries)",
    sourceUrl: "https://www.siam.in/",
    confidence: "Low",
    lastUpdated: today,
    notes:
      "SIAM public landing page blocks server-side fetch; analyst to enter the headline annual PV domestic-sales total from the latest SIAM press release.",
  },
  {
    metricKey: "industry.pv.production.annual",
    metricName: "PV industry production — annual",
    company: "Industry",
    year: TARGET_YEAR,
    value: null,
    unit: "units",
    dataType: "Manual",
    sourceId: "siam-public",
    sourceName: "SIAM — Public Pages (industry summaries)",
    sourceUrl: "https://www.siam.in/",
    confidence: "Low",
    lastUpdated: today,
    notes:
      "Same SIAM headline release reports production. Analyst enters from press release; do not interpolate.",
  },
  {
    metricKey: "industry.pv.exports.annual",
    metricName: "PV industry exports — annual",
    company: "Industry",
    year: TARGET_YEAR,
    value: null,
    unit: "units",
    dataType: "Manual",
    sourceId: "siam-public",
    sourceName: "SIAM — Public Pages (industry summaries)",
    sourceUrl: "https://www.siam.in/",
    confidence: "Low",
    lastUpdated: today,
    notes:
      "Export volumes are usually disclosed on the SIAM public headline release alongside production / domestic.",
  },
  {
    metricKey: "industry.pv.retail.annual",
    metricName: "PV retail sales — annual",
    company: "Industry",
    year: TARGET_YEAR,
    value: null,
    unit: "units",
    dataType: "Manual",
    sourceId: "fada",
    sourceName: "FADA — Federation of Automobile Dealers Associations",
    sourceUrl: "https://fada.in/",
    confidence: "Low",
    lastUpdated: today,
    notes:
      "FADA blocks server-side fetch. Analyst pulls the annual / FY summary press release from FADA Press Releases.",
  },
  {
    metricKey: "industry.pv.registrations.annual",
    metricName: "PV registrations (VAHAN) — annual",
    company: "Industry",
    year: TARGET_YEAR,
    value: null,
    unit: "units",
    dataType: "Manual",
    sourceId: "vahan",
    sourceName: "VAHAN / Parivahan Dashboard",
    sourceUrl: "https://vahan.parivahan.gov.in/vahan4dashboard/",
    confidence: "Low",
    lastUpdated: today,
    notes:
      "VAHAN is a JS-only dashboard; needs a SemiAuto adapter (see industrySources.ts). Until then, analyst exports CSV.",
  },
  {
    metricKey: "industry.ev.pv.registrations.annual",
    metricName: "Electric PV registrations (VAHAN, fuel-wise) — annual",
    company: "Industry",
    year: TARGET_YEAR,
    value: null,
    unit: "units",
    dataType: "Manual",
    sourceId: "vahan",
    sourceName: "VAHAN / Parivahan Dashboard",
    sourceUrl: "https://vahan.parivahan.gov.in/vahan4dashboard/",
    confidence: "Low",
    lastUpdated: today,
    notes:
      "VAHAN fuel-type filter (Pure EV) gives clean PV EV registrations. Adapter not yet wired.",
  },
  {
    metricKey: "industry.ev.share.annual",
    metricName: "EV share of PV (registrations basis)",
    company: "Industry",
    year: TARGET_YEAR,
    value: null,
    unit: "%",
    dataType: "NotAvailable",
    sourceId: "vahan",
    sourceName: "VAHAN / Parivahan Dashboard",
    sourceUrl: "https://vahan.parivahan.gov.in/vahan4dashboard/",
    confidence: "Low",
    lastUpdated: today,
    notes:
      "Calculated once industry.ev.pv.registrations.annual and industry.pv.registrations.annual are filled.",
  },

  // ────────────────────── Realisation (derived) ──────────────────────
  {
    metricKey: "industry.pv.realisation.annual",
    metricName: "PV industry realisation per unit (calculated)",
    company: "Industry",
    year: TARGET_YEAR,
    value: null,
    unit: "INR / unit",
    dataType: "NotAvailable",
    sourceId: "siam-public",
    sourceName: "SIAM — Public Pages (industry summaries)",
    sourceUrl: "https://www.siam.in/",
    confidence: "Low",
    lastUpdated: today,
    notes:
      "Calculated as industry revenue / industry volume once both pieces exist; both currently Paid/Manual.",
  },

  // ──────────── Structural metrics (paid / manual by design) ────────────
  {
    metricKey: "industry.pv.capacity.annual",
    metricName: "PV industry installed capacity",
    company: "Industry",
    year: TARGET_YEAR,
    value: null,
    unit: "units",
    dataType: "Paid",
    sourceId: "industry-capacity",
    sourceName: "Paid / manual: Industry installed capacity (PV)",
    sourceUrl: "",
    confidence: "Low",
    lastUpdated: today,
    notes:
      "No clean public dataset; rebuild bottom-up from companies + estimate the unlisted residual.",
  },
  {
    metricKey: "industry.pv.utilisation.annual",
    metricName: "PV industry capacity utilisation",
    company: "Industry",
    year: TARGET_YEAR,
    value: null,
    unit: "%",
    dataType: "Paid",
    sourceId: "industry-utilisation",
    sourceName: "Paid / manual: Industry capacity utilisation (PV)",
    sourceUrl: "",
    confidence: "Low",
    lastUpdated: today,
    notes: "Derived from production / capacity; both currently Paid.",
  },
  {
    metricKey: "industry.pv.capex.annual",
    metricName: "PV industry capex",
    company: "Industry",
    year: TARGET_YEAR,
    value: null,
    unit: "INR Cr",
    dataType: "Paid",
    sourceId: "industry-capex",
    sourceName: "Paid / manual: Industry capex (PV)",
    sourceUrl: "",
    confidence: "Low",
    lastUpdated: today,
    notes: "Bottom-up from company cash-flow capex; PV-share is Estimated.",
  },
  {
    metricKey: "industry.pv.revenue.annual",
    metricName: "PV industry revenue",
    company: "Industry",
    year: TARGET_YEAR,
    value: null,
    unit: "INR Cr",
    dataType: "Paid",
    sourceId: "industry-pat",
    sourceName: "Paid / manual: Industry PV revenue / PAT",
    sourceUrl: "",
    confidence: "Low",
    lastUpdated: today,
    notes:
      "Industry PV revenue is a carve-out problem (Tata-JLR, M&M-Farm). Build bottom-up.",
  },
  {
    metricKey: "industry.pv.pat.annual",
    metricName: "PV industry PAT",
    company: "Industry",
    year: TARGET_YEAR,
    value: null,
    unit: "INR Cr",
    dataType: "Paid",
    sourceId: "industry-pat",
    sourceName: "Paid / manual: Industry PV PAT",
    sourceUrl: "",
    confidence: "Low",
    lastUpdated: today,
    notes: "Same carve-out issue as revenue.",
  },

  // ─────────────────────── Mix metrics (paid) ───────────────────────
  {
    metricKey: "industry.export.revenue.share.annual",
    metricName: "Export revenue % (industry)",
    company: "Industry",
    year: TARGET_YEAR,
    value: null,
    unit: "%",
    dataType: "Paid",
    sourceId: "export-revenue-share",
    sourceName: "Paid / manual: Export revenue % per company",
    sourceUrl: "",
    confidence: "Low",
    lastUpdated: today,
    notes: "Aggregated from company-level export revenue mix.",
  },
  {
    metricKey: "industry.ev.revenue.share.annual",
    metricName: "EV revenue % (industry)",
    company: "Industry",
    year: TARGET_YEAR,
    value: null,
    unit: "%",
    dataType: "Paid",
    sourceId: "ev-revenue-share",
    sourceName: "Paid / manual: EV revenue % per company",
    sourceUrl: "",
    confidence: "Low",
    lastUpdated: today,
    notes: "Aggregated from company-level EV revenue mix.",
  },
  {
    metricKey: "industry.suv.volume.share.annual",
    metricName: "SUV volume % (industry)",
    company: "Industry",
    year: TARGET_YEAR,
    value: null,
    unit: "%",
    dataType: "Paid",
    sourceId: "siam-model-wise",
    sourceName: "Paid / manual: SIAM model-wise PV sales",
    sourceUrl: "",
    confidence: "Low",
    lastUpdated: today,
    notes:
      "Requires SIAM model-wise data or VAHAN by model+body type; flagged Paid until VAHAN adapter lands.",
  },
  {
    metricKey: "industry.suv.revenue.share.annual",
    metricName: "SUV revenue % (industry)",
    company: "Industry",
    year: TARGET_YEAR,
    value: null,
    unit: "%",
    dataType: "Paid",
    sourceId: "suv-revenue-share",
    sourceName: "Paid / manual: SUV revenue % per company",
    sourceUrl: "",
    confidence: "Low",
    lastUpdated: today,
    notes: "Volume × realisation calc; both pieces Paid today.",
  },

  // ─────────────────────── Launches & top model ───────────────────────
  {
    metricKey: "industry.launches.new.count",
    metricName: "New PV model launches — count",
    company: "Industry",
    year: TARGET_YEAR,
    value: null,
    unit: "models",
    dataType: "Manual",
    sourceId: "company-product",
    sourceName: "Official Product Pages",
    sourceUrl: "https://www.marutisuzuki.com/",
    confidence: "Low",
    lastUpdated: today,
    notes:
      "Discovered via company press releases + product pages; classified manually.",
  },
  {
    metricKey: "industry.launches.facelift.count",
    metricName: "Facelift PV launches — count",
    company: "Industry",
    year: TARGET_YEAR,
    value: null,
    unit: "models",
    dataType: "Paid",
    sourceId: "facelift-count",
    sourceName: "Paid / manual: Facelift count classification",
    sourceUrl: "",
    confidence: "Low",
    lastUpdated: today,
    notes:
      "Facelift vs new-model-year tagging is fuzzy; needs a stored classification rule book.",
  },
  {
    metricKey: "industry.top.selling.model",
    metricName: "Top selling PV model",
    company: "Industry",
    year: TARGET_YEAR,
    value: null,
    unit: "name",
    dataType: "Paid",
    sourceId: "model-wise-top-selling",
    sourceName: "Paid / manual: Top selling model when SIAM model-wise unavailable",
    sourceUrl: "",
    confidence: "Low",
    lastUpdated: today,
    notes:
      "VAHAN by maker+model is a possible public proxy; coverage gaps exist.",
  },
];

/**
 * Industry-level "paid / manual gap" topics surfaced inside the
 * Industry tab itself (referencing entries in paidManualRegistry).
 * Kept here so the Industry tab can show its own gap card without
 * depending on the global registry shape.
 */
export const INDUSTRY_PAID_MANUAL_REFS: string[] = [
  "industry-capacity",
  "industry-utilisation",
  "industry-capex",
  "industry-pat",
  "ev-revenue-share",
  "suv-revenue-share",
  "export-revenue-share",
  "siam-model-wise",
  "model-wise-top-selling",
  "facelift-count",
];
