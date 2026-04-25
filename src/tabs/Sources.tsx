import { useMemo, useState } from "react";
import {
  SOURCE_CATEGORIES,
  SOURCE_REGISTRY,
} from "../data/sourceRegistry";
import {
  AutomationBadge,
  ReliabilityBadge,
  SourceTypeBadge,
} from "../components/Badge";

type CategoryKey = (typeof SOURCE_CATEGORIES)[number]["key"];

export default function Sources() {
  const [active, setActive] = useState<CategoryKey>("All");

  const filtered = useMemo(
    () =>
      active === "All"
        ? SOURCE_REGISTRY
        : SOURCE_REGISTRY.filter((s) => s.category === active),
    [active]
  );

  return (
    <div className="card">
      <div className="panel-title">
        <h2>
          Sources
          <span className="count-pill">{filtered.length}</span>
        </h2>
        <small>Public references permitted for use in this dashboard</small>
      </div>

      <div className="callout">
        Only public, primary or quasi-primary sources are listed here. Anything
        requiring a paid subscription, login or manual classification lives in
        the <strong>Paid / Manual Data</strong> tab.
      </div>

      <div className="filter-bar" role="tablist" aria-label="Source category">
        <span className="filter-bar__label">Category</span>
        {SOURCE_CATEGORIES.map((c) => (
          <button
            key={c.key}
            type="button"
            className={"chip" + (active === c.key ? " chip--active" : "")}
            onClick={() => setActive(c.key)}
            aria-pressed={active === c.key}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="table-wrap">
        <table className="table table--registry">
          <thead>
            <tr>
              <th>Source</th>
              <th>Category</th>
              <th>Type</th>
              <th>Used for</th>
              <th>Refresh</th>
              <th>Automation</th>
              <th>Reliability</th>
              <th>Notes</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id}>
                <td className="col-name">{s.name}</td>
                <td>{s.category}</td>
                <td>
                  <SourceTypeBadge value={s.sourceType} />
                </td>
                <td className="col-use">{s.useFor}</td>
                <td>{s.refreshFrequency}</td>
                <td>
                  <AutomationBadge value={s.automationStatus} />
                </td>
                <td>
                  <ReliabilityBadge value={s.reliability} />
                </td>
                <td className="col-notes muted">{s.notes ?? "—"}</td>
                <td className="col-link">
                  <a href={s.url} target="_blank" rel="noreferrer noopener">
                    Open ↗
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
