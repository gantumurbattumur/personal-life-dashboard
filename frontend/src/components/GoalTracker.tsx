import type { Goal } from "@/lib/types";

interface GoalTrackerProps {
    goals: Goal[];
}

function getProgressColor(pct: number): string {
    if (pct >= 75) return "bg-emerald-500";
    if (pct >= 25) return "bg-yellow-500";
    return "bg-red-500";
}

export default function GoalTracker({ goals }: GoalTrackerProps) {
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-medium text-gray-400 mb-4">Yearly Goals</h3>
            <div className="space-y-4">
                {goals.map((goal) => (
                    <div key={goal.id}>
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm text-gray-200">{goal.title}</span>
                            <span className="text-xs text-gray-400">
                                {goal.current.toLocaleString()}/{goal.target.toLocaleString()} {goal.unit}
                            </span>
                        </div>
                        <div className="relative h-2.5 bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className={`absolute left-0 top-0 h-full rounded-full transition-all ${getProgressColor(goal.progress_pct)}`}
                                style={{ width: `${Math.min(goal.progress_pct, 100)}%` }}
                            />
                        </div>
                        <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-500">
                                Due {new Date(goal.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                            <span className="text-xs font-medium text-gray-400">
                                {goal.progress_pct}%
                            </span>
                        </div>
                    </div>
                ))}

                {goals.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No goals set yet</p>
                )}
            </div>
        </div>
    );
}
