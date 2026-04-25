import { useMemo } from "react";
import {
  industryRecords,
  INDUSTRY_PAID_MANUAL_REFS,
} from "../data/industryData";
import { PAID_MANUAL_REGISTRY } from "../data/paidManualRegistry";
import KpiCard from "../components/KpiCard";
import {
  DataTypeBadge,
  ReliabilityBadge,
  RiskBadge,
} from "../components/Badge";
import EmptyState from "../components/EmptyState";
import { formatLastUpdated } from "../utils/dataQualityHelpers";
import type { DataQualityRecord } from "../types/dataQuality";

const DASH = "—";

function findLatestActual(metricKey: string): DataQualityRecord | undefined {
  return industryRecords
    .filter(
      (r) =>
        r.metricKey === metricKey &&
        r.value !== null &&
        r.value !== undefined &&
        r.dataType !== "NotAvailable"
    )
    .sort((a, b) => String(b.year).localeCompare(String(a.year)))[0];
}

function latestKpi(metricKey: string): { value: string; hint?: string } {
  const r = findLatestActual(metricKey);
  if (!r) return { value: DASH, hint: "Not yet wired to a public source" };
  return {
    value: `${r.value} ${r.unit}`.trim(),
    hint: `${r.year} • ${r.dataType}`,
  };
}

const CHART_SECTIONS: { key: string; title: string; metricKey: string }[] = [
  {
    key: "pv-volume",
    title: "PV Industry Volume Trend",
    metricKey: "industry.pv.wholesale.annual",
  },
  {
    key: "ev-share",
    title: "EV Share Trend",
    metricKey: "industry.ev.share.annual",
  },
  {
    key: "exports",
    title: "Export Volume Trend",
    metricKey: "industry.pv.exports.annual",
  },
];

export default function Industry() {
  const totalCount = industryRecords.length;
  const paidManualCount = useMemo(
    () =>
      industryRecords.filter(
        (r) => r.dataType === "Paid" || r.dataType === "Manual"
      ).length,
    []
  );
  const notAvailableCount = useMemo(
    () => industryRecords.filter((r) => r.dataType === "NotAvailable").length,
    []
  );

  const retail = latestKpi("industry.pv.retail.annual");
  const evShare = latestKpi("industry.ev.share.annual");
  const exports = latestKpi("industry.pv.exports.annual");

  const latestSourceYear = useMemo(() => {
    const withValue = industryRecords.filter(
      (r) =>
        r.value !== null &&
        r.value !== undefined &&
        r.dataType !== "NotAvailable"
    );
    if (withValue.length === 0) return DASH;
    return withValue
      .map((r) => String(r.year))
      .sort((a, b) => b.localeCompare(a))[0];
  }, []);

  const gapItems = useMemo(
    () =>
      INDUSTRY_PAID_MANUAL_REFS.map((id) =>
        PAID_MANUAL_REGISTRY.find((p) => p.id === id)
      ).filter((x): x is NonNullable<typeof x> => Boolean(x)),
    []
  );

  return (
    <>
      <div className="card">
        <div className="panel-title">
          <h2>Industry</h2>
          <small>Indian Passenger Vehicle — wholesale, retail, EV, structural</small>
        </div>
        <div className="callout">
          This tab separates the four kinds of industry datapoints:{" "}
          <strong>wholesale</strong> (SIAM / company press), <strong>retail</strong>{" "}
          (VAHAN, FADA), <strong>calculated</strong> (e.g. EV share = EV / PV),
          and <strong>paid / manual</strong> (capacity, capex, PAT, mix-by-revenue,
          model-wise rankings). Numbers only appear once an analyst has wired
          them to a primary source — nothing is interpolated.
        </div>
      </div>

      <div className="card">
        <div className="panel-title">
          <h2>Key indicators</h2>
          <small>Latest available from public sources</small>
        </div>
        <div className="kpi-grid">
          <KpiCard
            label="PV retail (latest)"
            value={retail.value}
            hint={retail.hint}
          />
          <KpiCard
            label="EV share of PV (latest)"
            value={evShare.value}
            hint={evShare.hint}
          />
          <KpiCard
            label="PV exports (latest)"
            value={exports.value}
            hint={exports.hint}
          />
          <KpiCard
            label="Latest source year"
            value={latestSourceYear}
            hint={latestSourceYear === DASH ? "No actuals wired yet" : undefined}
          />
          <KpiCard
            label="Paid / Manual metrics"
            value={paidManualCount}
            hint={`of ${totalCount}`}
            tone={paidManualCount > 0 ? "warning" : "neutral"}
          />
          <KpiCard
            label="Not available"
            value={notAvailableCount}
            hint={`of ${totalCount}`}
            tone={notAvailableCount > 0 ? "negative" : "neutral"}
          />
        </div>
      </div>

      <div className="card">
        <div className="panel-title">
          <h2>Trends</h2>
          <small>Charts render once at least two years of actuals exist</small>
        </div>
        <div className="chart-grid">
          {CHART_SECTIONS.map((s) => {
            const latest = findLatestActual(s.metricKey);
            return (
              <div key={s.key} className="chart-card">
                <div className="chart-card__title">
                  <h3>{s.title}</h3>
                  <span className="muted">
                    {latest ? `Latest: ${latest.year}` : "Awaiting data"}
                  </span>
                </div>
                <EmptyState
                  title="Not enough data to render"
                  hint={
                    latest
                      ? "One year is wired up; trend needs at least two."
                      : "Wire the underlying metric to a primary source to see the trend."
                  }
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="panel-title">
          <h2>Industry metrics</h2>
          <small>{totalCount} tracked</small>
        </div>
        <div className="table-wrap">
          <table className="table table--registry">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Latest value</th>
                <th>Unit</th>
                <th>Latest year</th>
                <th>Data type</th>
                <th>Source</th>
                <th>Confidence</th>
                <th>Last updated</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {industryRecords.map((r) => (
                <tr key={`${r.metricKey}-${r.year}`}>
                  <td className="col-name">{r.metricName}</td>
                  <td>{r.value ?? DASH}</td>
                  <td className="muted">{r.unit}</td>
                  <td>{r.year}</td>
                  <td>
                    <DataTypeBadge value={r.dataType} />
                  </td>
                  <td>
                    {r.sourceUrl ? (
                      <a
                        href={r.sourceUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        {r.sourceName}
                      </a>
                    ) : (
                      <span className="muted">{r.sourceName}</span>
                    )}
                  </td>
                  <td>
                    <ReliabilityBadge value={r.confidence} />
                  </td>
                  <td className="muted">{formatLastUpdated(r.lastUpdated)}</td>
                  <td className="col-notes muted">{r.notes ?? DASH}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="panel-title">
          <h2>Paid / Manual gaps for Industry</h2>
          <small>Items intentionally not auto-scraped at industry level</small>
        </div>
        <div className="callout callout--warning">
          The metrics below cannot be sourced from a clean public dataset and
          are tracked centrally in the <strong>Paid / Manual Data</strong> tab.
          Each row should be filled in by an analyst from the listed paid
          source (or built bottom-up from company filings).
        </div>
        <div className="table-wrap">
          <table className="table table--registry">
            <thead>
              <tr>
                <th>Metric / Data item</th>
                <th>Why paid / manual</th>
                <th>Best paid source</th>
                <th>Public proxy</th>
                <th>Risk</th>
              </tr>
            </thead>
            <tbody>
              {gapItems.map((g) => (
                <tr key={g.id}>
                  <td className="col-name">{g.metricName}</td>
                  <td className="col-why">{g.whyManualOrPaid}</td>
                  <td>{g.suggestedPaidSource}</td>
                  <td className="muted">{g.possiblePublicProxy ?? DASH}</td>
                  <td>
                    <RiskBadge value={g.riskLevel} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
