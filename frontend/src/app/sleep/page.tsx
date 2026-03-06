import HealthTrends from "@/components/charts/HealthTrends";
import RawApiConsole from "@/components/category/RawApiConsole";
import { getHealthTrends } from "@/lib/api";

const SAMPLE_HEALTH_JSON = JSON.stringify(
    {
        data: {
            metrics: [
                {
                    name: "sleep_analysis",
                    units: "min",
                    data: [{ date: "2026-03-06 00:00:00 +0000", qty: 420 }],
                },
            ],
            workouts: [],
        },
    },
    null,
    2
);

export default async function SleepPage() {
    const health = await getHealthTrends().catch(() => []);
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Sleep</h1>
            <RawApiConsole
                category="Sleep"
                uploadMode="json"
                ingestPath="/api/v1/ingest/health"
                apiPath="/api/v1/dashboard/charts/health"
                sampleJson={SAMPLE_HEALTH_JSON}
            />
            <HealthTrends data={health} />
        </div>
    );
}
