import { getMapPoints } from "@/lib/api";
import dynamic from "next/dynamic";
import type { MapPoint } from "@/lib/types";

const WorldMap = dynamic(() => import("@/components/map/WorldMap"), {
    ssr: false,
    loading: () => (
        <div className="bg-gray-900 border border-gray-800 rounded-xl h-[calc(100vh-8rem)] flex items-center justify-center">
            <span className="text-gray-500">Loading map...</span>
        </div>
    ),
});

export default async function MapPage() {
    const points: MapPoint[] = await getMapPoints().catch(() => [] as MapPoint[]);

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold text-white">World Map</h1>
                <p className="text-sm text-gray-400 mt-1">
                    Your last {points.length} location pings
                </p>
            </div>
            <WorldMap points={points} height="calc(100vh - 10rem)" />
        </div>
    );
}
