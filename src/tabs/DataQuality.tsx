import EmptyState from "../components/EmptyState";

export default function DataQuality() {
  return (
    <div className="card">
      <div className="panel-title">
        <h2>Data Quality</h2>
        <small>Actual · Calculated · Estimated · Paid / Manual · Not Available</small>
      </div>
      <EmptyState
        title="Data will be added in next step"
        hint="Every metric in the dashboard will be tracked here with its source classification and last-updated timestamp."
      />
    </div>
  );
}
