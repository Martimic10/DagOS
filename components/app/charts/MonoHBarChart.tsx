"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface DataPoint {
  name: string;
  value: number;
}

interface MonoHBarChartProps {
  data: DataPoint[];
  height?: number;
}

export function MonoHBarChart({ data, height = 220 }: MonoHBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 0, right: 4, left: 0, bottom: 0 }}
        barCategoryGap="30%"
      >
        <CartesianGrid
          horizontal={false}
          stroke="#27272a"
          strokeDasharray="3 3"
        />
        <XAxis
          type="number"
          tick={{ fill: "#52525b", fontSize: 9, fontFamily: "monospace" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={100}
          tick={{ fill: "#71717a", fontSize: 10, fontFamily: "monospace" }}
          tickLine={false}
          axisLine={false}
        />
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
        <Bar dataKey="value" radius={[0, 3, 3, 0]}>
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={index === 0 ? "#71717a" : index === 1 ? "#52525b" : "#3f3f46"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
