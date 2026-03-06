import { getHealthTrends } from "@/lib/api";
import HealthTrends from "@/components/charts/HealthTrends";
import MetricCard from "@/components/ui/MetricCard";
import type { HealthMetric } from "@/lib/types";

export default async function HealthPage() {
    const health: HealthMetric[] = await getHealthTrends().catch(() => [] as HealthMetric[]);

    // Compute averages
    const avg = {
        steps: health.length
            ? Math.round(health.reduce((s, d) => s + d.steps, 0) / health.length)
            : 0,
        sleep: health.length
            ? Math.round(health.reduce((s, d) => s + d.sleep_minutes, 0) / health.length)
            : 0,
        hr: health.length
            ? Math.round(health.reduce((s, d) => s + d.resting_hr, 0) / health.length)
            : 0,
        cal: health.length
            ? Math.round(health.reduce((s, d) => s + d.active_calories, 0) / health.length)
            : 0,
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Health</h1>
                <p className="text-sm text-gray-400 mt-1">30-day health overview</p>
            </div>

            {/* Averages */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Avg Steps"
                    value={avg.steps.toLocaleString()}
                    unit="/day"
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    }
                />
                <MetricCard
                    title="Avg Sleep"
                    value={`${Math.floor(avg.sleep / 60)}h ${avg.sleep % 60}m`}
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    }
                />
                <MetricCard
                    title="Avg Resting HR"
                    value={avg.hr}
                    unit="bpm"
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    }
                />
                <MetricCard
                    title="Avg Calories"
                    value={avg.cal.toLocaleString()}
                    unit="kcal"
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                        </svg>
                    }
                />
            </div>

            {/* Trend Chart */}
            <HealthTrends data={health} />

            {/* Daily Breakdown Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-medium text-gray-400 mb-4">Daily Breakdown</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-gray-400 border-b border-gray-800">
                                <th className="text-left py-2 px-3">Date</th>
                                <th className="text-right py-2 px-3">Steps</th>
                                <th className="text-right py-2 px-3">Sleep</th>
                                <th className="text-right py-2 px-3">HR</th>
                                <th className="text-right py-2 px-3">Calories</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...health].reverse().map((d) => (
                                <tr key={d.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                                    <td className="py-2 px-3 text-gray-300">
                                        {new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                    </td>
                                    <td className="text-right py-2 px-3 text-gray-200">{d.steps.toLocaleString()}</td>
                                    <td className="text-right py-2 px-3 text-gray-200">
                                        {Math.floor(d.sleep_minutes / 60)}h {d.sleep_minutes % 60}m
                                    </td>
                                    <td className="text-right py-2 px-3 text-gray-200">{d.resting_hr} bpm</td>
                                    <td className="text-right py-2 px-3 text-gray-200">{d.active_calories}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
