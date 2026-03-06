"use client";

import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import type { MonthlyFinance } from "@/lib/types";

interface FinanceChartProps {
    data: MonthlyFinance[];
}

const monthLabel = (value: string) => {
    const [, m] = value.split("-");
    const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return labels[Number(m) - 1] || value;
};

export default function FinanceChart({ data }: FinanceChartProps) {
    const chartData = data.map((item) => ({
        month: monthLabel(item.month),
        income: item.income,
        expenses: item.expenses,
    }));

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">Income vs Expenses</h3>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">Monthly</span>
            </div>
            <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "#cbd5e1" }} />
                        <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "#cbd5e1" }} />
                        <Tooltip
                            contentStyle={{
                                background: "#ffffff",
                                border: "1px solid #e2e8f0",
                                borderRadius: "12px",
                                color: "#0f172a",
                            }}
                        />
                        <Legend wrapperStyle={{ color: "#64748b" }} />
                        <Bar dataKey="income" fill="#22c55e" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="expenses" fill="#fb7185" radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
