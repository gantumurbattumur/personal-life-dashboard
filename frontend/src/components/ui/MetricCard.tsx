interface MetricCardProps {
    title: string;
    value: string | number;
    unit?: string;
    icon: React.ReactNode;
    trend?: "up" | "down" | "flat";
    color?: string;
}

export default function MetricCard({
    title,
    value,
    unit,
    icon,
    trend,
    color = "brand",
}: MetricCardProps) {
    const trendIcon =
        trend === "up" ? "↑" : trend === "down" ? "↓" : trend === "flat" ? "→" : "";

    const trendColor =
        trend === "up"
            ? "text-emerald-400"
            : trend === "down"
                ? "text-red-400"
                : "text-gray-400";

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-400">{title}</span>
                <span className="text-gray-500">{icon}</span>
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">{value}</span>
                {unit && <span className="text-sm text-gray-400">{unit}</span>}
                {trendIcon && (
                    <span className={`text-sm font-medium ${trendColor}`}>
                        {trendIcon}
                    </span>
                )}
            </div>
        </div>
    );
}
