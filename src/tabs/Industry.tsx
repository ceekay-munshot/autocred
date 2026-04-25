import EmptyState from "../components/EmptyState";

export default function Industry() {
  return (
    <div className="card">
      <div className="panel-title">
        <h2>Industry</h2>
        <small>Volume · Revenue · Capex · Capacity · Utilisation · PAT</small>
      </div>
      <EmptyState
        title="Data will be added in next step"
        hint="Industry totals and trends across volumes, revenue, capex, capacity, utilisation and PAT will be added here."
      />
    </div>
  );
}
