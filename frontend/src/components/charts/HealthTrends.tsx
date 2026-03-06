"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { HealthMetric } from "@/lib/types";

interface HealthTrendsProps {
  data: HealthMetric[];
}

const dateLabel = (value: string) => {
  const date = new Date(value);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

export default function HealthTrends({ data }: HealthTrendsProps) {
  const chartData = data.map((item) => ({
    date: dateLabel(item.date),
    steps: item.steps,
    sleep: Number((item.sleep_minutes / 60).toFixed(1)),
    hr: item.resting_hr,
  }));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">Health Trend Signals</h3>
        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">30 days</span>
      </div>
      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "#cbd5e1" }} />
            <YAxis yAxisId="left" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "#cbd5e1" }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "#cbd5e1" }} />
            <Tooltip
              contentStyle={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                color: "#0f172a",
              }}
            />
            <Legend wrapperStyle={{ color: "#64748b" }} />
            <Line yAxisId="left" type="monotone" dataKey="steps" stroke="#4f46e5" strokeWidth={2.5} dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="sleep" stroke="#0ea5e9" strokeWidth={2.5} dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="hr" stroke="#f97316" strokeWidth={2} dot={false} strokeDasharray="6 4" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
