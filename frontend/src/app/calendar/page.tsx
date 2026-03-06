import LifeCalendar from "@/components/LifeCalendar";
import { getHabitCalendar, getHabits } from "@/lib/api";
import type { Habit, HabitCalendarDay } from "@/lib/types";

export default async function CalendarPage() {
    const [calendar, habits]: [HabitCalendarDay[], Habit[]] = await Promise.all([
        getHabitCalendar().catch(() => [] as HabitCalendarDay[]),
        getHabits().catch(() => [] as Habit[]),
    ]);

    const activeDays = calendar.filter((day) => day.habits_completed > 0).length;

    return (
        <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 via-zinc-50 to-stone-50 p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-600">Calendar</p>
                <h1 className="mt-1 text-3xl font-semibold text-slate-900">Activity Timeline</h1>
                <p className="mt-2 text-sm text-slate-600">A timeline-centric page for consistency and pattern recognition across the year.</p>
            </section>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs uppercase text-slate-500">Tracked Days</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">{calendar.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs uppercase text-slate-500">Active Days</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">{activeDays}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs uppercase text-slate-500">Habit Set</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">{habits.length}</p>
                </div>
            </section>

            <LifeCalendar data={calendar} maxHabits={Math.max(habits.length, 1)} />
        </div>
    );
}
