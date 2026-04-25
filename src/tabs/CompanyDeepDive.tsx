import EmptyState from "../components/EmptyState";

export default function CompanyDeepDive() {
  return (
    <div className="card">
      <div className="panel-title">
        <h2>Company Deep Dive</h2>
        <small>Single-company financial &amp; operating profile</small>
      </div>
      <EmptyState
        title="Data will be added in next step"
        hint="Per-company drill-down including capex, capacity, launches, top selling models, leadership and credit rating."
      />
    </div>
  );
}
