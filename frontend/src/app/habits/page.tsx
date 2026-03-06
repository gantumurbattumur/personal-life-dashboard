import RawApiConsole from "@/components/category/RawApiConsole";
import { getHabits } from "@/lib/api";

export default async function HabitsPage() {
    const habits = await getHabits().catch(() => []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Habits</h1>
            <RawApiConsole
                category="Habits"
                uploadMode="none"
                apiPath="/api/v1/dashboard/habits"
            />

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-200 mb-3">Active Habits</h3>
                <div className="space-y-2">
                    {habits.map((habit) => (
                        <div key={habit.id} className="rounded-lg bg-gray-950 p-3">
                            <p className="text-gray-200">{habit.name}</p>
                            <p className="text-xs text-gray-500">Streak: {habit.streak} days</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
