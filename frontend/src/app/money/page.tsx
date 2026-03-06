import FinanceChart from "@/components/charts/FinanceChart";
import RawApiConsole from "@/components/category/RawApiConsole";
import { getFinanceCharts, getRecentTransactions } from "@/lib/api";

export default async function MoneyPage() {
    const [finance, transactions] = await Promise.all([
        getFinanceCharts().catch(() => []),
        getRecentTransactions().catch(() => []),
    ]);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Money</h1>
            <RawApiConsole
                category="Money"
                uploadMode="csv"
                ingestPath="/api/v1/ingest/finance/csv"
                apiPath="/api/v1/dashboard/charts/finance"
            />
            <FinanceChart data={finance} />

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-200 mb-3">Recent Transactions</h3>
                <div className="space-y-2">
                    {transactions.slice(0, 12).map((item) => (
                        <div key={item.id} className="flex items-center justify-between rounded-lg bg-gray-950 px-3 py-2 text-sm">
                            <div>
                                <p className="text-gray-200">{item.merchant}</p>
                                <p className="text-xs text-gray-500">{item.category}</p>
                            </div>
                            <p className={item.is_expense ? "text-red-400" : "text-emerald-400"}>
                                {item.is_expense ? "-" : "+"}${item.amount.toFixed(2)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
