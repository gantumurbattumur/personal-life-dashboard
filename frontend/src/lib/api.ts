import type {
    Goal,
    Habit,
    HabitCalendarDay,
    HealthMetric,
    MapPoint,
    MediaLog,
    MonthlyFinance,
    TodayDashboard,
    Transaction,
} from "./types";

/**
 * Base URL for API calls.
 * - Server-side (SSR/RSC): API_URL env var (defaults to Docker internal network)
 * - Client-side: NEXT_PUBLIC_API_URL env var (defaults to localhost)
 */
function getBaseUrl(): string {
    if (typeof window === "undefined") {
        // Server-side
        return process.env.API_URL || "http://localhost:8000";
    }
    // Client-side
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
}

async function fetcher<T>(path: string, revalidate = 60): Promise<T> {
    const url = `${getBaseUrl()}${path}`;
    const res = await fetch(url, {
        next: { revalidate },
    });

    if (!res.ok) {
        throw new Error(`API error ${res.status}: ${url}`);
    }

    return res.json();
}

// --- Dashboard endpoints ---

export async function getTodaySummary(): Promise<TodayDashboard> {
    return fetcher<TodayDashboard>("/api/v1/dashboard/today", 30);
}

export async function getMapPoints(): Promise<MapPoint[]> {
    return fetcher<MapPoint[]>("/api/v1/dashboard/map", 120);
}

export async function getFinanceCharts(): Promise<MonthlyFinance[]> {
    return fetcher<MonthlyFinance[]>("/api/v1/dashboard/charts/finance", 300);
}

export async function getHealthTrends(): Promise<HealthMetric[]> {
    return fetcher<HealthMetric[]>("/api/v1/dashboard/charts/health", 60);
}

export async function getGoals(): Promise<Goal[]> {
    return fetcher<Goal[]>("/api/v1/dashboard/goals", 60);
}

export async function getHabits(): Promise<Habit[]> {
    return fetcher<Habit[]>("/api/v1/dashboard/habits", 30);
}

export async function getRecentMedia(): Promise<MediaLog[]> {
    return fetcher<MediaLog[]>("/api/v1/dashboard/media/recent", 120);
}

export async function getHabitCalendar(): Promise<HabitCalendarDay[]> {
    return fetcher<HabitCalendarDay[]>("/api/v1/dashboard/calendar", 300);
}

export async function getRecentTransactions(): Promise<Transaction[]> {
    return fetcher<Transaction[]>("/api/v1/dashboard/transactions/recent", 60);
}
