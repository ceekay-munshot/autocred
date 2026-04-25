import type { ComponentType } from "react";
import Overview from "./Overview";
import Industry from "./Industry";
import CompanyComparison from "./CompanyComparison";
import CompanyDeepDive from "./CompanyDeepDive";
import DataQuality from "./DataQuality";
import PaidManualData from "./PaidManualData";
import Sources from "./Sources";

export type TabId =
  | "overview"
  | "industry"
  | "company-comparison"
  | "company-deep-dive"
  | "data-quality"
  | "paid-manual-data"
  | "sources";

export interface TabDef {
  id: TabId;
  label: string;
  description: string;
  Component: ComponentType;
}

export const TABS: TabDef[] = [
  {
    id: "overview",
    label: "Overview",
    description: "Snapshot of the Indian Passenger Vehicle industry and tracked OEMs.",
    Component: Overview,
  },
  {
    id: "industry",
    label: "Industry",
    description: "Industry volume, revenue, capex, capacity, utilisation, PAT.",
    Component: Industry,
  },
  {
    id: "company-comparison",
    label: "Company Comparison",
    description: "Side-by-side comparison across Maruti, Hyundai, M&M and Tata PV.",
    Component: CompanyComparison,
  },
  {
    id: "company-deep-dive",
    label: "Company Deep Dive",
    description: "Detailed company financial and operating profile.",
    Component: CompanyDeepDive,
  },
  {
    id: "data-quality",
    label: "Data Quality",
    description: "Actual vs Calculated vs Estimated vs Paid vs Not Available status of every metric.",
    Component: DataQuality,
  },
  {
    id: "paid-manual-data",
    label: "Paid / Manual Data",
    description: "Inputs that require paid sources or manual review (not auto-fetched).",
    Component: PaidManualData,
  },
  {
    id: "sources",
    label: "Sources",
    description: "Reference list of all public sources used in this dashboard.",
    Component: Sources,
  },
];
