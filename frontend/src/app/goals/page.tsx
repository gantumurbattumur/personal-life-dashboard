import { getGoals, getHabits, getHabitCalendar } from "@/lib/api";
import GoalTracker from "@/components/GoalTracker";
import LifeCalendar from "@/components/LifeCalendar";

export default async function GoalsPage() {
    let goals, habits, calendar;
    try {
        [goals, habits, calendar] = await Promise.all([
            getGoals(),
            getHabits(),
            getHabitCalendar(),
        ]);
    } catch {
        goals = [];
        habits = [];
        calendar = [];
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Goals & Habits</h1>
                <p className="text-sm text-gray-400 mt-1">Track your yearly goals and daily habits</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Goals */}
                <GoalTracker goals={goals} />

                {/* Habits */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <h3 className="text-sm font-medium text-gray-400 mb-4">Active Habits</h3>
                    <div className="space-y-3">
                        {habits.map((habit) => {
                            const isCompletedToday =
                                habit.last_completed === new Date().toISOString().split("T")[0];
                            return (
                                <div
                                    key={habit.id}
                                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-800/30"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-3 h-3 rounded-full ${isCompletedToday ? "bg-emerald-400" : "bg-gray-600"
                                                }`}
                                        />
                                        <span className="text-sm text-gray-200">{habit.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400">
                                            🔥 {habit.streak} day{habit.streak !== 1 ? "s" : ""}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}

                        {habits.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4">
                                No active habits
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Life Calendar */}
            <LifeCalendar data={calendar} maxHabits={habits.length || 5} />
        </div>
    );
}
