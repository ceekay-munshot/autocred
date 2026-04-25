import type { DataQualityRecord } from "../types/dataQuality";
import { DataTypeBadge, ReliabilityBadge } from "./Badge";
import { formatLastUpdated } from "../utils/dataQualityHelpers";
import EmptyState from "./EmptyState";

interface DataQualityTableProps {
  records: DataQualityRecord[];
  emptyTitle?: string;
  emptyHint?: string;
}

export default function DataQualityTable({
  records,
  emptyTitle = "No datapoints have been loaded yet.",
  emptyHint = "As each tab is wired to real sources, records will appear here automatically.",
}: DataQualityTableProps) {
  if (records.length === 0) {
    return <EmptyState title={emptyTitle} hint={emptyHint} />;
  }

  return (
    <div className="table-wrap">
      <table className="table table--registry">
        <thead>
          <tr>
            <th>Metric</th>
            <th>Company / Industry</th>
            <th>Year</th>
            <th>Value</th>
            <th>Unit</th>
            <th>Data type</th>
            <th>Source</th>
            <th>Confidence</th>
            <th>Last updated</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={`${r.metricKey}-${r.company}-${r.year}`}>
              <td className="col-name">{r.metricName}</td>
              <td>{r.company}</td>
              <td>{r.year}</td>
              <td>{r.value ?? "—"}</td>
              <td className="muted">{r.unit}</td>
              <td>
                <DataTypeBadge value={r.dataType} />
              </td>
              <td>
                {r.sourceUrl ? (
                  <a href={r.sourceUrl} target="_blank" rel="noreferrer noopener">
                    {r.sourceName}
                  </a>
                ) : (
                  <span className="muted">{r.sourceName || "—"}</span>
                )}
              </td>
              <td>
                <ReliabilityBadge value={r.confidence} />
              </td>
              <td className="muted">{formatLastUpdated(r.lastUpdated)}</td>
              <td className="col-notes muted">{r.notes ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
