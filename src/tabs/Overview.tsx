import EmptyState from "../components/EmptyState";

export default function Overview() {
  return (
    <div className="card">
      <div className="panel-title">
        <h2>Overview</h2>
        <small>Will summarise industry + tracked OEMs.</small>
      </div>
      <EmptyState
        title="Data will be added in next step"
        hint="High-level KPIs, trend tiles and headline charts will be added once the underlying data tabs are populated."
      />
    </div>
  );
}
