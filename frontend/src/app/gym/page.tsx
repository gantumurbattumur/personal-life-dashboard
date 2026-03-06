import HealthTrends from "@/components/charts/HealthTrends";
import RawApiConsole from "@/components/category/RawApiConsole";
import { getHealthTrends } from "@/lib/api";

const SAMPLE_GYM_JSON = JSON.stringify(
    {
        data: {
            metrics: [
                {
                    name: "step_count",
                    units: "count",
                    data: [{ date: "2026-03-06 00:00:00 +0000", qty: 9500 }],
                },
            ],
            workouts: [
                {
                    name: "Strength Training",
                    start: "2026-03-06 07:00:00 +0000",
                    end: "2026-03-06 08:00:00 +0000",
                    duration: 3600,
                    activeEnergy: 430,
                },
            ],
        },
    },
    null,
    2
);

export default async function GymPage() {
    const health = await getHealthTrends().catch(() => []);
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Gym</h1>
            <RawApiConsole
                category="Gym"
                uploadMode="json"
                ingestPath="/api/v1/ingest/health"
                apiPath="/api/v1/dashboard/charts/health"
                sampleJson={SAMPLE_GYM_JSON}
            />
            <HealthTrends data={health} />
        </div>
    );
}
