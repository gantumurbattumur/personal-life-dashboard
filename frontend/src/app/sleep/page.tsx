import { getRecoveryDaily, getSleepDaily } from "@/lib/api";
import type { RecoveryDaily, SleepDailySummary } from "@/lib/types";

export default async function SleepPage() {
    const sleepDaily: SleepDailySummary[] = await getSleepDaily(30).catch(() => [] as SleepDailySummary[]);
    const recoveryDaily: RecoveryDaily[] = await getRecoveryDaily(30).catch(() => [] as RecoveryDaily[]);

    const avgSleep =
        sleepDaily.length > 0 ? Math.round(sleepDaily.reduce((sum, item) => sum + item.total_sleep_min, 0) / sleepDaily.length) : 0;
    const bestNight = sleepDaily.reduce<SleepDailySummary | null>((best, item) => {
        if (!best) return item;
        return item.total_sleep_min > best.total_sleep_min ? item : best;
    }, null);
    const latestRecovery = recoveryDaily[0]?.recovery_score ?? 0;
    const latestSleepScore = sleepDaily[0]?.sleep_score ?? 0;
    const latestEfficiency = sleepDaily[0]?.sleep_efficiency ?? 0;
    const deepRemTotal = sleepDaily[0] ? sleepDaily[0].deep_sleep_min + sleepDaily[0].rem_sleep_min : 0;

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
                    <p className="mt-2 text-3xl font-semibold text-slate-900">{bestNight ? `${Math.floor(bestNight.total_sleep_min / 60)}h` : "0h"}</p>
                    <p className="mt-1 text-xs text-slate-500">Peak in last 30 days</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs uppercase text-slate-500">Recovery Score</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">{Math.round(latestRecovery)}%</p>
                    <div className="mt-2 h-2 rounded-full bg-slate-200">
                        <div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.min(100, Math.max(0, latestRecovery))}%` }} />
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs uppercase text-slate-500">Last Night Sleep Score</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">{Math.round(latestSleepScore)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs uppercase text-slate-500">Sleep Efficiency</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">{Math.round(latestEfficiency)}%</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs uppercase text-slate-500">Deep + REM</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">{Math.floor(deepRemTotal / 60)}h {deepRemTotal % 60}m</p>
                </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase text-slate-500">Recovery Explanation</p>
                <p className="mt-3 text-sm text-slate-700">{recoveryDaily[0]?.explanation ?? "No recovery explanation available yet."}</p>
            </section>
        </div>
    );
}
