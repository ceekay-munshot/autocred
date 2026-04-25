import EmptyState from "../components/EmptyState";

export default function Sources() {
  return (
    <div className="card">
      <div className="panel-title">
        <h2>Sources</h2>
        <small>Public references used in this dashboard</small>
      </div>
      <EmptyState
        title="Data will be added in next step"
        hint="Annual reports, investor presentations, press releases, NSE/BSE filings, VAHAN, FADA, CRISIL/ICRA/CARE/India Ratings will be listed here as we wire up each tab."
      />
    </div>
  );
}
