import EmptyState from "../components/EmptyState";

export default function PaidManualData() {
  return (
    <div className="card">
      <div className="panel-title">
        <h2>Paid / Manual Data</h2>
        <small>Inputs sourced manually or from paid databases</small>
      </div>
      <EmptyState
        title="Data will be added in next step"
        hint="Anything that requires SIAM paid reports, MarkLines, JATO, CMIE, Capitaline, Ace Equity, Bloomberg, Refinitiv or FactSet will be captured here as manual entries — never auto-scraped."
      />
    </div>
  );
}
