import LifeCalendar from "@/components/LifeCalendar";
import RawApiConsole from "@/components/category/RawApiConsole";
import { getHabitCalendar, getHabits } from "@/lib/api";

export default async function CalendarPage() {
    const [calendar, habits] = await Promise.all([
        getHabitCalendar().catch(() => []),
        getHabits().catch(() => []),
    ]);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Calendar</h1>
            <RawApiConsole
                category="Calendar"
                uploadMode="none"
                apiPath="/api/v1/dashboard/calendar"
            />
            <LifeCalendar data={calendar} maxHabits={habits.length || 5} />
        </div>
    );
}
