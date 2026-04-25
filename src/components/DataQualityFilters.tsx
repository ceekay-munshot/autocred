export type DataQualityFilterKey =
  | "All"
  | "Actual"
  | "Calculated"
  | "Estimated"
  | "PaidManual"
  | "NotAvailable"
  | "HighConfidence"
  | "MediumConfidence"
  | "LowConfidence"
  | "MissingSource";

export const DATA_QUALITY_FILTERS: {
  key: DataQualityFilterKey;
  label: string;
}[] = [
  { key: "All", label: "All" },
  { key: "Actual", label: "Actual" },
  { key: "Calculated", label: "Calculated" },
  { key: "Estimated", label: "Estimated" },
  { key: "PaidManual", label: "Paid / Manual" },
  { key: "NotAvailable", label: "Not Available" },
  { key: "HighConfidence", label: "High confidence" },
  { key: "MediumConfidence", label: "Medium confidence" },
  { key: "LowConfidence", label: "Low confidence" },
  { key: "MissingSource", label: "Missing source" },
];

interface DataQualityFiltersProps {
  active: DataQualityFilterKey;
  onChange: (key: DataQualityFilterKey) => void;
}

export default function DataQualityFilters({
  active,
  onChange,
}: DataQualityFiltersProps) {
  return (
    <div className="filter-bar" role="tablist" aria-label="Data quality filter">
      <span className="filter-bar__label">Filter</span>
      {DATA_QUALITY_FILTERS.map((f) => (
        <button
          key={f.key}
          type="button"
          className={"chip" + (active === f.key ? " chip--active" : "")}
          onClick={() => onChange(f.key)}
          aria-pressed={active === f.key}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
