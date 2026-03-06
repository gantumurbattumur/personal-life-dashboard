"use client";

import { useMemo } from "react";
import type { HabitCalendarDay } from "@/lib/types";

interface LifeCalendarProps {
    data: HabitCalendarDay[];
    maxHabits?: number;
}

function getColor(count: number, max: number): string {
    if (count === 0 || max === 0) return "bg-gray-800";
    const ratio = count / max;
    if (ratio >= 1) return "bg-emerald-400";
    if (ratio >= 0.75) return "bg-emerald-500";
    if (ratio >= 0.5) return "bg-emerald-600";
    if (ratio >= 0.25) return "bg-emerald-700";
    return "bg-emerald-900";
}

export default function LifeCalendar({ data, maxHabits = 5 }: LifeCalendarProps) {
    const calendarData = useMemo(() => {
        // Build a map of date -> habits_completed
        const map = new Map<string, number>();
        data.forEach((d) => map.set(d.date, d.habits_completed));

        // Generate 52 weeks × 7 days (364 days back from today)
        const today = new Date();
        const days: { date: string; count: number; dayOfWeek: number }[] = [];

        for (let i = 363; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split("T")[0];
            days.push({
                date: dateStr,
                count: map.get(dateStr) || 0,
                dayOfWeek: d.getDay(),
            });
        }

        // Group into weeks (columns)
        const weeks: typeof days[] = [];
        let currentWeek: typeof days = [];

        // Pad first week
        if (days.length > 0) {
            const firstDay = days[0].dayOfWeek;
            for (let i = 0; i < firstDay; i++) {
                currentWeek.push({ date: "", count: -1, dayOfWeek: i });
            }
        }

        for (const day of days) {
            currentWeek.push(day);
            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        }
        if (currentWeek.length > 0) {
            weeks.push(currentWeek);
        }

        return weeks;
    }, [data]);

    const dayLabels = ["Sun", "", "Tue", "", "Thu", "", "Sat"];

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-medium text-gray-400 mb-4">Life Calendar</h3>
            <div className="flex gap-1 overflow-x-auto pb-2">
                {/* Day labels */}
                <div className="flex flex-col gap-1 mr-1">
                    {dayLabels.map((label, i) => (
                        <div key={i} className="h-3 w-6 text-[10px] text-gray-500 leading-3">
                            {label}
                        </div>
                    ))}
                </div>

                {/* Weeks */}
                {calendarData.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-1">
                        {week.map((day, di) => (
                            <div
                                key={`${wi}-${di}`}
                                className={`h-3 w-3 rounded-sm ${day.count < 0
                                        ? "bg-transparent"
                                        : getColor(day.count, maxHabits)
                                    }`}
                                title={
                                    day.date
                                        ? `${day.date}: ${day.count} habit${day.count !== 1 ? "s" : ""}`
                                        : ""
                                }
                            />
                        ))}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 mt-3">
                <span className="text-[10px] text-gray-500">Less</span>
                {["bg-gray-800", "bg-emerald-900", "bg-emerald-700", "bg-emerald-600", "bg-emerald-500", "bg-emerald-400"].map(
                    (color, i) => (
                        <div key={i} className={`h-3 w-3 rounded-sm ${color}`} />
                    )
                )}
                <span className="text-[10px] text-gray-500">More</span>
            </div>
        </div>
    );
}
