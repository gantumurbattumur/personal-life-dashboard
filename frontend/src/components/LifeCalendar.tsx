"use client";

import { useMemo } from "react";
import type { HabitCalendarDay } from "@/lib/types";

interface LifeCalendarProps {
    data: HabitCalendarDay[];
    maxHabits?: number;
}

function heatColor(count: number, maxHabits: number): string {
    if (count <= 0 || maxHabits <= 0) return "bg-slate-100";
    const ratio = count / maxHabits;
    if (ratio >= 1) return "bg-emerald-500";
    if (ratio >= 0.75) return "bg-emerald-400";
    if (ratio >= 0.5) return "bg-emerald-300";
    if (ratio >= 0.25) return "bg-emerald-200";
    return "bg-emerald-100";
}

export default function LifeCalendar({ data, maxHabits = 5 }: LifeCalendarProps) {
    const weeks = useMemo(() => {
        const map = new Map<string, number>();
        data.forEach((item) => map.set(item.date, item.habits_completed));

        const today = new Date();
        const days: { date: string; count: number; day: number }[] = [];
        for (let i = 363; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const key = date.toISOString().split("T")[0];
            days.push({ date: key, count: map.get(key) || 0, day: date.getDay() });
        }

        const grouped: typeof days[] = [];
        let currentWeek: typeof days = [];

        for (const day of days) {
            currentWeek.push(day);
            if (currentWeek.length === 7) {
                grouped.push(currentWeek);
                currentWeek = [];
            }
        }
        if (currentWeek.length) grouped.push(currentWeek);

        return grouped;
    }, [data]);

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">Consistency Calendar</h3>
                <p className="text-xs text-slate-500">Last 52 weeks</p>
            </div>

            <div className="overflow-x-auto pb-2">
                <div className="flex gap-1">
                    {weeks.map((week, wIndex) => (
                        <div key={wIndex} className="flex flex-col gap-1">
                            {week.map((day, dIndex) => (
                                <div
                                    key={`${wIndex}-${dIndex}`}
                                    className={`h-3.5 w-3.5 rounded-sm ${heatColor(day.count, maxHabits)}`}
                                    title={`${day.date}: ${day.count} completed`}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
                <span>Less</span>
                <div className="h-3 w-3 rounded-sm bg-slate-100" />
                <div className="h-3 w-3 rounded-sm bg-emerald-100" />
                <div className="h-3 w-3 rounded-sm bg-emerald-200" />
                <div className="h-3 w-3 rounded-sm bg-emerald-300" />
                <div className="h-3 w-3 rounded-sm bg-emerald-400" />
                <div className="h-3 w-3 rounded-sm bg-emerald-500" />
                <span>More</span>
            </div>
        </div>
    );
}
