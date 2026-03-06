import FinanceChart from "@/components/charts/FinanceChart";
import { getFinanceCharts, getRecentTransactions } from "@/lib/api";
import type { MonthlyFinance, Transaction } from "@/lib/types";

export default async function MoneyPage() {
    const [finance, transactions]: [MonthlyFinance[], Transaction[]] = await Promise.all([
        getFinanceCharts().catch(() => [] as MonthlyFinance[]),
        getRecentTransactions().catch(() => [] as Transaction[]),
    ]);

    const totalIncome = finance.reduce((sum, row) => sum + row.income, 0);
    const totalExpenses = finance.reduce((sum, row) => sum + row.expenses, 0);
    const net = totalIncome - totalExpenses;

    return (
        <div className="space-y-6">
            <section className="rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-50 via-yellow-50 to-lime-50 p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-700">Money</p>
                <h1 className="mt-1 text-3xl font-semibold text-slate-900">Finance Command Dashboard</h1>
                <p className="mt-2 text-sm text-slate-600">A fintech-inspired layout for spending signals, trajectory, and transaction flow.</p>
            </section>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-2">
                    <p className="text-xs uppercase text-slate-500">Net Balance</p>
                    <p className={`mt-2 text-4xl font-semibold ${net >= 0 ? "text-emerald-600" : "text-rose-600"}`}>${net.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs uppercase text-slate-500">Total Income</p>
                    <p className="mt-2 text-3xl font-semibold text-emerald-600">${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs uppercase text-slate-500">Total Expenses</p>
                    <p className="mt-2 text-3xl font-semibold text-rose-600">${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
            </section>

            <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <div className="xl:col-span-2">
                    <FinanceChart data={finance} />
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-base font-semibold text-slate-900">Quick Actions</h2>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                        {["Top up", "Send", "Request", "History"].map((label) => (
                            <button key={label} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 hover:bg-slate-100">
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold text-slate-900">Transaction History</h2>
                <div className="mt-4 space-y-2">
                    {transactions.slice(0, 12).map((item) => (
                        <div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                            <div>
                                <p className="text-sm font-medium text-slate-800">{item.merchant}</p>
                                <p className="text-xs text-slate-500">{item.category} · {new Date(item.date).toLocaleDateString()}</p>
                            </div>
                            <p className={`text-sm font-semibold ${item.is_expense ? "text-rose-600" : "text-emerald-600"}`}>
                                {item.is_expense ? "-" : "+"}${item.amount.toFixed(2)}
                            </p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
