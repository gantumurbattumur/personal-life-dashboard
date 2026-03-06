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

export interface SleepDailySummary {
    date: string;
    total_sleep_min: number;
    total_time_in_bed_min: number;
    deep_sleep_min: number;
    rem_sleep_min: number;
    awake_min: number;
    sleep_efficiency: number | null;
    bedtime: string | null;
    wake_time: string | null;
    bedtime_consistency_score: number;
    sleep_score: number;
}

export interface RecoveryDaily {
    date: string;
    recovery_score: number;
    sleep_component: number;
    consistency_component: number;
    training_load_component: number;
    rhr_component: number;
    hrv_component: number;
    explanation: string;
}
