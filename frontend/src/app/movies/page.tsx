import MediaFeed from "@/components/MediaFeed";
import { getRecentMedia } from "@/lib/api";
import type { MediaLog } from "@/lib/types";

export default async function MoviesPage() {
    const media: MediaLog[] = await getRecentMedia().catch(() => [] as MediaLog[]);

    return (
        <div className="space-y-6">
            <section className="rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-50 via-fuchsia-50 to-pink-50 p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-purple-700">Movies</p>
                <h1 className="mt-1 text-3xl font-semibold text-slate-900">Cinematic Wall</h1>
                <p className="mt-2 text-sm text-slate-600">Poster-forward media experience inspired by modern entertainment dashboards.</p>
            </section>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs uppercase text-slate-500">Items Logged</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">{media.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs uppercase text-slate-500">Average Rating</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">
                        {media.length ? (media.reduce((sum, m) => sum + (m.rating || 0), 0) / media.length).toFixed(1) : "0.0"}
                    </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs uppercase text-slate-500">Latest Entry</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900 truncate">{media[0]?.title || "—"}</p>
                </div>
            </section>

            <MediaFeed media={media} />
        </div>
    );
}
