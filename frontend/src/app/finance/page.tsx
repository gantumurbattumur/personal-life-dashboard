import { getFinanceCharts, getRecentTransactions } from "@/lib/api";
import FinanceChart from "@/components/charts/FinanceChart";

export default async function FinancePage() {
    let finance, transactions;
    try {
        [finance, transactions] = await Promise.all([
            getFinanceCharts(),
            getRecentTransactions(),
        ]);
    } catch {
        finance = [];
        transactions = [];
    }

    // Summary stats
    const totalIncome = finance.reduce((s, f) => s + f.income, 0);
    const totalExpenses = finance.reduce((s, f) => s + f.expenses, 0);
    const savings = totalIncome - totalExpenses;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Finance</h1>
                <p className="text-sm text-gray-400 mt-1">Income, expenses, and transactions</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <p className="text-sm text-gray-400">Total Income</p>
                    <p className="text-2xl font-bold text-emerald-400 mt-1">
                        ${totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <p className="text-sm text-gray-400">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-400 mt-1">
                        ${totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <p className="text-sm text-gray-400">Net Savings</p>
                    <p className={`text-2xl font-bold mt-1 ${savings >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        ${savings.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                </div>
            </div>

            {/* Chart */}
            <FinanceChart data={finance} />

            {/* Recent Transactions */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-medium text-gray-400 mb-4">Recent Transactions</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-gray-400 border-b border-gray-800">
                                <th className="text-left py-2 px-3">Date</th>
                                <th className="text-left py-2 px-3">Merchant</th>
                                <th className="text-left py-2 px-3">Category</th>
                                <th className="text-right py-2 px-3">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((txn) => (
                                <tr key={txn.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                                    <td className="py-2 px-3 text-gray-300">
                                        {new Date(txn.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                    </td>
                                    <td className="py-2 px-3 text-gray-200">{txn.merchant}</td>
                                    <td className="py-2 px-3">
                                        <span className="inline-block bg-gray-800 text-gray-300 text-xs px-2 py-0.5 rounded-full">
                                            {txn.category}
                                        </span>
                                    </td>
                                    <td className={`text-right py-2 px-3 font-medium ${txn.is_expense ? "text-red-400" : "text-emerald-400"}`}>
                                        {txn.is_expense ? "-" : "+"}${txn.amount.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
