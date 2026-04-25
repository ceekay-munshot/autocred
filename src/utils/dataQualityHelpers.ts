import type {
  DataQualityRecord,
  DataType,
  Reliability,
} from "../types/dataQuality";

const DATA_TYPES: DataType[] = [
  "Actual",
  "Calculated",
  "Estimated",
  "Paid",
  "Manual",
  "NotAvailable",
];

const CONFIDENCES: Reliability[] = ["High", "Medium", "Low"];

/** A datapoint is considered stale if it hasn't been refreshed in this many days. */
export const STALENESS_THRESHOLD_DAYS = 90;

export type DataTypeSummary = Record<DataType, number>;
export type ConfidenceSummary = Record<Reliability, number>;

export function getDataTypeSummary(records: DataQualityRecord[]): DataTypeSummary {
  const seed = DATA_TYPES.reduce<DataTypeSummary>((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {} as DataTypeSummary);
  for (const r of records) seed[r.dataType] += 1;
  return seed;
}

export function getConfidenceSummary(
  records: DataQualityRecord[]
): ConfidenceSummary {
  const seed = CONFIDENCES.reduce<ConfidenceSummary>((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {} as ConfidenceSummary);
  for (const r of records) seed[r.confidence] += 1;
  return seed;
}

/**
 * Coverage by sourceId — how many distinct sources are in use and how
 * many datapoints each one is backing.
 */
export function getSourceCoverageSummary(
  records: DataQualityRecord[]
): { sourceId: string; sourceName: string; count: number }[] {
  const byId = new Map<string, { sourceName: string; count: number }>();
  for (const r of records) {
    const existing = byId.get(r.sourceId);
    if (existing) {
      existing.count += 1;
    } else {
      byId.set(r.sourceId, { sourceName: r.sourceName, count: 1 });
    }
  }
  return Array.from(byId, ([sourceId, v]) => ({ sourceId, ...v })).sort(
    (a, b) => b.count - a.count
  );
}

export function getMissingDataRecords(
  records: DataQualityRecord[]
): DataQualityRecord[] {
  return records.filter(
    (r) =>
      r.dataType === "NotAvailable" ||
      r.value === null ||
      r.value === undefined ||
      r.value === ""
  );
}

export function getPaidManualRecords(
  records: DataQualityRecord[]
): DataQualityRecord[] {
  return records.filter(
    (r) => r.dataType === "Paid" || r.dataType === "Manual"
  );
}

/** Records with no sourceUrl — treated as low confidence by rule. */
export function getMissingSourceRecords(
  records: DataQualityRecord[]
): DataQualityRecord[] {
  return records.filter((r) => !r.sourceUrl || r.sourceUrl.trim() === "");
}

export function getStaleRecords(
  records: DataQualityRecord[],
  thresholdDays: number = STALENESS_THRESHOLD_DAYS,
  now: Date = new Date()
): DataQualityRecord[] {
  const cutoff = now.getTime() - thresholdDays * 24 * 60 * 60 * 1000;
  return records.filter((r) => {
    const t = Date.parse(r.lastUpdated);
    if (Number.isNaN(t)) return true;
    return t < cutoff;
  });
}

/** "12 Apr 2026" — undefined / unparseable input renders as "—". */
export function formatLastUpdated(date: string | undefined | null): string {
  if (!date) return "—";
  const t = Date.parse(date);
  if (Number.isNaN(t)) return "—";
  return new Date(t).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Per-record quality score (0–100). Combines dataType, confidence,
 * source presence and freshness. Used to compute aggregate health later.
 */
export function getDataQualityScore(record: DataQualityRecord): number {
  const dataTypeWeight: Record<DataType, number> = {
    Actual: 50,
    Calculated: 40,
    Estimated: 25,
    Paid: 35,
    Manual: 25,
    NotAvailable: 0,
  };
  const confidenceWeight: Record<Reliability, number> = {
    High: 30,
    Medium: 18,
    Low: 8,
  };

  let score = dataTypeWeight[record.dataType] + confidenceWeight[record.confidence];

  if (record.sourceUrl && record.sourceUrl.trim() !== "") score += 10;

  const t = Date.parse(record.lastUpdated);
  if (!Number.isNaN(t)) {
    const ageDays = (Date.now() - t) / (1000 * 60 * 60 * 24);
    if (ageDays <= 30) score += 10;
    else if (ageDays <= 90) score += 5;
  }

  return Math.max(0, Math.min(100, score));
}

/** Share of records flagged High confidence (0..1). Empty array → 0. */
export function getHighConfidenceShare(records: DataQualityRecord[]): number {
  if (records.length === 0) return 0;
  const high = records.filter((r) => r.confidence === "High").length;
  return high / records.length;
}
