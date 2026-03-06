import RawApiConsole from "@/components/category/RawApiConsole";
import { getStatistics } from "@/lib/api";

export default async function StatisticsPage() {
    const stats = await getStatistics().catch(() => ({}));

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Statistics</h1>
            <RawApiConsole
                category="Statistics"
                uploadMode="none"
                apiPath="/api/v1/dashboard/statistics"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(stats).map(([key, value]) => (
                    <div key={key} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                        <p className="text-xs uppercase text-gray-500">{key.replaceAll("_", " ")}</p>
                        <p className="text-xl text-white font-semibold mt-1">{String(value)}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
