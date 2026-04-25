import type {
  AutomationStatus,
  DataType,
  Reliability,
  RiskLevel,
  SourceType,
} from "../types/dataQuality";

type BadgeTone =
  | "neutral"
  | "info"
  | "muted"
  | "positive"
  | "negative"
  | "warning";

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  title?: string;
}

export function Badge({ label, tone = "neutral", title }: BadgeProps) {
  return (
    <span className={`badge badge--${tone}`} title={title}>
      {label}
    </span>
  );
}

// ───────────── Specialized badges driven by registry semantics ─────────────

const SOURCE_TYPE_TONE: Record<SourceType, BadgeTone> = {
  Public: "positive",
  Paid: "warning",
  Login: "info",
  Manual: "muted",
};

export function SourceTypeBadge({ value }: { value: SourceType }) {
  return <Badge label={value} tone={SOURCE_TYPE_TONE[value]} />;
}

const AUTOMATION_TONE: Record<AutomationStatus, BadgeTone> = {
  Auto: "positive",
  SemiAuto: "info",
  Manual: "muted",
  DoNotScrape: "negative",
};

export function AutomationBadge({ value }: { value: AutomationStatus }) {
  return <Badge label={value} tone={AUTOMATION_TONE[value]} />;
}

const RELIABILITY_TONE: Record<Reliability, BadgeTone> = {
  High: "positive",
  Medium: "info",
  Low: "warning",
};

export function ReliabilityBadge({ value }: { value: Reliability }) {
  return <Badge label={`${value} reliability`} tone={RELIABILITY_TONE[value]} />;
}

const RISK_TONE: Record<RiskLevel, BadgeTone> = {
  High: "negative",
  Medium: "warning",
  Low: "muted",
};

export function RiskBadge({ value }: { value: RiskLevel }) {
  return <Badge label={`${value} risk`} tone={RISK_TONE[value]} />;
}

const DATA_TYPE_TONE: Record<DataType, BadgeTone> = {
  Actual: "positive",
  Calculated: "info",
  Estimated: "warning",
  Paid: "warning",
  Manual: "muted",
  NotAvailable: "negative",
};

export function DataTypeBadge({ value }: { value: DataType }) {
  return <Badge label={value} tone={DATA_TYPE_TONE[value]} />;
}
