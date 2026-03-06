import Link from "next/link";
import MetricCard from "@/components/ui/MetricCard";
import { getStatistics, getTodaySummary } from "@/lib/api";

const CATEGORY_TILES = [
  { name: "Sleep", href: "/sleep", color: "from-indigo-50 to-violet-100", caption: "Recovery rhythms" },
  { name: "Gym", href: "/gym", color: "from-emerald-50 to-green-100", caption: "Training performance" },
  { name: "Money", href: "/money", color: "from-amber-50 to-yellow-100", caption: "Cashflow intelligence" },
  { name: "Habits", href: "/habits", color: "from-sky-50 to-cyan-100", caption: "Consistency board" },
  { name: "Statistics", href: "/statistics", color: "from-rose-50 to-pink-100", caption: "LifeOS yearly pulse" },
  { name: "Goals", href: "/goals", color: "from-orange-50 to-amber-100", caption: "Milestone planning" },
  { name: "Calendar", href: "/calendar", color: "from-slate-50 to-slate-100", caption: "Contribution timeline" },
  { name: "Movies", href: "/movies", color: "from-purple-50 to-fuchsia-100", caption: "Poster-rich media wall" },
];

function formatSleep(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return `${hours}h ${remaining}m`;
}

export default async function HomePage() {
  const [today, stats] = await Promise.all([
    getTodaySummary().catch(() => ({
      date: new Date().toISOString().split("T")[0],
      steps: 0,
      sleep_minutes: 0,
      resting_hr: 0,
      total_spent: 0,
      total_income: 0,
      habits_done: 0,
      habits_total: 5,
    })),
    getStatistics().catch(() => ({} as Record<string, unknown>)),
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-r from-indigo-50 via-violet-50 to-pink-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">LifeOS</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Daily Command Center</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              A category-first dashboard inspired by premium templates: focused modules, softer hierarchy,
              and purpose-built layouts for each life domain.
            </p>
          </div>
          <Link href="/data-tools" className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800">
            Open Data Tools
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Today Steps" value={today.steps.toLocaleString()} trend={today.steps >= 8000 ? "up" : "flat"} icon={<span>👟</span>} />
        <MetricCard title="Sleep" value={formatSleep(today.sleep_minutes)} trend={today.sleep_minutes >= 420 ? "up" : "down"} icon={<span>🌙</span>} />
        <MetricCard title="Spend" value={`$${today.total_spent.toFixed(2)}`} trend={today.total_spent < 120 ? "up" : "down"} icon={<span>💸</span>} />
        <MetricCard title="Habits" value={`${today.habits_done}/${today.habits_total}`} trend={today.habits_done > 0 ? "up" : "down"} icon={<span>✅</span>} />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-base font-semibold text-slate-900">Categories</h2>
          <p className="mt-1 text-sm text-slate-500">Each page has its own differentiated visual layout.</p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {CATEGORY_TILES.map((tile) => (
              <Link
                key={tile.name}
                href={tile.href}
                className={`rounded-xl border border-slate-200 bg-gradient-to-br ${tile.color} p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md`}
              >
                <p className="text-sm font-semibold text-slate-900">{tile.name}</p>
                <p className="mt-1 text-xs text-slate-600">{tile.caption}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Year Snapshot</h2>
          <div className="mt-4 space-y-3">
            {Object.entries(stats)
              .slice(0, 6)
              .map(([key, value]) => (
                <div key={key} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                  <span className="text-xs uppercase text-slate-500">{key.replaceAll("_", " ")}</span>
                  <span className="text-sm font-semibold text-slate-800">{String(value)}</span>
                </div>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}
