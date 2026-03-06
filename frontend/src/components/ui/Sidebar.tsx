"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  { name: "Home", href: "/", icon: "⌂" },
  { name: "Sleep", href: "/sleep", icon: "🌙" },
  { name: "Gym", href: "/gym", icon: "🏋️" },
  { name: "Money", href: "/money", icon: "💳" },
  { name: "Habits", href: "/habits", icon: "✅" },
  { name: "Statistics", href: "/statistics", icon: "📊" },
  { name: "Goals", href: "/goals", icon: "🎯" },
  { name: "Calendar", href: "/calendar", icon: "📅" },
  { name: "Movies", href: "/movies", icon: "🎬" },
  { name: "Data Tools", href: "/data-tools", icon: "🧰" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`hidden lg:flex lg:flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition-all ${
        collapsed ? "w-20" : "w-72"
      }`}
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
        <div className={`items-center gap-3 ${collapsed ? "hidden" : "flex"}`}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
            L
          </div>
          <span className="text-lg font-semibold text-slate-900">LifeOS</span>
        </div>

        <div className={`${collapsed ? "flex" : "hidden"} h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white`}>
          L
        </div>

        <button
          onClick={() => setCollapsed((value) => !value)}
          className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
          aria-label="Toggle sidebar"
        >
          {collapsed ? ">" : "<"}
        </button>
      </div>

      {!collapsed && (
        <div className="px-4 py-3">
          <div className="rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-violet-50 to-pink-50 p-3">
            <p className="text-xs font-medium text-slate-700">Quick Search</p>
            <input
              placeholder="Search category"
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none"
            />
          </div>
        </div>
      )}

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              title={item.name}
              className={`flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                collapsed ? "justify-center" : "gap-3"
              } ${
                isActive
                  ? "border border-indigo-100 bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {!collapsed && item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 px-4 py-4">
        {!collapsed && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-semibold text-slate-900">Upgrade to Pro</p>
            <p className="mt-1 text-xs text-slate-500">Unlock richer insights and custom automations.</p>
            <button className="mt-3 w-full rounded-lg bg-slate-900 px-3 py-2 text-xs text-white hover:bg-slate-800">
              Upgrade now
            </button>
          </div>
        )}
        <p className="mt-3 text-center text-xs text-slate-500">LifeOS v0.2.0</p>
      </div>
    </aside>
  );
}
