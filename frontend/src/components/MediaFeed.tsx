"use client";

import { useEffect, useMemo, useState } from "react";
import type { MediaLog } from "@/lib/types";

interface MediaFeedProps {
    media: MediaLog[];
}

function StarRating({ rating }: { rating: number | null }) {
    if (rating === null) return <span className="text-xs text-gray-600">—</span>;

    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
        <span className="text-xs">
            {"★".repeat(fullStars)}
            {halfStar && "½"}
            {"☆".repeat(emptyStars)}
        </span>
    );
}

function mediaTypeIcon(type: string): string {
    switch (type) {
        case "movie": return "🎬";
        case "song": return "🎵";
        case "show": return "📺";
        default: return "📄";
    }
}

export default function MediaFeed({ media }: MediaFeedProps) {
    const [posters, setPosters] = useState<Record<string, string>>({});

    const movieTitles = useMemo(
        () => media.filter((item) => item.media_type === "movie").map((item) => item.title),
        [media]
    );

    useEffect(() => {
        const loadPosters = async () => {
            const entries = await Promise.all(
                movieTitles.map(async (title) => {
                    try {
                        const response = await fetch(
                            `https://itunes.apple.com/search?term=${encodeURIComponent(title)}&entity=movie&limit=1`
                        );
                        const data = await response.json();
                        const art = data?.results?.[0]?.artworkUrl100 || "";
                        return [title, art] as const;
                    } catch {
                        return [title, ""] as const;
                    }
                })
            );

            setPosters(Object.fromEntries(entries));
        };

        if (movieTitles.length > 0) {
            void loadPosters();
        }
    }, [movieTitles]);

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-medium text-gray-400 mb-4">Recent Media</h3>
            <div className="space-y-0.5">
                {media.map((item, idx) => (
                    <div
                        key={item.id}
                        className={`flex items-center gap-3 py-2.5 px-3 rounded-lg ${idx % 2 === 0 ? "bg-gray-800/30" : ""
                            }`}
                    >
                        {item.media_type === "movie" ? (
                            <div className="h-12 w-9 overflow-hidden rounded bg-gray-800 shrink-0">
                                {posters[item.title] ? (
                                    <img
                                        src={posters[item.title]}
                                        alt={item.title}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-sm">🎬</div>
                                )}
                            </div>
                        ) : (
                            <span className="text-lg">{mediaTypeIcon(item.media_type)}</span>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-200 truncate">{item.title}</p>
                            <p className="text-xs text-gray-500">
                                {new Date(item.consumed_at).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </p>
                        </div>
                        <div className="text-yellow-400">
                            <StarRating rating={item.rating} />
                        </div>
                    </div>
                ))}

                {media.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No media logged yet</p>
                )}
            </div>
        </div>
    );
}
