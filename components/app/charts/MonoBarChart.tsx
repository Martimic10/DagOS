"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  [key: string]: string | number;
}

// Serializable format hint — no functions passed from Server Components
export type TickFormat = "kilo" | "raw";

interface MonoBarChartProps {
  data: DataPoint[];
  xKey: string;
  yKey: string;
  height?: number;
  tickFormat?: TickFormat;
  showXAxis?: boolean;
  showYAxis?: boolean;
}

function formatTick(format: TickFormat, v: number): string {
  if (format === "kilo") {
    return v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v);
  }
  return String(v);
}

export function MonoBarChart({
  data,
  xKey,
  yKey,
  height = 160,
  tickFormat = "kilo",
  showXAxis = true,
  showYAxis = true,
}: MonoBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{ top: 4, right: 4, left: showYAxis ? -16 : -20, bottom: 0 }}
        barCategoryGap="30%"
      >
        <CartesianGrid
          vertical={false}
          stroke="#27272a"
          strokeDasharray="3 3"
        />
        {showXAxis && (
          <XAxis
            dataKey={xKey}
            tick={{ fill: "#52525b", fontSize: 9, fontFamily: "monospace" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
        )}
        {showYAxis && (
          <YAxis
            tick={{ fill: "#52525b", fontSize: 9, fontFamily: "monospace" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => formatTick(tickFormat, v)}
          />
        )}
        <Tooltip
          contentStyle={{
            backgroundColor: "#09090b",
            border: "1px solid #27272a",
            borderRadius: "8px",
            color: "#e4e4e7",
            fontFamily: "monospace",
            fontSize: "11px",
            padding: "6px 10px",
          }}
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
        />
        <Bar
          dataKey={yKey}
          fill="#3f3f46"
          radius={[3, 3, 0, 0]}
          activeBar={{ fill: "#a1a1aa" }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
