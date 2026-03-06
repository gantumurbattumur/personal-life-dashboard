"use client";

import { useEffect, useMemo, useState } from "react";
import type { MediaLog } from "@/lib/types";

interface MediaFeedProps {
    media: MediaLog[];
}

function stars(rating: number | null): string {
    if (rating == null) return "—";
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? "½" : "";
    return `${"★".repeat(full)}${half}`;
}

export default function MediaFeed({ media }: MediaFeedProps) {
    const [posters, setPosters] = useState<Record<string, string>>({});

    const movieTitles = useMemo(
        () => media.filter((item) => item.media_type === "movie").map((item) => item.title),
        [media]
    );

    useEffect(() => {
        const fetchPosters = async () => {
            const pairs = await Promise.all(
                movieTitles.map(async (title) => {
                    try {
                        const response = await fetch(
                            `https://itunes.apple.com/search?term=${encodeURIComponent(title)}&entity=movie&limit=1`
                        );
                        const payload = await response.json();
                        const artwork = payload?.results?.[0]?.artworkUrl100 || "";
                        return [title, artwork] as const;
                    } catch {
                        return [title, ""] as const;
                    }
                })
            );
            setPosters(Object.fromEntries(pairs));
        };

        if (movieTitles.length > 0) {
            void fetchPosters();
        }
    }, [movieTitles]);

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">Movie Timeline</h3>
                <span className="text-xs text-slate-500">Poster rich view</span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {media.map((item) => (
                    <div key={item.id} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                        <div className="h-40 bg-slate-100">
                            {posters[item.title] ? (
                                <img src={posters[item.title]} alt={item.title} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full items-center justify-center text-5xl">🎬</div>
                            )}
                        </div>
                        <div className="p-3">
                            <p className="truncate text-sm font-medium text-slate-900">{item.title}</p>
                            <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                                <span>{new Date(item.consumed_at).toLocaleDateString()}</span>
                                <span className="font-semibold text-amber-600">{stars(item.rating)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {media.length === 0 && <p className="py-6 text-center text-sm text-slate-500">No media yet.</p>}
        </div>
    );
}
