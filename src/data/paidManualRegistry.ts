import type { PaidManualRecord } from "../types/dataQuality";

/**
 * Registry of metrics / data areas that the dashboard does NOT
 * auto-scrape. Each entry documents why the item is paid/manual,
 * the suggested paid source, any acceptable public proxy, and how
 * the dashboard should treat it until a credentialed feed exists.
 */
export const PAID_MANUAL_REGISTRY: PaidManualRecord[] = [
  // ─────────────────── Industry-level paid databases ──────────────────
  {
    id: "siam-company-historical",
    metricName: "SIAM detailed company-wise historical wholesales",
    whyManualOrPaid:
      "Detailed company-level historical PV wholesales beyond headline summaries are behind SIAM's paid report layer.",
    suggestedPaidSource: "SIAM members' / paid statistical reports",
    possiblePublicProxy:
      "Company press releases (monthly wholesales) reconciled with annual reports.",
    recommendedDashboardTreatment:
      "Rebuild company history from primary disclosures. Mark any SIAM-derived line as Paid.",
    riskLevel: "Medium",
  },
  {
    id: "siam-model-wise",
    metricName: "SIAM model-wise PV sales",
    whyManualOrPaid:
      "Model-level segmentation is part of SIAM's paid Flash / Statistical Profile reports.",
    suggestedPaidSource: "SIAM Flash Reports / Statistical Profile",
    possiblePublicProxy:
      "VAHAN registrations by maker + model; company press notes for hero models.",
    recommendedDashboardTreatment:
      "Show top-selling models from VAHAN where available; mark model-level numbers as Paid otherwise.",
    riskLevel: "High",
  },
  {
    id: "marklines",
    metricName: "MarkLines model-wise sales / production / powertrain mix",
    whyManualOrPaid:
      "MarkLines is a paid global automotive data platform; bulk model-level data requires subscription.",
    suggestedPaidSource: "MarkLines.com",
    possiblePublicProxy:
      "Company disclosures + VAHAN; partial coverage only.",
    recommendedDashboardTreatment:
      "Do not auto-scrape. Expose a manual entry slot keyed by company × model × period.",
    riskLevel: "High",
  },
  {
    id: "jato",
    metricName: "JATO model-wise pricing & specifications",
    whyManualOrPaid:
      "JATO Dynamics requires a paid subscription for systematic vehicle spec & pricing data.",
    suggestedPaidSource: "JATO Dynamics",
    possiblePublicProxy:
      "Company product pages + ARAI / homologation listings (slow to update).",
    recommendedDashboardTreatment:
      "Do not auto-scrape. Allow manual override on launch records.",
    riskLevel: "Medium",
  },
  {
    id: "cmie",
    metricName: "CMIE — capex & company financial database",
    whyManualOrPaid:
      "CMIE Prowess / Economic Outlook are paid databases.",
    suggestedPaidSource: "CMIE Prowess / Economic Outlook",
    possiblePublicProxy:
      "Annual reports + investor presentations; capex from cash-flow statement.",
    recommendedDashboardTreatment:
      "Reconstruct from primary filings; mark any CMIE-only line as Paid.",
    riskLevel: "Medium",
  },
  {
    id: "capitaline",
    metricName: "Capitaline — historical financials",
    whyManualOrPaid: "Capitaline is a paid Indian financial database.",
    suggestedPaidSource: "Capitaline",
    possiblePublicProxy:
      "Company annual reports back to standalone & consolidated.",
    recommendedDashboardTreatment:
      "Use company filings; mark Capitaline-only series as Paid.",
    riskLevel: "Low",
  },
  {
    id: "ace-equity",
    metricName: "Ace Equity — historical financials",
    whyManualOrPaid: "Ace Equity is a paid financial database.",
    suggestedPaidSource: "Ace Equity",
    possiblePublicProxy: "Company annual reports.",
    recommendedDashboardTreatment:
      "Use company filings; mark Ace Equity-only series as Paid.",
    riskLevel: "Low",
  },
  {
    id: "bloomberg",
    metricName: "Bloomberg",
    whyManualOrPaid: "Bloomberg Terminal is a paid platform.",
    suggestedPaidSource: "Bloomberg Terminal / BQuant",
    possiblePublicProxy:
      "NSE / BSE for prices; company filings for fundamentals.",
    recommendedDashboardTreatment:
      "Do not auto-scrape. Manual entry only when Bloomberg is the source.",
    riskLevel: "Low",
  },
  {
    id: "refinitiv",
    metricName: "Refinitiv (LSEG)",
    whyManualOrPaid: "Refinitiv Eikon / Workspace is a paid platform.",
    suggestedPaidSource: "Refinitiv Workspace",
    possiblePublicProxy: "NSE / BSE + company filings.",
    recommendedDashboardTreatment:
      "Do not auto-scrape. Manual entry only when Refinitiv is the source.",
    riskLevel: "Low",
  },
  {
    id: "factset",
    metricName: "FactSet",
    whyManualOrPaid: "FactSet is a paid platform.",
    suggestedPaidSource: "FactSet Workstation",
    possiblePublicProxy: "Annual reports + exchange filings.",
    recommendedDashboardTreatment:
      "Do not auto-scrape. Manual entry only when FactSet is the source.",
    riskLevel: "Low",
  },

  // ─────────────────── Company-specific manual gaps ───────────────────
  {
    id: "hyundai-pre-listing",
    metricName: "Hyundai Motor India clean pre-listing financials",
    whyManualOrPaid:
      "Hyundai Motor India listed in Oct 2024; long historical financials are not on a public IR portal in standard form.",
    suggestedPaidSource: "Capitaline / Ace Equity / DRHP filings",
    possiblePublicProxy:
      "DRHP / RHP financial sections; MCA filings; parent (HMC) Korean disclosures.",
    recommendedDashboardTreatment:
      "Mark pre-FY25 lines as Manual with sourceDate referencing the DRHP page.",
    riskLevel: "High",
  },

  // ────────── Mix metrics that need manual classification ─────────────
  {
    id: "ev-revenue-share",
    metricName: "EV revenue % (per company)",
    whyManualOrPaid:
      "Most OEMs disclose EV volumes but not EV revenue separately in the financials.",
    suggestedPaidSource:
      "Equity research notes / management commentary on calls.",
    possiblePublicProxy:
      "EV volumes × estimated realisation, derived as Calculated with assumption notes.",
    recommendedDashboardTreatment:
      "Show as Calculated where the assumption is documented; otherwise Manual.",
    riskLevel: "Medium",
  },
  {
    id: "suv-revenue-share",
    metricName: "SUV revenue % (per company)",
    whyManualOrPaid:
      "SUV mix is usually disclosed in volumes; revenue split needs realisation assumptions.",
    suggestedPaidSource: "Sell-side research; JATO pricing.",
    possiblePublicProxy:
      "SUV volumes × segment realisation from investor presentations.",
    recommendedDashboardTreatment:
      "Derive as Calculated with a clearly stored assumption.",
    riskLevel: "Medium",
  },
  {
    id: "export-revenue-share",
    metricName: "Export revenue % (per company)",
    whyManualOrPaid:
      "Companies disclose export volumes consistently; export revenue split is not always explicit.",
    suggestedPaidSource:
      "Annual report segment notes; analyst meet transcripts.",
    possiblePublicProxy:
      "Export volumes × export realisation from MD&A; mark assumption.",
    recommendedDashboardTreatment: "Calculated with documented assumption.",
    riskLevel: "Medium",
  },

  // ────────────── Industry-level structural gaps ──────────────────────
  {
    id: "industry-capacity",
    metricName: "Industry installed capacity (PV)",
    whyManualOrPaid:
      "No single public dataset tracks total Indian PV installed capacity reliably.",
    suggestedPaidSource: "CRISIL / ICRA industry reports; IBEF deep-dives.",
    possiblePublicProxy:
      "Sum of company-disclosed plant capacities + estimate for unlisted players.",
    recommendedDashboardTreatment:
      "Build bottom-up from companies; mark the residual as Estimated.",
    riskLevel: "High",
  },
  {
    id: "industry-utilisation",
    metricName: "Industry capacity utilisation (PV)",
    whyManualOrPaid:
      "Derived from capacity, which is itself partly Estimated.",
    suggestedPaidSource: "CRISIL / ICRA industry notes.",
    possiblePublicProxy:
      "Industry production / Industry capacity once both are computed.",
    recommendedDashboardTreatment:
      "Show as Calculated with both numerator and denominator quality flags.",
    riskLevel: "High",
  },
  {
    id: "industry-capex",
    metricName: "Industry capex (PV)",
    whyManualOrPaid:
      "Aggregate PV-only capex is not directly disclosed by SIAM publicly.",
    suggestedPaidSource: "CRISIL / ICRA / CARE industry research.",
    possiblePublicProxy:
      "Sum of company capex (PV-attributable share) from cash-flow statements.",
    recommendedDashboardTreatment:
      "Calculated bottom-up; flag PV vs non-PV split as Estimated.",
    riskLevel: "Medium",
  },
  {
    id: "industry-pat",
    metricName: "Industry PAT (PV)",
    whyManualOrPaid:
      "PV-only PAT is a carve-out problem for Tata (JLR), M&M (Farm), etc.",
    suggestedPaidSource:
      "Sell-side aggregations; CRISIL / ICRA sector reports.",
    possiblePublicProxy:
      "Sum of PV-only PAT after analyst-driven segment carve-outs.",
    recommendedDashboardTreatment:
      "Calculated; explicitly document each carve-out assumption.",
    riskLevel: "High",
  },
  {
    id: "model-wise-top-selling",
    metricName: "Top-selling models when SIAM/model source unavailable",
    whyManualOrPaid:
      "Public model-wise rankings are partial; full ranking is paid via SIAM.",
    suggestedPaidSource: "SIAM model-wise reports / MarkLines.",
    possiblePublicProxy:
      "VAHAN model-wise registrations + company highlights.",
    recommendedDashboardTreatment:
      "Use VAHAN-derived ranking; mark gaps as Paid where VAHAN coverage is weak.",
    riskLevel: "Medium",
  },
  {
    id: "facelift-count",
    metricName: "Facelift count where official tagging is unclear",
    whyManualOrPaid:
      "Companies don't always label a refresh as 'facelift' vs 'new model year'.",
    suggestedPaidSource: "JATO / MarkLines lifecycle data.",
    possiblePublicProxy:
      "Press releases + product page diffs; analyst classification.",
    recommendedDashboardTreatment:
      "Manual classification with a stored rule book; mark each row's classifier.",
    riskLevel: "Low",
  },
];
