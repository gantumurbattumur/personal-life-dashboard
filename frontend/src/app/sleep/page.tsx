import HealthTrends from "@/components/charts/HealthTrends";
import { getHealthTrends } from "@/lib/api";
import type { HealthMetric } from "@/lib/types";

export default async function SleepPage() {
  const health: HealthMetric[] = await getHealthTrends().catch(() => [] as HealthMetric[]);

  const avgSleep =
    health.length > 0 ? Math.round(health.reduce((sum, item) => sum + item.sleep_minutes, 0) / health.length) : 0;
  const bestNight = health.reduce<HealthMetric | null>((best, item) => {
    if (!best) return item;
    return item.sleep_minutes > best.sleep_minutes ? item : best;
  }, null);
  const recoveryScore = Math.min(100, Math.round((avgSleep / 480) * 100));

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-violet-50 to-sky-50 p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-indigo-600">Sleep</p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-900">Recovery Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">A calm, rhythm-first layout focused on restoration quality and consistency.</p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Average Sleep</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{Math.floor(avgSleep / 60)}h {avgSleep % 60}m</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Best Night</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{bestNight ? `${Math.floor(bestNight.sleep_minutes / 60)}h` : "0h"}</p>
          <p className="mt-1 text-xs text-slate-500">Peak in last 30 days</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Recovery Score</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{recoveryScore}%</p>
          <div className="mt-2 h-2 rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-indigo-500" style={{ width: `${recoveryScore}%` }} />
          </div>
        </div>
      </section>

      <HealthTrends data={health} />
    </div>
  );
}
