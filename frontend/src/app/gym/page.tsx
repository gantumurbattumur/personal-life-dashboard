import { getWorkoutDaily, getWorkoutKpi, getWorkoutSessions } from "@/lib/api";
import type { WorkoutDailySummary, WorkoutKpi, WorkoutSession } from "@/lib/types";

export default async function GymPage() {
    const [kpi, daily, sessions]: [WorkoutKpi, WorkoutDailySummary[], WorkoutSession[]] = await Promise.all([
        getWorkoutKpi(30).catch(() => ({
            days: 30,
            workouts_count: 0,
            total_duration_min: 0,
            avg_duration_min: 0,
            total_calories_burned: 0,
            consistency_pct: 0,
        } as WorkoutKpi)),
        getWorkoutDaily(14).catch(() => [] as WorkoutDailySummary[]),
        getWorkoutSessions(10).catch(() => [] as WorkoutSession[]),
    ]);

    const recentWorkout = sessions[0];
    const peakLoad = daily.length ? Math.max(...daily.map((item) => item.training_load), 0) : 0;

    return (
        <div className="space-y-6">
            <section className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-lime-50 to-green-50 p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Gym</p>
                <h1 className="mt-1 text-3xl font-semibold text-slate-900">Performance Board</h1>
                <p className="mt-2 text-sm text-slate-600">Training-focused layout: workload, movement output, and consistency pulse.</p>
            </section>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs uppercase text-slate-500">Workouts (30d)</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">{kpi.workouts_count}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs uppercase text-slate-500">Training Duration</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">{Math.round(kpi.total_duration_min / 60)}h</p>
                    <p className="mt-1 text-xs text-slate-500">Avg {Math.round(kpi.avg_duration_min)} min/session</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs uppercase text-slate-500">Training Consistency</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">{Math.round(kpi.consistency_pct)}%</p>
                    <div className="mt-2 h-2 rounded-full bg-slate-200">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, Math.max(0, kpi.consistency_pct))}%` }} />
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs uppercase text-slate-500">Calories Burned (30d)</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">{Math.round(kpi.total_calories_burned).toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs uppercase text-slate-500">Peak Daily Training Load</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">{Math.round(peakLoad)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs uppercase text-slate-500">Last Workout</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{recentWorkout?.workout_type ?? "No recent workout"}</p>
                    <p className="mt-1 text-xs text-slate-500">{recentWorkout?.duration_min ? `${recentWorkout.duration_min} min` : ""}</p>
                </div>
            </section>
        </div>
    );
}
