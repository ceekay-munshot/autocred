/**
 * Shared data-quality and source-tracking types for the AutoCred PV
 * dashboard. Every datapoint shown in the dashboard should be traceable
 * back to one record of these shapes.
 */

export type SourceType = "Public" | "Paid" | "Login" | "Manual";

/**
 * How a value made it into the dashboard.
 *  - Actual: pulled directly from a public primary source
 *  - Calculated: derived via a formula from other Actual datapoints
 *  - Estimated: best-guess with documented assumptions
 *  - Paid: sourced from a paid database (manually entered)
 *  - Manual: keyed in by an analyst from a non-machine-readable source
 *  - NotAvailable: no reliable public source exists yet
 */
export type DataType =
  | "Actual"
  | "Calculated"
  | "Estimated"
  | "Paid"
  | "Manual"
  | "NotAvailable";

export type RefreshFrequency =
  | "Realtime"
  | "Daily"
  | "Weekly"
  | "Monthly"
  | "Quarterly"
  | "Annually"
  | "Ad-hoc";

export type AutomationStatus =
  | "Auto"
  | "SemiAuto"
  | "Manual"
  | "DoNotScrape";

export type Reliability = "High" | "Medium" | "Low";

export type RiskLevel = "High" | "Medium" | "Low";

export type SourceCategory =
  | "Company"
  | "Exchange"
  | "Industry"
  | "Ratings"
  | "Supporting";

export type Company =
  | "Maruti Suzuki"
  | "Hyundai Motor India"
  | "Mahindra & Mahindra"
  | "Tata Motors"
  | "Industry";

export interface SourceRecord {
  id: string;
  name: string;
  category: SourceCategory;
  url: string;
  sourceType: SourceType;
  useFor: string;
  refreshFrequency: RefreshFrequency;
  automationStatus: AutomationStatus;
  reliability: Reliability;
  notes?: string;
}

export interface PaidManualRecord {
  id: string;
  metricName: string;
  whyManualOrPaid: string;
  suggestedPaidSource: string;
  possiblePublicProxy?: string;
  recommendedDashboardTreatment: string;
  riskLevel: RiskLevel;
}

export interface DataQualityRecord {
  metricKey: string;
  metricName: string;
  company: Company;
  year: number | string;
  value: number | string | null;
  unit: string;
  dataType: DataType;
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  sourceDate?: string;
  confidence: Reliability;
  lastUpdated: string;
  notes?: string;
}
