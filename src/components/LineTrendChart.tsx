import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface TrendPoint {
  year: string;
  value: number;
}

interface LineTrendChartProps {
  data: TrendPoint[];
  unit?: string;
  /** Optional formatter override; defaults to Indian-locale integers. */
  format?: (value: number) => string;
  height?: number;
}

const indianInt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const NAVY_900 = "#0f2a47";
const ACCENT_BLUE = "#2f6fb5";
const BORDER = "#e3e8ef";
const TEXT_SECONDARY = "#4a5b71";

export default function LineTrendChart({
  data,
  unit = "",
  format,
  height = 220,
}: LineTrendChartProps) {
  const fmt = format ?? ((v: number) => indianInt.format(v));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{ top: 8, right: 16, bottom: 0, left: 8 }}
      >
        <CartesianGrid stroke={BORDER} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="year"
          tick={{ fill: TEXT_SECONDARY, fontSize: 12 }}
          axisLine={{ stroke: BORDER }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: TEXT_SECONDARY, fontSize: 11 }}
          axisLine={{ stroke: BORDER }}
          tickLine={false}
          tickFormatter={(v: number) => fmt(v)}
          width={70}
        />
        <Tooltip
          formatter={(v) => {
            const n = typeof v === "number" ? v : Number(v);
            if (!Number.isFinite(n)) return String(v ?? "");
            return `${fmt(n)}${unit ? ` ${unit}` : ""}`;
          }}
          labelFormatter={(label) => `Year: ${label ?? ""}`}
          contentStyle={{
            background: "#fff",
            border: `1px solid ${BORDER}`,
            borderRadius: 4,
            fontSize: 12,
            color: NAVY_900,
          }}
          cursor={{ stroke: BORDER }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={ACCENT_BLUE}
          strokeWidth={2}
          dot={{ r: 4, fill: ACCENT_BLUE, stroke: NAVY_900, strokeWidth: 1 }}
          activeDot={{ r: 5 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
