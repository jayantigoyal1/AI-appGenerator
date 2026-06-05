"use client";
import React, { useMemo, useId } from "react";
import type { TableConfig, TableColumn, ColumnFormat } from "@/types";
import { safeArray, safeString, safeBool, safeNumber, cn, formatCurrency, formatDate, formatDatetime, formatPercent } from "@/lib/utils";
import { useRendererStore } from "@/stores";

// ─── Safe normalizers ─────────────────────────────────────────────────────────

function normalizeColumn(raw: unknown, i: number): TableColumn | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const c = raw as Record<string, unknown>;
  const validFormats: ColumnFormat[] = ["text","number","date","datetime","badge","currency","percent","boolean","email","url"];
  return {
    key:     safeString(c.key) || `col_${i}`,
    label:   safeString(c.label) || safeString(c.key) || `Column ${i+1}`,
    sortable: safeBool(c.sortable),
    format:  validFormats.includes(c.format as ColumnFormat) ? (c.format as ColumnFormat) : "text",
    align:   (["left","center","right"].includes(c.align as string) ? c.align : "left") as "left"|"center"|"right",
    width:   c.width ? safeString(c.width) : undefined,
  };
}

function normalizeRow(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as Record<string, unknown>;
}

// ─── Badge color map ──────────────────────────────────────────────────────────

const BADGE_COLORS: Record<string, string> = {
  // status
  Active:     "bg-success-light text-success-text border-success-border",
  Inactive:   "bg-neutral-100 text-neutral-600 border-neutral-200",
  Churned:    "bg-danger-light text-danger-text border-danger-border",
  Trial:      "bg-warning-light text-warning-text border-warning-border",
  Pending:    "bg-warning-light text-warning-text border-warning-border",
  Processing: "bg-info-light text-info-text border-info-border",
  Shipped:    "bg-info-light text-info-text border-info-border",
  Delivered:  "bg-success-light text-success-text border-success-border",
  Cancelled:  "bg-danger-light text-danger-text border-danger-border",
  Refunded:   "bg-neutral-100 text-neutral-600 border-neutral-200",
  // plans
  Free:       "bg-neutral-100 text-neutral-600 border-neutral-200",
  Starter:    "bg-primary-50 text-primary-700 border-primary-200",
  Pro:        "bg-primary-50 text-primary-700 border-primary-200",
  Enterprise: "bg-violet-50 text-violet-700 border-violet-200",
  // payment
  Paid:       "bg-success-light text-success-text border-success-border",
  // roles
  Admin:      "bg-danger-light text-danger-text border-danger-border",
  Editor:     "bg-info-light text-info-text border-info-border",
  Viewer:     "bg-neutral-100 text-neutral-600 border-neutral-200",
  // generic
  New:        "bg-primary-50 text-primary-700 border-primary-200",
};

function getBadgeClass(val: string): string {
  return BADGE_COLORS[val] || "bg-neutral-100 text-neutral-600 border-neutral-200";
}

// ─── Cell renderer ────────────────────────────────────────────────────────────

function Cell({ value, format }: { value: unknown; format?: ColumnFormat }) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-neutral-300">—</span>;
  }
  switch (format) {
    case "currency": return <span className="font-medium tabular-nums">{formatCurrency(value)}</span>;
    case "date":     return <span className="text-neutral-600">{formatDate(value)}</span>;
    case "datetime": return <span className="text-neutral-600">{formatDatetime(value)}</span>;
    case "percent":  return <span className="tabular-nums">{formatPercent(value)}</span>;
    case "number":   return <span className="tabular-nums">{safeNumber(value).toLocaleString()}</span>;
    case "boolean":
      return safeBool(value)
        ? <span className="text-success-DEFAULT">✓</span>
        : <span className="text-neutral-300">✕</span>;
    case "email":
      return <a href={`mailto:${value}`} className="text-primary-600 hover:underline">{safeString(value)}</a>;
    case "url":
      return <a href={safeString(value)} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline truncate max-w-[200px] block">{safeString(value)}</a>;
    case "badge": {
      const str = safeString(value);
      return (
        <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", getBadgeClass(str))}>
          {str}
        </span>
      );
    }
    default: return <span className="text-neutral-700">{safeString(value)}</span>;
  }
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded bg-gradient-to-r from-neutral-100 via-neutral-50 to-neutral-100 bg-[length:400px_100%] animate-shimmer" style={{ width: `${60 + Math.random() * 30}%` }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Sort icon ────────────────────────────────────────────────────────────────

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  return (
    <span className={cn("ml-1 inline-flex flex-col gap-px", active ? "text-primary-600" : "text-neutral-300")}>
      <svg className={cn("w-2.5 h-2.5", active && dir === "asc" ? "text-primary-600" : "")} viewBox="0 0 10 6" fill="currentColor">
        <path d="M5 0L10 6H0L5 0Z" />
      </svg>
      <svg className={cn("w-2.5 h-2.5", active && dir === "desc" ? "text-primary-600" : "")} viewBox="0 0 10 6" fill="currentColor">
        <path d="M5 6L0 0H10L5 6Z" />
      </svg>
    </span>
  );
}

// ─── DynamicTable ─────────────────────────────────────────────────────────────

export function DynamicTable({ config }: { config: TableConfig }) {
  const tableId = config.id || "default-table";
  const { tableStates, setTableState } = useRendererStore();
  const ts = tableStates[tableId] || { page: 1, search: "", sortKey: null, sortDir: "asc" };

  const columns = safeArray(config.columns).map(normalizeColumn).filter((c): c is TableColumn => c !== null);
  const rawData = safeArray(config.data).map(normalizeRow);
  const pageSize = Math.max(1, safeNumber(config.pageSize, 10));
  const searchable = safeBool(config.searchable, false);
  const paginated  = safeBool(config.pagination, false);
  const striped    = safeBool(config.striped, false);
  const compact    = safeBool(config.compact, false);

  // Search
  const filtered = useMemo(() => {
    if (!ts.search.trim()) return rawData;
    const q = ts.search.toLowerCase();
    return rawData.filter((row) =>
      columns.some((col) => safeString(row[col.key]).toLowerCase().includes(q))
    );
  }, [rawData, ts.search, columns]);

  // Sort
  const sorted = useMemo(() => {
    if (!ts.sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[ts.sortKey!] ?? "";
      const bv = b[ts.sortKey!] ?? "";
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return ts.sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, ts.sortKey, ts.sortDir]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(ts.page, totalPages);
  const pageData = paginated ? sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize) : sorted;

  const handleSort = (col: TableColumn) => {
    if (!col.sortable) return;
    if (ts.sortKey === col.key) {
      if (ts.sortDir === "asc") setTableState(tableId, { sortDir: "desc" });
      else setTableState(tableId, { sortKey: null, sortDir: "asc" });
    } else {
      setTableState(tableId, { sortKey: col.key, sortDir: "asc", page: 1 });
    }
  };

  const cellPad = compact ? "px-3 py-2" : "px-4 py-3";

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          {config.title && <h2 className="text-lg font-semibold text-neutral-800 tracking-tight">{config.title}</h2>}
          {config.description && <p className="text-sm text-neutral-500 mt-0.5">{config.description}</p>}
        </div>
        {searchable && (
          <div className="relative flex-shrink-0">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search…"
              value={ts.search}
              onChange={(e) => setTableState(tableId, { search: e.target.value, page: 1 })}
              className="pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all w-56 shadow-xs"
            />
            {ts.search && (
              <button onClick={() => setTableState(tableId, { search: "", page: 1 })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="border border-neutral-200 rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                {columns.length === 0 ? (
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">No columns defined</th>
                ) : columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col)}
                    style={col.width ? { width: col.width } : undefined}
                    className={cn(
                      "px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap select-none",
                      col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left",
                      col.sortable && "cursor-pointer hover:text-neutral-800 hover:bg-neutral-100 transition-colors"
                    )}
                  >
                    <span className="inline-flex items-center gap-0.5">
                      {col.label}
                      {col.sortable && <SortIcon active={ts.sortKey === col.key} dir={ts.sortDir} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={Math.max(columns.length, 1)} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-neutral-400">
                      <svg className="w-10 h-10 text-neutral-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125" />
                      </svg>
                      <p className="text-sm">{safeString(config.emptyMessage) || (ts.search ? `No results for "${ts.search}"` : "No data available")}</p>
                      {ts.search && (
                        <button onClick={() => setTableState(tableId, { search: "" })}
                          className="text-xs text-primary-600 hover:underline">Clear search</button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                pageData.map((row, ri) => (
                  <tr key={ri} className={cn(
                    "group transition-colors hover:bg-neutral-50/70",
                    striped && ri % 2 === 1 && "bg-neutral-50/40"
                  )}>
                    {columns.map((col) => (
                      <td key={col.key} className={cn(cellPad,
                        col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left"
                      )}>
                        <Cell value={row[col.key]} format={col.format} />
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {paginated && totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-500 text-xs">
            {sorted.length === 0 ? "No results" : `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, sorted.length)} of ${sorted.length}`}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setTableState(tableId, { page: 1 })} disabled={currentPage === 1}
              className="p-1.5 rounded border border-neutral-200 text-neutral-500 hover:text-neutral-800 hover:border-neutral-300 disabled:opacity-35 disabled:cursor-not-allowed transition-all">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" /></svg>
            </button>
            <button onClick={() => setTableState(tableId, { page: Math.max(1, currentPage - 1) })} disabled={currentPage === 1}
              className="p-1.5 rounded border border-neutral-200 text-neutral-500 hover:text-neutral-800 hover:border-neutral-300 disabled:opacity-35 disabled:cursor-not-allowed transition-all">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = totalPages <= 5 ? i + 1 : Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
              return (
                <button key={p} onClick={() => setTableState(tableId, { page: p })}
                  className={cn("min-w-[32px] h-8 px-2 rounded border text-xs font-medium transition-all",
                    p === currentPage ? "bg-primary-600 border-primary-600 text-white shadow-sm" : "border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:text-neutral-900"
                  )}>
                  {p}
                </button>
              );
            })}
            <button onClick={() => setTableState(tableId, { page: Math.min(totalPages, currentPage + 1) })} disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-neutral-200 text-neutral-500 hover:text-neutral-800 hover:border-neutral-300 disabled:opacity-35 disabled:cursor-not-allowed transition-all">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </button>
            <button onClick={() => setTableState(tableId, { page: totalPages })} disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-neutral-200 text-neutral-500 hover:text-neutral-800 hover:border-neutral-300 disabled:opacity-35 disabled:cursor-not-allowed transition-all">
              <svg className="w-3.5 h-3.5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}