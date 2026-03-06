import MediaFeed from "@/components/MediaFeed";
import RawApiConsole from "@/components/category/RawApiConsole";
import { getRecentMedia } from "@/lib/api";

export default async function MoviesPage() {
    const media = await getRecentMedia().catch(() => []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Movies</h1>
            <RawApiConsole
                category="Movies"
                uploadMode="csv"
                ingestPath="/api/v1/ingest/media/csv"
                apiPath="/api/v1/dashboard/media/recent"
            />
            <MediaFeed media={media} />
        </div>
    );
}
