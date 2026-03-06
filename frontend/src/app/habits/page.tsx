import { getHabitCalendar, getHabits } from "@/lib/api";
import type { Habit, HabitCalendarDay } from "@/lib/types";

export default async function HabitsPage() {
  const [habits, calendar]: [Habit[], HabitCalendarDay[]] = await Promise.all([
    getHabits().catch(() => [] as Habit[]),
    getHabitCalendar().catch(() => [] as HabitCalendarDay[]),
  ]);

  const completedDays = calendar.filter((day) => day.habits_completed > 0).length;
  const avgStreak = habits.length ? Math.round(habits.reduce((sum, item) => sum + item.streak, 0) / habits.length) : 0;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 via-cyan-50 to-teal-50 p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-sky-700">Habits</p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-900">Consistency Board</h1>
        <p className="mt-2 text-sm text-slate-600">Behavior-centered layout with streak velocity and completion rhythm.</p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Active Habits</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{habits.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Average Streak</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{avgStreak} days</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Completed Days</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{completedDays}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Habit Lanes</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {habits.map((habit) => {
            const lane = habit.streak >= 14 ? "Strong" : habit.streak >= 7 ? "Building" : "Needs Push";
            const laneClass =
              lane === "Strong"
                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                : lane === "Building"
                ? "bg-amber-50 text-amber-700 border-amber-100"
                : "bg-rose-50 text-rose-700 border-rose-100";

            return (
              <div key={habit.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">{habit.name}</p>
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${laneClass}`}>{lane}</span>
                </div>
                <p className="text-xs text-slate-500">Streak: {habit.streak} days</p>
                <p className="mt-1 text-xs text-slate-500">Last completed: {habit.last_completed || "—"}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
