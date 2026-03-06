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
                        <span className="text-lg">{mediaTypeIcon(item.media_type)}</span>
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
