import EmptyState from "../components/EmptyState";

export default function CompanyComparison() {
  return (
    <div className="card">
      <div className="panel-title">
        <h2>Company Comparison</h2>
        <small>Maruti · Hyundai · M&amp;M · Tata Motors PV</small>
      </div>
      <EmptyState
        title="Data will be added in next step"
        hint="Side-by-side comparison of capacity, market share, growth, margins, EV mix, SUV mix and working capital days."
      />
    </div>
  );
}
