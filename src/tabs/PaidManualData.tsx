import { useMemo, useState } from "react";
import { PAID_MANUAL_REGISTRY } from "../data/paidManualRegistry";
import { RiskBadge } from "../components/Badge";
import type { RiskLevel } from "../types/dataQuality";

type RiskFilter = "All" | RiskLevel;

const RISK_FILTERS: { key: RiskFilter; label: string }[] = [
  { key: "All", label: "All" },
  { key: "High", label: "High risk" },
  { key: "Medium", label: "Medium risk" },
  { key: "Low", label: "Low risk" },
];

export default function PaidManualData() {
  const [active, setActive] = useState<RiskFilter>("All");

  const filtered = useMemo(
    () =>
      active === "All"
        ? PAID_MANUAL_REGISTRY
        : PAID_MANUAL_REGISTRY.filter((r) => r.riskLevel === active),
    [active]
  );

  return (
    <div className="card">
      <div className="panel-title">
        <h2>
          Paid / Manual Data
          <span className="count-pill">{filtered.length}</span>
        </h2>
        <small>Items intentionally not auto-fetched</small>
      </div>

      <div className="callout callout--warning">
        These items are intentionally <strong>not auto-scraped</strong>. They
        require a paid subscription, login access, manual classification, or
        analyst-driven estimation. Each row documents the suggested paid source,
        any acceptable public proxy, and how the dashboard should treat the
        metric until a credentialed feed is wired up.
      </div>

      <div className="filter-bar" role="tablist" aria-label="Risk level filter">
        <span className="filter-bar__label">Risk</span>
        {RISK_FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={"chip" + (active === f.key ? " chip--active" : "")}
            onClick={() => setActive(f.key)}
            aria-pressed={active === f.key}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="table-wrap">
        <table className="table table--registry">
          <thead>
            <tr>
              <th>Metric / Data item</th>
              <th>Why paid / manual</th>
              <th>Best paid source</th>
              <th>Public proxy</th>
              <th>Recommended treatment</th>
              <th>Risk</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td className="col-name">{r.metricName}</td>
                <td className="col-why">{r.whyManualOrPaid}</td>
                <td>{r.suggestedPaidSource}</td>
                <td className="muted">{r.possiblePublicProxy ?? "—"}</td>
                <td className="col-treatment">
                  {r.recommendedDashboardTreatment}
                </td>
                <td>
                  <RiskBadge value={r.riskLevel} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
