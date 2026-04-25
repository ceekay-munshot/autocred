interface EmptyStateProps {
  title?: string;
  hint?: string;
}

export default function EmptyState({
  title = "Data will be added in next step",
  hint = "This tab is intentionally empty for now. Content will be added incrementally.",
}: EmptyStateProps) {
  return (
    <div className="empty">
      <div className="empty__title">{title}</div>
      <div className="empty__hint">{hint}</div>
    </div>
  );
}
