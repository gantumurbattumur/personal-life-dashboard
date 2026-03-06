import HealthTrends from "@/components/charts/HealthTrends";
import { getHealthTrends } from "@/lib/api";
import type { HealthMetric } from "@/lib/types";

export default async function GymPage() {
    const health: HealthMetric[] = await getHealthTrends().catch(() => [] as HealthMetric[]);

    const totalCalories = health.reduce((sum, row) => sum + row.active_calories, 0);
    const avgSteps = health.length ? Math.round(health.reduce((sum, row) => sum + row.steps, 0) / health.length) : 0;
    const consistency = Math.min(
        100,
        Math.round((health.filter((row) => row.steps >= 7000).length / Math.max(health.length, 1)) * 100)
    );

    return (
        <div className="space-y-6">
            <section className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-lime-50 to-green-50 p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Gym</p>
                <h1 className="mt-1 text-3xl font-semibold text-slate-900">Performance Board</h1>
                <p className="mt-2 text-sm text-slate-600">Training-focused layout: workload, movement output, and consistency pulse.</p>
            </section>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs uppercase text-slate-500">Total Active Calories</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">{totalCalories.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs uppercase text-slate-500">Average Daily Steps</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">{avgSteps.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs uppercase text-slate-500">Training Consistency</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">{consistency}%</p>
                    <div className="mt-2 h-2 rounded-full bg-slate-200">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${consistency}%` }} />
                    </div>
                </div>
            </section>

            <HealthTrends data={health} />
        </div>
    );
}
