import { getFinanceCharts, getStatistics } from "@/lib/api";
import type { MonthlyFinance } from "@/lib/types";

export default async function StatisticsPage() {
  const [stats, finance]: [Record<string, unknown>, MonthlyFinance[]] = await Promise.all([
    getStatistics().catch(() => ({} as Record<string, unknown>)),
    getFinanceCharts().catch(() => [] as MonthlyFinance[]),
  ]);

  const expenseTrend = finance.map((item) => item.expenses);
  const maxExpense = Math.max(...expenseTrend, 1);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-rose-100 bg-gradient-to-r from-rose-50 via-pink-50 to-fuchsia-50 p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-rose-700">Statistics</p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-900">LifeOS Intelligence Board</h1>
        <p className="mt-2 text-sm text-slate-600">Analytical storytelling layout with KPI tiles and trend bars.</p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Object.entries(stats)
          .slice(0, 8)
          .map(([key, value]) => (
            <div key={key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">{key.replaceAll("_", " ")}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{String(value)}</p>
            </div>
          ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Expense Pattern Bars</h2>
        <div className="mt-4 space-y-3">
          {finance.map((item) => (
            <div key={item.month}>
              <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                <span>{item.month}</span>
                <span>${item.expenses.toFixed(2)}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-rose-400" style={{ width: `${(item.expenses / maxExpense) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
