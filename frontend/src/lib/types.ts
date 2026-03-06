/* TypeScript interfaces mirroring Pydantic schemas */

export interface TodayDashboard {
    date: string;
    steps: number;
    sleep_minutes: number;
    resting_hr: number;
    total_spent: number;
    total_income: number;
    habits_done: number;
    habits_total: number;
}

export interface HealthMetric {
    id: string;
    date: string;
    steps: number;
    sleep_minutes: number;
    resting_hr: number;
    active_calories: number;
}

export interface MonthlyFinance {
    month: string;
    income: number;
    expenses: number;
}

export interface MapPoint {
    lat: number;
    lng: number;
    timestamp: string;
}

export interface Goal {
    id: string;
    title: string;
    target: number;
    current: number;
    unit: string;
    deadline: string;
    progress_pct: number;
}

export interface Habit {
    id: string;
    name: string;
    streak: number;
    last_completed: string | null;
    is_active: boolean;
}

export interface MediaLog {
    id: string;
    media_type: string;
    title: string;
    rating: number | null;
    consumed_at: string;
}

export interface Transaction {
    id: string;
    date: string;
    amount: number;
    category: string;
    merchant: string;
    is_expense: boolean;
}

export interface HabitCalendarDay {
    date: string;
    habits_completed: number;
}

export interface DailySummary {
    day: string;
    total_steps: number;
    sleep_minutes: number;
    resting_hr: number;
    total_spent: number;
    total_income: number;
    habits_completed: number;
}
