import { useMemo, useState } from "react";
import { dataQualityRecords } from "../data/dataQualityRecords";
import {
  getConfidenceSummary,
  getDataTypeSummary,
  getHighConfidenceShare,
  getMissingSourceRecords,
} from "../utils/dataQualityHelpers";
import KpiCard from "../components/KpiCard";
import DataQualityTable from "../components/DataQualityTable";
import DataQualityFilters, {
  type DataQualityFilterKey,
} from "../components/DataQualityFilters";

const RULES: { label: string; body: string }[] = [
  {
    label: "Actual",
    body:
      "Directly sourced from public filings, company reports, exchange data, VAHAN/FADA, or rating agencies.",
  },
  {
    label: "Calculated",
    body: "Formula based on Actual datapoints; the formula must be stored alongside the value.",
  },
  {
    label: "Estimated",
    body:
      "Uses public proxies or assumptions and must be clearly labelled with the assumption.",
  },
  {
    label: "Paid / Manual",
    body:
      "Requires a paid subscription, login, or analyst classification. Never auto-scraped.",
  },
  {
    label: "Not Available",
    body: "No reliable source found. Tracked here so the gap is visible to the analyst.",
  },
  {
    label: "Wholesale vs retail",
    body:
      "Never mix SIAM/company wholesale data with VAHAN/FADA retail registration data without labelling it clearly.",
  },
  {
    label: "Source URL",
    body: "Any datapoint without a source URL is treated as Low confidence.",
  },
];

function filterRecords(filter: DataQualityFilterKey) {
  switch (filter) {
    case "All":
      return dataQualityRecords;
    case "Actual":
      return dataQualityRecords.filter((r) => r.dataType === "Actual");
    case "Calculated":
      return dataQualityRecords.filter((r) => r.dataType === "Calculated");
    case "Estimated":
      return dataQualityRecords.filter((r) => r.dataType === "Estimated");
    case "PaidManual":
      return dataQualityRecords.filter(
        (r) => r.dataType === "Paid" || r.dataType === "Manual"
      );
    case "NotAvailable":
      return dataQualityRecords.filter((r) => r.dataType === "NotAvailable");
    case "HighConfidence":
      return dataQualityRecords.filter((r) => r.confidence === "High");
    case "MediumConfidence":
      return dataQualityRecords.filter((r) => r.confidence === "Medium");
    case "LowConfidence":
      return dataQualityRecords.filter((r) => r.confidence === "Low");
    case "MissingSource":
      return getMissingSourceRecords(dataQualityRecords);
  }
}

const formatPct = (share: number, total: number) =>
  total === 0 ? "—" : `${Math.round(share * 100)}%`;

export default function DataQuality() {
  const [filter, setFilter] = useState<DataQualityFilterKey>("All");

  const summary = useMemo(
    () => getDataTypeSummary(dataQualityRecords),
    []
  );
  const confidence = useMemo(
    () => getConfidenceSummary(dataQualityRecords),
    []
  );
  const total = dataQualityRecords.length;
  const highShare = getHighConfidenceShare(dataQualityRecords);
  const missingSource = getMissingSourceRecords(dataQualityRecords).length;

  const visible = useMemo(() => filterRecords(filter), [filter]);

  return (
    <>
      <div className="card">
        <div className="panel-title">
          <h2>Data Quality</h2>
          <small>Provenance, classification, and confidence for every datapoint</small>
        </div>
        <div className="callout">
          This tab tracks where every dashboard datapoint comes from and how
          much weight an investor should put on it. Each tab that wires up real
          numbers appends rows to a single quality store, so this view stays
          accurate by construction.
        </div>
      </div>

      <div className="card">
        <div className="panel-title">
          <h2>Summary</h2>
          <small>Live counts derived from the quality store</small>
        </div>
        <div className="kpi-grid">
          <KpiCard label="Total datapoints" value={total} />
          <KpiCard label="Actual" value={summary.Actual} tone="positive" />
          <KpiCard label="Calculated" value={summary.Calculated} tone="info" />
          <KpiCard label="Estimated" value={summary.Estimated} tone="warning" />
          <KpiCard
            label="Paid / Manual"
            value={summary.Paid + summary.Manual}
            tone="warning"
          />
          <KpiCard
            label="Not available"
            value={summary.NotAvailable}
            tone="negative"
          />
          <KpiCard
            label="High confidence"
            value={formatPct(highShare, total)}
            hint={total === 0 ? undefined : `${confidence.High} of ${total}`}
            tone="positive"
          />
          <KpiCard
            label="Missing source"
            value={missingSource}
            tone={missingSource > 0 ? "negative" : "neutral"}
          />
        </div>
      </div>

      <div className="card">
        <div className="panel-title">
          <h2>Records</h2>
          <small>{visible.length} of {total}</small>
        </div>
        <DataQualityFilters active={filter} onChange={setFilter} />
        <DataQualityTable records={visible} />
      </div>

      <div className="card">
        <div className="panel-title">
          <h2>Data Quality Rules</h2>
          <small>How every datapoint is classified</small>
        </div>
        <ul className="rule-list">
          {RULES.map((r) => (
            <li key={r.label}>
              <span className="rule-list__label">{r.label}</span>
              <span className="rule-list__body">{r.body}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
