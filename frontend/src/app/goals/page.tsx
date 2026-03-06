import GoalTracker from "@/components/GoalTracker";
import { getGoals, getHabits } from "@/lib/api";
import type { Goal, Habit } from "@/lib/types";

export default async function GoalsPage() {
  const [goals, habits]: [Goal[], Habit[]] = await Promise.all([
    getGoals().catch(() => [] as Goal[]),
    getHabits().catch(() => [] as Habit[]),
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-orange-700">Goals</p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-900">Milestone Planning Canvas</h1>
        <p className="mt-2 text-sm text-slate-600">Planning-first layout with progress, milestones, and execution habits.</p>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <GoalTracker goals={goals} />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Execution Habits</h2>
          <div className="mt-4 space-y-2">
            {habits.map((habit) => (
              <div key={habit.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                <span className="text-sm text-slate-800">{habit.name}</span>
                <span className="text-xs font-semibold text-slate-500">🔥 {habit.streak}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Milestone Timeline</h2>
        <div className="mt-4 space-y-3">
          {goals.map((goal) => (
            <div key={goal.id} className="relative rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">{goal.title}</p>
              <p className="text-xs text-slate-500">Deadline: {new Date(goal.deadline).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
