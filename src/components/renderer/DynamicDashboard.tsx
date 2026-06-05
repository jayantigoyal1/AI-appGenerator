"use client";
import React from "react";
import type { DashboardConfig, KPIWidget, StatWidget, ActivityWidget, SummaryWidget, ChartWidget } from "@/types";
import { safeArray, safeString, safeNumber, cn } from "@/lib/utils";

// ─── KPI Card ─────────────────────────────────────────────────────────────────

const KPI_THEMES: Record<string, { bg: string; accent: string; badge: string }> = {
  blue:   { bg: "from-blue-50/80 to-sky-50/60",     accent: "text-blue-500",   badge: "bg-blue-100 text-blue-700" },
  green:  { bg: "from-emerald-50/80 to-green-50/60", accent: "text-emerald-500", badge: "bg-emerald-100 text-emerald-700" },
  purple: { bg: "from-violet-50/80 to-purple-50/60", accent: "text-violet-500", badge: "bg-violet-100 text-violet-700" },
  amber:  { bg: "from-amber-50/80 to-yellow-50/60",  accent: "text-amber-500",  badge: "bg-amber-100 text-amber-700" },
  red:    { bg: "from-rose-50/80 to-red-50/60",      accent: "text-rose-500",   badge: "bg-rose-100 text-rose-700" },
  teal:   { bg: "from-teal-50/80 to-cyan-50/60",     accent: "text-teal-500",   badge: "bg-teal-100 text-teal-700" },
};

function KPICard({ w }: { w: Record<string, unknown> }) {
  const color = safeString(w.color, "blue");
  const theme = KPI_THEMES[color] || KPI_THEMES.blue;
  const change = w.change !== undefined ? safeNumber(w.change) : undefined;
  const isPos = change !== undefined && change > 0;
  const isNeg = change !== undefined && change < 0;

  return (
    <div className={cn("glass-card border-neutral-200/80 bg-gradient-to-br p-5 flex flex-col gap-3 shadow-xs hover:shadow-sm transition-shadow", theme.bg)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-600 leading-tight">{safeString(w.title, "Metric")}</span>
        <span className={cn("w-2 h-2 rounded-full", theme.accent.replace("text-","bg-"))} />
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className="text-2xl font-bold text-neutral-800 tabular-nums leading-none">
          {safeString(w.prefix)}{safeString(w.value, "—")}{safeString(w.suffix)}
        </span>
        {change !== undefined && (
          <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap",
            isPos ? "bg-emerald-100 text-emerald-700" :
            isNeg ? "bg-rose-100 text-rose-700" :
            "bg-neutral-100 text-neutral-600"
          )}>
            {isPos ? "▲" : isNeg ? "▼" : "●"} {Math.abs(change)}%
          </span>
        )}
      </div>
      {w.changeLabel && (
        <span className="text-xs text-neutral-400">{safeString(w.changeLabel)}</span>
      )}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ w }: { w: Record<string, unknown> }) {
  return (
    <div className="glass-card border-neutral-200 bg-white p-5 flex flex-col gap-2 shadow-xs hover:shadow-sm transition-shadow">
      <span className="text-sm text-neutral-500">{safeString(w.title)}</span>
      <span className="text-2xl font-bold text-neutral-800 tabular-nums">{safeString(w.value, "—")}</span>
      {w.subtitle && <span className="text-xs text-neutral-400 leading-relaxed">{safeString(w.subtitle)}</span>}
    </div>
  );
}

// ─── Activity Card ────────────────────────────────────────────────────────────

const ACTIVITY_COLORS: Record<string, string> = {
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger:  "bg-rose-100 text-rose-700",
  default: "bg-primary-100 text-primary-700",
};

function ActivityCard({ w }: { w: Record<string, unknown> }) {
  const items = safeArray(w.items);
  return (
    <div className="glass-card border-neutral-200 bg-white p-5 shadow-xs">
      {w.title && <h3 className="text-sm font-semibold text-neutral-700 mb-4">{safeString(w.title)}</h3>}
      {items.length === 0 ? (
        <p className="text-sm text-neutral-400 text-center py-4">No activity yet</p>
      ) : (
        <div className="space-y-3">
          {items.slice(0, 6).map((item, i) => {
            const it = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
            const type = safeString(it.type, "default");
            const initials = safeString(it.user, "?").slice(0, 1).toUpperCase();
            return (
              <div key={i} className="flex items-start gap-3">
                <div className={cn("flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold", ACTIVITY_COLORS[type] || ACTIVITY_COLORS.default)}>
                  {it.user ? initials : "●"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-neutral-700 leading-snug">
                    {it.user && <span className="font-medium text-neutral-800">{safeString(it.user)} </span>}
                    <span className="text-neutral-600">{safeString(it.action, "performed an action")}</span>
                  </p>
                  {it.time && <span className="text-xs text-neutral-400">{safeString(it.time)}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Summary Card ─────────────────────────────────────────────────────────────

function SummaryCard({ w }: { w: Record<string, unknown> }) {
  const items = safeArray(w.items);
  return (
    <div className="glass-card border-neutral-200 bg-white p-5 shadow-xs">
      {w.title && <h3 className="text-sm font-semibold text-neutral-700 mb-4">{safeString(w.title)}</h3>}
      <div className="space-y-0.5">
        {items.length === 0 ? (
          <p className="text-sm text-neutral-400 py-4 text-center">No items</p>
        ) : items.map((item, i) => {
          const it = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
          return (
            <div key={i} className="flex items-center justify-between py-2.5 border-b border-neutral-100 last:border-0">
              <span className="text-sm text-neutral-600">{safeString(it.label, `Item ${i+1}`)}</span>
              <span className="text-sm font-semibold text-neutral-800 tabular-nums">{safeString(it.value, "—")}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Mini Bar Chart ───────────────────────────────────────────────────────────

function ChartCard({ w }: { w: Record<string, unknown> }) {
  const datasets = safeArray(w.datasets);
  const labels = safeArray(w.labels);
  const ds = (datasets[0] && typeof datasets[0] === "object" ? datasets[0] : {}) as Record<string, unknown>;
  const data = safeArray(ds.data).map((v) => safeNumber(v));
  const color = safeString(ds.color, "#6d62f5");
  const max = Math.max(...data, 1);
  const chartType = safeString(w.chartType, "bar");

  return (
    <div className="glass-card border-neutral-200 bg-white p-5 shadow-xs">
      {w.title && <h3 className="text-sm font-semibold text-neutral-700 mb-4">{safeString(w.title)}</h3>}
      {data.length === 0 ? (
        <div className="text-sm text-neutral-400 text-center py-6">No data</div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-end gap-1 h-24">
            {data.map((val, i) => {
              const pct = (val / max) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1 group relative">
                  <div
                    className="w-full rounded-sm transition-all duration-300 group-hover:opacity-80"
                    style={{ height: `${Math.max(4, pct)}%`, backgroundColor: color, opacity: 0.85 }}
                  />
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-800 text-white text-xs rounded px-1.5 py-0.5 whitespace-nowrap pointer-events-none z-10">
                    {val.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
          {labels.length > 0 && (
            <div className="flex gap-1">
              {labels.map((l, i) => (
                <div key={i} className="flex-1 text-center text-xs text-neutral-400 truncate">{safeString(l)}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Unknown Widget ───────────────────────────────────────────────────────────

function UnknownWidget({ type }: { type: string }) {
  return (
    <div className="glass-card border-dashed border-warning-border bg-warning-light/50 p-4 flex items-center gap-3">
      <svg className="w-4 h-4 text-warning-DEFAULT flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
      <div>
        <p className="text-xs font-medium text-warning-text">Unknown widget</p>
        <p className="text-xs text-warning-text/70 font-mono">{type}</p>
      </div>
    </div>
  );
}

function WidgetRenderer({ widget }: { widget: unknown }) {
  try {
    if (!widget || typeof widget !== "object" || Array.isArray(widget)) return null;
    const w = widget as Record<string, unknown>;
    const type = safeString(w.type, "unknown");
    switch (type) {
      case "kpi":      return <KPICard w={w} />;
      case "stat":     return <StatCard w={w} />;
      case "activity": return <ActivityCard w={w} />;
      case "summary":  return <SummaryCard w={w} />;
      case "chart":    return <ChartCard w={w} />;
      default:         return <UnknownWidget type={type} />;
    }
  } catch {
    return <UnknownWidget type="(render error)" />;
  }
}

// ─── Grid cols map ────────────────────────────────────────────────────────────

const GRID: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4",
};

// ─── DynamicDashboard ─────────────────────────────────────────────────────────

export function DynamicDashboard({ config }: { config: DashboardConfig }) {
  const widgets = safeArray(config.widgets);
  const cols = safeNumber(config.columns, 3);

  return (
    <div className="space-y-5 animate-fade-in">
      {(config.title || config.description) && (
        <div>
          {config.title && <h2 className="text-lg font-semibold text-neutral-800 tracking-tight">{config.title}</h2>}
          {config.description && <p className="text-sm text-neutral-500 mt-0.5">{config.description}</p>}
        </div>
      )}
      {widgets.length === 0 ? (
        <div className="glass-card border-dashed border-neutral-200 p-12 text-center text-neutral-400 text-sm">
          No widgets defined — add a <code className="text-xs bg-neutral-100 px-1 py-0.5 rounded">widgets</code> array to your config
        </div>
      ) : (
        <div className={cn("grid gap-4", GRID[cols] || GRID[3])}>
          {widgets.map((w, i) => <WidgetRenderer key={i} widget={w} />)}
        </div>
      )}
    </div>
  );
}