"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import type { MonthlyFinance } from "@/lib/types";

interface FinanceChartProps {
    data: MonthlyFinance[];
}

function formatMonth(month: string): string {
    const [, m] = month.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months[parseInt(m, 10) - 1] || m;
}

function formatCurrency(value: number): string {
    return `$${value.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}

export default function FinanceChart({ data }: FinanceChartProps) {
    const chartData = data.map((d) => ({
        month: formatMonth(d.month),
        Income: d.income,
        Expenses: d.expenses,
    }));

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-medium text-gray-400 mb-4">Monthly Income vs Expenses</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barGap={2}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                        <XAxis
                            dataKey="month"
                            tick={{ fill: "#9ca3af", fontSize: 12 }}
                            axisLine={{ stroke: "#374151" }}
                        />
                        <YAxis
                            tick={{ fill: "#9ca3af", fontSize: 12 }}
                            axisLine={{ stroke: "#374151" }}
                            tickFormatter={(v) => `$${v}`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#111827",
                                border: "1px solid #374151",
                                borderRadius: "8px",
                                color: "#e5e7eb",
                            }}
                            formatter={(value: number) => formatCurrency(value)}
                        />
                        <Legend wrapperStyle={{ color: "#9ca3af" }} />
                        <Bar dataKey="Income" fill="#34d399" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Expenses" fill="#f87171" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
