"use client";

import React from "react";
import type { DashboardConfig } from "@/types";
import { safeArray, safeString, safeNumber, cn } from "@/lib/utils";

const KPI_THEMES: Record<
  string,
  { bg: string; accent: string }
> = {
  blue: {
    bg: "from-blue-50/80 to-sky-50/60",
    accent: "bg-blue-500",
  },
  green: {
    bg: "from-emerald-50/80 to-green-50/60",
    accent: "bg-emerald-500",
  },
  purple: {
    bg: "from-violet-50/80 to-purple-50/60",
    accent: "bg-violet-500",
  },
  amber: {
    bg: "from-amber-50/80 to-yellow-50/60",
    accent: "bg-amber-500",
  },
  red: {
    bg: "from-rose-50/80 to-red-50/60",
    accent: "bg-rose-500",
  },
  teal: {
    bg: "from-teal-50/80 to-cyan-50/60",
    accent: "bg-teal-500",
  },
};

function KPICard({ w }: { w: Record<string, unknown> }) {
  const color = safeString(w.color, "blue");
  const theme = KPI_THEMES[color] || KPI_THEMES.blue;

  const change =
    w.change !== undefined ? safeNumber(w.change) : undefined;

  return (
    <div
      className={cn(
        "rounded-2xl border border-neutral-200 bg-gradient-to-br p-5",
        theme.bg
      )}
    >
      <div className="flex justify-between items-center">
        <span className="text-sm text-neutral-600">
          {safeString(w.title)}
        </span>

        <span
          className={cn("w-2 h-2 rounded-full", theme.accent)}
        />
      </div>

      <div className="mt-3 flex items-end justify-between">
        <span className="text-2xl font-bold text-neutral-800">
          {safeString(w.prefix)}
          {safeString(w.value, "—")}
          {safeString(w.suffix)}
        </span>

        {change !== undefined && (
          <span className="text-xs font-semibold">
            {change > 0 ? "▲" : change < 0 ? "▼" : "●"}{" "}
            {Math.abs(change)}%
          </span>
        )}
      </div>

      {safeString(w.changeLabel) && (
        <p className="text-xs text-neutral-400 mt-2">
          {safeString(w.changeLabel)}
        </p>
      )}
    </div>
  );
}

function StatCard({ w }: { w: Record<string, unknown> }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="text-sm text-neutral-500">
        {safeString(w.title)}
      </div>

      <div className="text-2xl font-bold text-neutral-800 mt-2">
        {safeString(w.value)}
      </div>

      {safeString(w.subtitle) && (
        <div className="text-xs text-neutral-400 mt-1">
          {safeString(w.subtitle)}
        </div>
      )}
    </div>
  );
}

function ActivityCard({ w }: { w: Record<string, unknown> }) {
  const items = safeArray(w.items);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      {safeString(w.title) && (
        <h3 className="font-semibold mb-4">
          {safeString(w.title)}
        </h3>
      )}

      <div className="space-y-3">
        {items.map((item, index) => {
          const it =
            typeof item === "object" && item !== null
              ? (item as Record<string, unknown>)
              : {};

          return (
            <div key={index}>
              <div className="text-sm text-neutral-700">
                {safeString(it.user) && (
                  <span className="font-semibold">
                    {safeString(it.user)}{" "}
                  </span>
                )}

                {safeString(
                  it.action,
                  "performed an action"
                )}
              </div>

              {safeString(it.time) && (
                <div className="text-xs text-neutral-400">
                  {safeString(it.time)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SummaryCard({ w }: { w: Record<string, unknown> }) {
  const items = safeArray(w.items);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      {safeString(w.title) && (
        <h3 className="font-semibold mb-4">
          {safeString(w.title)}
        </h3>
      )}

      <div className="space-y-2">
        {items.map((item, index) => {
          const it =
            typeof item === "object" && item !== null
              ? (item as Record<string, unknown>)
              : {};

          return (
            <div
              key={index}
              className="flex justify-between"
            >
              <span>{safeString(it.label)}</span>

              <span className="font-semibold">
                {safeString(it.value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChartCard({ w }: { w: Record<string, unknown> }) {
  const datasets = safeArray(w.datasets);

  const dataset =
    datasets.length > 0 &&
    typeof datasets[0] === "object"
      ? (datasets[0] as Record<string, unknown>)
      : {};

  const data = safeArray(dataset.data).map((v) =>
    safeNumber(v)
  );

  const max = Math.max(...data, 1);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      {safeString(w.title) && (
        <h3 className="font-semibold mb-4">
          {safeString(w.title)}
        </h3>
      )}

      <div className="flex items-end gap-2 h-28">
        {data.map((value, index) => (
          <div
            key={index}
            className="flex-1 bg-indigo-500 rounded"
            style={{
              height: `${(value / max) * 100}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function WidgetRenderer({
  widget,
}: {
  widget: unknown;
}) {
  if (
    !widget ||
    typeof widget !== "object" ||
    Array.isArray(widget)
  ) {
    return null;
  }

  const w = widget as Record<string, unknown>;

  const type = safeString(w.type);

  switch (type) {
    case "kpi":
      return <KPICard w={w} />;

    case "stat":
      return <StatCard w={w} />;

    case "activity":
      return <ActivityCard w={w} />;

    case "summary":
      return <SummaryCard w={w} />;

    case "chart":
      return <ChartCard w={w} />;

    default:
      return (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          Unknown widget: {type}
        </div>
      );
  }
}

const GRID: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
};

export function DynamicDashboard({
  config,
}: {
  config: DashboardConfig;
}) {
  const widgets = safeArray(config.widgets);

  const cols = safeNumber(config.columns, 3);

  return (
    <div className="space-y-6">
      {(safeString(config.title) ||
        safeString(config.description)) && (
        <div>
          {safeString(config.title) && (
            <h2 className="text-xl font-bold">
              {safeString(config.title)}
            </h2>
          )}

          {safeString(config.description) && (
            <p className="text-neutral-500">
              {safeString(config.description)}
            </p>
          )}
        </div>
      )}

      <div
        className={cn(
          "grid gap-4",
          GRID[cols] || GRID[3]
        )}
      >
        {widgets.map((widget, index) => (
          <WidgetRenderer
            key={index}
            widget={widget}
          />
        ))}
      </div>
    </div>
  );
}