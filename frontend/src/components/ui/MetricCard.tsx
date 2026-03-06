interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "flat";
}

export default function MetricCard({ title, value, unit, icon, trend }: MetricCardProps) {
  const trendLabel = trend === "up" ? "+" : trend === "down" ? "-" : "=";
  const trendClass =
    trend === "up" ? "text-emerald-600" : trend === "down" ? "text-rose-600" : "text-slate-500";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <span className="text-slate-400">{icon}</span>
      </div>
      <div className="flex items-end gap-2">
        <p className="text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
        {unit && <p className="pb-1 text-xs text-slate-500">{unit}</p>}
        {trend && <p className={`pb-1 text-xs font-semibold ${trendClass}`}>{trendLabel}</p>}
      </div>
    </div>
  );
}
