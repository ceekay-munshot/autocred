import type { ReactNode } from "react";

interface KpiCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  footnote?: ReactNode;
  tone?: "neutral" | "info" | "positive" | "warning" | "negative";
}

export default function KpiCard({
  label,
  value,
  hint,
  footnote,
  tone = "neutral",
}: KpiCardProps) {
  return (
    <div className={`kpi kpi--${tone}`}>
      <div className="kpi__label">{label}</div>
      <div className="kpi__value">{value}</div>
      {hint && <div className="kpi__hint">{hint}</div>}
      {footnote && <div className="kpi__note">{footnote}</div>}
    </div>
  );
}
