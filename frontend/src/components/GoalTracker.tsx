import type { Goal } from "@/lib/types";

interface GoalTrackerProps {
    goals: Goal[];
}

function barColor(progress: number): string {
    if (progress >= 80) return "bg-emerald-500";
    if (progress >= 45) return "bg-amber-500";
    return "bg-rose-500";
}

export default function GoalTracker({ goals }: GoalTrackerProps) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">Goal Tracker</h3>
                <span className="text-xs text-slate-500">This year</span>
            </div>

            <div className="space-y-4">
                {goals.map((goal) => {
                    const progress = Math.min(goal.progress_pct, 100);
                    return (
                        <div key={goal.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                            <div className="mb-1.5 flex items-center justify-between">
                                <p className="text-sm font-medium text-slate-800">{goal.title}</p>
                                <p className="text-xs text-slate-500">{progress.toFixed(1)}%</p>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                                <div className={`h-full rounded-full ${barColor(progress)}`} style={{ width: `${progress}%` }} />
                            </div>
                            <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500">
                                <span>
                                    {goal.current.toLocaleString()} / {goal.target.toLocaleString()} {goal.unit}
                                </span>
                                <span>{new Date(goal.deadline).toLocaleDateString()}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {goals.length === 0 && <p className="py-4 text-center text-sm text-slate-500">No goals yet.</p>}
        </div>
    );
}
