"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Legend,
} from "recharts";
import type { HealthMetric } from "@/lib/types";

interface HealthTrendsProps {
    data: HealthMetric[];
}

function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatSleep(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h${m > 0 ? ` ${m}m` : ""}`;
}

export default function HealthTrends({ data }: HealthTrendsProps) {
    const chartData = data.map((d) => ({
        date: formatDate(d.date),
        Steps: d.steps,
        "Sleep (hrs)": Math.round((d.sleep_minutes / 60) * 10) / 10,
        "Resting HR": d.resting_hr,
    }));

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-medium text-gray-400 mb-4">30-Day Health Trends</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                        <XAxis
                            dataKey="date"
                            tick={{ fill: "#9ca3af", fontSize: 11 }}
                            axisLine={{ stroke: "#374151" }}
                        />
                        <YAxis
                            yAxisId="left"
                            tick={{ fill: "#9ca3af", fontSize: 11 }}
                            axisLine={{ stroke: "#374151" }}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            tick={{ fill: "#9ca3af", fontSize: 11 }}
                            axisLine={{ stroke: "#374151" }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#111827",
                                border: "1px solid #374151",
                                borderRadius: "8px",
                                color: "#e5e7eb",
                            }}
                        />
                        <Legend wrapperStyle={{ color: "#9ca3af" }} />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="Steps"
                            stroke="#818cf8"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4 }}
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="Sleep (hrs)"
                            stroke="#34d399"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4 }}
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="Resting HR"
                            stroke="#f87171"
                            strokeWidth={1.5}
                            dot={false}
                            strokeDasharray="5 5"
                            activeDot={{ r: 4 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
