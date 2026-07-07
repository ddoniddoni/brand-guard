"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { category: "시각", count: 8 },
  { category: "OCR", count: 5 },
  { category: "날짜", count: 4 },
  { category: "브랜드", count: 3 },
  { category: "은어", count: 2 },
];

export function RiskDistributionChart() {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={data} margin={{ bottom: 0, left: -24, right: 8, top: 8 }}>
          <CartesianGrid stroke="var(--color-hairline)" vertical={false} />
          <XAxis
            axisLine={false}
            dataKey="category"
            tick={{ fill: "var(--color-muted)", fontSize: 12 }}
            tickLine={false}
          />
          <YAxis
            axisLine={false}
            tick={{ fill: "var(--color-muted)", fontSize: 12 }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              border: "1px solid var(--color-hairline)",
              borderRadius: 10,
              boxShadow: "none",
            }}
            cursor={{ fill: "var(--color-surface-soft)" }}
          />
          <Bar
            dataKey="count"
            fill="var(--color-primary)"
            name="검토 후보"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
