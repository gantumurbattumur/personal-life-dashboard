import MetricCard from "@/components/ui/MetricCard";
import { getTodaySummary } from "@/lib/api";
import Link from "next/link";

function formatSleep(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
}

export default async function DashboardPage() {
    let today;

    try {
        today = await getTodaySummary();
    } catch (error) {
        // Fallback: render error state
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 max-w-md text-center">
                    <h1 className="text-xl font-semibold text-white mb-2">
                        Cannot connect to API
                    </h1>
                    <p className="text-gray-400 text-sm mb-4">
                        Make sure the backend is running at{" "}
                        <code className="text-brand-400">http://localhost:8000</code> and
                        the database has been seeded.
                    </p>
                    <div className="text-xs text-gray-600 bg-gray-800 rounded p-3 text-left">
                        <p>docker compose up --build</p>
                        <p>docker compose exec backend alembic upgrade head</p>
                        <p>docker compose exec backend python -m app.seed</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">LifeOS Categories</h1>
                <p className="text-sm text-gray-400 mt-1">Choose a category from the menu or cards below.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Today's Steps"
                    value={today.steps.toLocaleString()}
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    }
                    trend={today.steps >= 8000 ? "up" : today.steps >= 5000 ? "flat" : "down"}
                />
                <MetricCard
                    title="Today's Spend"
                    value={`$${today.total_spent.toFixed(2)}`}
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                    }
                    trend={today.total_spent < 50 ? "up" : today.total_spent < 150 ? "flat" : "down"}
                />
                <MetricCard
                    title="Habits"
                    value={`${today.habits_done}/${today.habits_total}`}
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                    trend={
                        today.habits_done === today.habits_total
                            ? "up"
                            : today.habits_done > 0
                                ? "flat"
                                : "down"
                    }
                />
                <MetricCard
                    title="Sleep"
                    value={formatSleep(today.sleep_minutes)}
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    }
                    trend={today.sleep_minutes >= 420 ? "up" : today.sleep_minutes >= 360 ? "flat" : "down"}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                    ["Sleep", "/sleep"],
                    ["Gym", "/gym"],
                    ["Money", "/money"],
                    ["Habits", "/habits"],
                    ["Statistics", "/statistics"],
                    ["Goals", "/goals"],
                    ["Calendar", "/calendar"],
                    ["Movies", "/movies"],
                ].map(([name, href]) => (
                    <Link key={name} href={href} className="rounded-xl border border-gray-800 bg-gray-900 p-5 hover:border-brand-500/60 transition-colors">
                        <p className="text-white font-medium">{name}</p>
                        <p className="text-xs text-gray-500 mt-1">Raw upload + API data view</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
