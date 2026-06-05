"use client";

import React, { Component, type ErrorInfo } from "react";
import type { AppConfig, FormConfig, TableConfig, DashboardConfig, CardConfig, LayoutConfig } from "@/types";
import { DynamicForm } from "./DynamicForm";
import { DynamicTable } from "./DynamicTable";
import { DynamicDashboard } from "./DynamicDashboard";
import { DynamicCard } from "./DynamicCard";
import { cn } from "@/lib/utils";
import { DynamicAlert } from "./DynamicAlert";
import { DynamicProgress } from "./DynamicProgress";

// ─── Registry ────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const componentRegistry: Record<
  string,
  React.ComponentType<{ config: any }>
> = {
  form: DynamicForm,
  table: DynamicTable,
  dashboard: DynamicDashboard,
  card: DynamicCard,
  alert: DynamicAlert,
  progress: DynamicProgress,
};

// ─── Fallbacks ────────────────────────────────────────────────────────────────

function UnsupportedComponent({ type }: { type: string }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-surface-3 p-8 text-center space-y-2">
      <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center mx-auto">
        <svg className="w-5 h-5 text-ink-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 9.75l4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
        </svg>
      </div>
      <p className="text-sm font-medium text-ink-secondary">Unsupported Component</p>
      <p className="text-xs text-ink-tertiary font-mono bg-surface-2 inline-block px-2 py-0.5 rounded">{type}</p>
    </div>
  );
}

function ErrorFallback({ error, componentType }: { error: string; componentType: string }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-5 space-y-2">
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <p className="text-sm font-medium text-red-700">Render error in &ldquo;{componentType}&rdquo;</p>
      </div>
      <p className="text-xs text-red-600 font-mono bg-red-100/60 p-2 rounded-lg">{error}</p>
    </div>
  );
}

// ─── Error Boundary ───────────────────────────────────────────────────────────

interface EBProps {
  children: React.ReactNode;
  componentType: string;
}

interface EBState {
  hasError: boolean;
  error: string;
}

class ComponentErrorBoundary extends Component<EBProps, EBState> {
  constructor(props: EBProps) {
    super(props);
    this.state = { hasError: false, error: "" };
  }

  static getDerivedStateFromError(error: Error): EBState {
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn(`[ComponentRenderer] Error in ${this.props.componentType}:`, error, info);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} componentType={this.props.componentType} />;
    }
    return this.props.children;
  }
}

// ─── Layout Renderer ─────────────────────────────────────────────────────────

const LAYOUT_CLASSES: Record<string, string> = {
  single: "flex flex-col gap-5",
  "two-column": "grid grid-cols-1 md:grid-cols-2 gap-5",
  grid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5",
  sidebar: "flex gap-5",
};

function LayoutRenderer({ config }: { config: LayoutConfig }) {
  const layoutKey = config.layout ?? "single";

  const layoutClass =
    LAYOUT_CLASSES[layoutKey] ?? LAYOUT_CLASSES.single;

  const children = Array.isArray(config.children)
    ? config.children
    : [];

  return (
    <div className={layoutClass}>
      {children.map((child, i) => (
        <ComponentRenderer key={i} config={child as AppConfig} />
      ))}
    </div>
  );
}

// ─── Main Renderer ────────────────────────────────────────────────────────────

interface RendererProps {
  config: AppConfig;
  depth?: number;
}

export function ComponentRenderer({ config, depth = 0 }: RendererProps) {
  if (!config || typeof config !== "object") {
    return <UnsupportedComponent type="(invalid)" />;
  }

  const cfg = config as Record<string, unknown>;
  const type = (cfg.type as string) || "unknown";

  // Prevent infinite nesting
  if (depth > 8) {
    return <UnsupportedComponent type="(max depth)" />;
  }

  if (type === "layout") {
    return (
      <ComponentErrorBoundary componentType="layout">
        <LayoutRenderer config={config as LayoutConfig} />
      </ComponentErrorBoundary>
    );
  }

  const RenderedComponent = componentRegistry[type];

  if (!RenderedComponent) {
    return <UnsupportedComponent type={type} />;
  }

  return (
    <ComponentErrorBoundary componentType={type}>
      <RenderedComponent config={config} />
    </ComponentErrorBoundary>
  );
}

// ─── Skeleton Loaders ─────────────────────────────────────────────────────────

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl bg-gradient-to-r from-surface-2 via-surface-1 to-surface-2 bg-[length:200%_100%] animate-shimmer",
        className
      )}
    />
  );
}

export function PreviewSkeleton() {
  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="space-y-2">
        <Shimmer className="h-7 w-48" />
        <Shimmer className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <Shimmer key={i} className="h-28 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => <Shimmer key={i} className="h-40 rounded-2xl" />)}
      </div>
    </div>
  );
}
