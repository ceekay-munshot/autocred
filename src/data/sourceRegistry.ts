import type { SourceRecord } from "../types/dataQuality";

/**
 * Canonical registry of public sources permitted for use in the AutoCred
 * PV dashboard. URLs point to the official landing pages of each issuer
 * or regulator; deeper links should be resolved by the analyst at the
 * point of use to avoid registry rot.
 *
 * No paid sources here — those live in paidManualRegistry.ts.
 */
export const SOURCE_REGISTRY: SourceRecord[] = [
  // ────────────────────────── A. Company sources ──────────────────────────
  {
    id: "maruti-ir",
    name: "Maruti Suzuki — Investor Relations / Annual Reports",
    category: "Company",
    url: "https://www.marutisuzuki.com/corporate/investors",
    sourceType: "Public",
    useFor:
      "Annual reports, investor presentations, quarterly results, integrated reports.",
    refreshFrequency: "Quarterly",
    automationStatus: "SemiAuto",
    reliability: "High",
    notes: "Primary source for Maruti Suzuki standalone & consolidated financials.",
  },
  {
    id: "maruti-press",
    name: "Maruti Suzuki — Press Releases",
    category: "Company",
    url: "https://www.marutisuzuki.com/corporate/media/press-releases",
    sourceType: "Public",
    useFor:
      "Monthly wholesales, launches, capacity announcements, leadership changes.",
    refreshFrequency: "Monthly",
    automationStatus: "SemiAuto",
    reliability: "High",
  },
  {
    id: "hyundai-ir",
    name: "Hyundai Motor India — Investor Relations / Annual Reports",
    category: "Company",
    url: "https://www.hyundai.com/in/en/footer/about-us/investor-relations",
    sourceType: "Public",
    useFor:
      "Annual reports and investor presentations from FY25 onwards (post-IPO Oct 2024).",
    refreshFrequency: "Quarterly",
    automationStatus: "SemiAuto",
    reliability: "High",
    notes:
      "Pre-listing financials are limited; long-history will need DRHP/RHP and parent disclosures.",
  },
  {
    id: "hyundai-press",
    name: "Hyundai Motor India — Press Releases / Newsroom",
    category: "Company",
    url: "https://www.hyundai.com/in/en/newsroom",
    sourceType: "Public",
    useFor: "Monthly volumes, launches, exports commentary, network updates.",
    refreshFrequency: "Monthly",
    automationStatus: "SemiAuto",
    reliability: "High",
  },
  {
    id: "mm-ir",
    name: "Mahindra & Mahindra — Investor Relations / Annual Reports",
    category: "Company",
    url: "https://www.mahindra.com/investor-relations",
    sourceType: "Public",
    useFor:
      "Annual reports, investor presentations, segment reporting (Auto / Farm).",
    refreshFrequency: "Quarterly",
    automationStatus: "SemiAuto",
    reliability: "High",
    notes: "Auto segment splits PV/CV/3W; SUV mix needs careful disaggregation.",
  },
  {
    id: "mm-press",
    name: "Mahindra & Mahindra — Press Releases",
    category: "Company",
    url: "https://www.mahindra.com/news-room",
    sourceType: "Public",
    useFor: "Monthly auto sales, SUV launches, EV roadmap updates.",
    refreshFrequency: "Monthly",
    automationStatus: "SemiAuto",
    reliability: "High",
  },
  {
    id: "tata-ir",
    name: "Tata Motors — Investor Relations / Annual Reports",
    category: "Company",
    url: "https://www.tatamotors.com/investors/",
    sourceType: "Public",
    useFor:
      "Annual reports, investor presentations, JLR + India business segment data.",
    refreshFrequency: "Quarterly",
    automationStatus: "SemiAuto",
    reliability: "High",
    notes:
      "PV-only carve-out is required; consolidated includes JLR and CV. Use Tata Motors PV India presentations where available.",
  },
  {
    id: "tata-press",
    name: "Tata Motors — Press Releases",
    category: "Company",
    url: "https://www.tatamotors.com/press/",
    sourceType: "Public",
    useFor: "Monthly wholesales (PV / EV split), launches, capacity announcements.",
    refreshFrequency: "Monthly",
    automationStatus: "SemiAuto",
    reliability: "High",
  },

  // ───────────────────────── B. Exchange / Market ─────────────────────────
  {
    id: "nse-filings",
    name: "NSE — Corporate Filings & Announcements",
    category: "Exchange",
    url: "https://www.nseindia.com/companies-listing/corporate-filings-announcements",
    sourceType: "Public",
    useFor:
      "Regulatory filings, results, board meeting outcomes, shareholder communications.",
    refreshFrequency: "Daily",
    automationStatus: "SemiAuto",
    reliability: "High",
    notes: "Some NSE endpoints throttle non-browser requests; respect rate limits.",
  },
  {
    id: "bse-filings",
    name: "BSE — Corporate Announcements",
    category: "Exchange",
    url: "https://www.bseindia.com/corporates/ann.html",
    sourceType: "Public",
    useFor: "Regulatory filings, shareholding patterns, results PDFs.",
    refreshFrequency: "Daily",
    automationStatus: "SemiAuto",
    reliability: "High",
  },
  {
    id: "nse-bhavcopy",
    name: "NSE — Historical Bhavcopy / Equity History",
    category: "Exchange",
    url: "https://www.nseindia.com/all-reports",
    sourceType: "Public",
    useFor: "Historical daily closing prices, used for 31-March stock prices.",
    refreshFrequency: "Daily",
    automationStatus: "Auto",
    reliability: "High",
  },
  {
    id: "bse-history",
    name: "BSE — Historical Stock Prices",
    category: "Exchange",
    url: "https://www.bseindia.com/markets/equity/EQReports/StockPrcHistori.aspx",
    sourceType: "Public",
    useFor: "Backup historical price source, esp. for BSE-only listings.",
    refreshFrequency: "Daily",
    automationStatus: "SemiAuto",
    reliability: "High",
  },

  // ────────────────── C. Industry / Registration sources ──────────────────
  {
    id: "vahan",
    name: "VAHAN / Parivahan Dashboard",
    category: "Industry",
    url: "https://vahan.parivahan.gov.in/vahan4dashboard/",
    sourceType: "Public",
    useFor:
      "Vehicle registrations (retail proxy) by RTO, state, fuel type, vehicle class.",
    refreshFrequency: "Daily",
    automationStatus: "SemiAuto",
    reliability: "High",
    notes:
      "Registrations ≠ wholesales. Some states under-report; useful for trend not absolute.",
  },
  {
    id: "fada",
    name: "FADA — Federation of Automobile Dealers Associations",
    category: "Industry",
    url: "https://fada.in/",
    sourceType: "Public",
    useFor: "Monthly retail sales bulletins (PV, 2W, CV, 3W, Tractor).",
    refreshFrequency: "Monthly",
    automationStatus: "SemiAuto",
    reliability: "High",
    notes: "Best public proxy for retail demand; complements VAHAN.",
  },
  {
    id: "siam-public",
    name: "SIAM — Public Pages (industry summaries)",
    category: "Industry",
    url: "https://www.siam.in/",
    sourceType: "Public",
    useFor:
      "Headline industry production / domestic sales / exports volume only.",
    refreshFrequency: "Monthly",
    automationStatus: "Manual",
    reliability: "Medium",
    notes:
      "Detailed company-wise and model-wise SIAM data is paid — see paid/manual registry.",
  },

  // ─────────────────────────── D. Rating sources ──────────────────────────
  {
    id: "crisil",
    name: "CRISIL Ratings",
    category: "Ratings",
    url: "https://www.crisilratings.com/",
    sourceType: "Public",
    useFor: "Public credit rating actions and rationales for tracked OEMs.",
    refreshFrequency: "Ad-hoc",
    automationStatus: "Manual",
    reliability: "High",
  },
  {
    id: "icra",
    name: "ICRA",
    category: "Ratings",
    url: "https://www.icra.in/",
    sourceType: "Public",
    useFor: "Credit rating press releases and sectoral commentary.",
    refreshFrequency: "Ad-hoc",
    automationStatus: "Manual",
    reliability: "High",
  },
  {
    id: "care",
    name: "CARE Ratings",
    category: "Ratings",
    url: "https://www.careratings.com/",
    sourceType: "Public",
    useFor: "Credit rating actions and industry research notes.",
    refreshFrequency: "Ad-hoc",
    automationStatus: "Manual",
    reliability: "High",
  },
  {
    id: "ind-ra",
    name: "India Ratings & Research (Fitch Group)",
    category: "Ratings",
    url: "https://www.indiaratings.co.in/",
    sourceType: "Public",
    useFor: "Credit ratings and sector outlook reports.",
    refreshFrequency: "Ad-hoc",
    automationStatus: "Manual",
    reliability: "High",
  },

  // ─────────────────────── E. Public supporting sources ───────────────────
  {
    id: "company-leadership",
    name: "Company Leadership / Board Pages",
    category: "Supporting",
    url: "https://www.marutisuzuki.com/corporate/about-us/leadership-team",
    sourceType: "Public",
    useFor: "CEO / CFO / COO names, tenure, designation changes.",
    refreshFrequency: "Ad-hoc",
    automationStatus: "Manual",
    reliability: "High",
    notes:
      "Each OEM has its own leadership page; analyst should check the official site of each company.",
  },
  {
    id: "company-network",
    name: "Company Dealer / Network Pages",
    category: "Supporting",
    url: "https://www.marutisuzuki.com/channels/arena/network/dealer-locator",
    sourceType: "Public",
    useFor: "Dealer counts, NEXA / Arena / SUV channel splits, service network.",
    refreshFrequency: "Ad-hoc",
    automationStatus: "Manual",
    reliability: "Medium",
    notes:
      "Some OEMs publish exact counts only in annual reports; website locators may under-report.",
  },
  {
    id: "company-product",
    name: "Official Product Pages",
    category: "Supporting",
    url: "https://www.marutisuzuki.com/",
    sourceType: "Public",
    useFor: "Variants, prices, powertrains, on-sale status, official launches.",
    refreshFrequency: "Weekly",
    automationStatus: "SemiAuto",
    reliability: "High",
  },
  {
    id: "public-auto-portals",
    name: "Public auto portals (discovery only)",
    category: "Supporting",
    url: "https://www.team-bhp.com/",
    sourceType: "Public",
    useFor:
      "Discovering new launches and facelifts; never used as the final source for any number.",
    refreshFrequency: "Weekly",
    automationStatus: "Manual",
    reliability: "Low",
    notes:
      "Only for spotting events. Final values must be confirmed against company press releases.",
  },
];

export const SOURCE_CATEGORIES: { key: "All" | SourceRecord["category"]; label: string }[] = [
  { key: "All", label: "All" },
  { key: "Company", label: "Company" },
  { key: "Exchange", label: "Exchange" },
  { key: "Industry", label: "Industry / Registration" },
  { key: "Ratings", label: "Ratings" },
  { key: "Supporting", label: "Supporting" },
];
