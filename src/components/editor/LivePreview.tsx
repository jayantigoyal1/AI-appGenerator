"use client";

import React, { useEffect, useState } from "react";
import { useMetadataStore } from "@/stores";
import { ComponentRenderer, PreviewSkeleton } from "@/components/renderer/ComponentRenderer";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

export function LivePreview({ className }: Props) {
  const { parsedConfig, rawJson, validation } = useMetadataStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [prevConfig, setPrevConfig] = useState(parsedConfig);

  useEffect(() => {
    if (parsedConfig !== prevConfig) {
      setIsUpdating(true);
      const t = setTimeout(() => {
        setPrevConfig(parsedConfig);
        setIsUpdating(false);
      }, 80);
      return () => clearTimeout(t);
    }
  }, [parsedConfig, prevConfig]);

  const isEmpty = !rawJson.trim();
  const hasParseError = !validation.valid && rawJson.trim();

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-surface-3 bg-surface-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-ink-secondary uppercase tracking-wide">Live Preview</span>
          {isUpdating && (
            <span className="inline-flex items-center gap-1 text-xs text-brand-600 animate-pulse-subtle">
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Updating
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400/60" />
          <div className="w-3 h-3 rounded-full bg-amber-400/60" />
          <div className="w-3 h-3 rounded-full bg-green-400/60" />
        </div>
      </div>

      {/* Preview content */}
      <div className="flex-1 overflow-auto bg-surface-1">
        <div className="preview-container min-h-full">
          {isEmpty ? (
            <EmptyState />
          ) : hasParseError ? (
            <ParseErrorState errors={validation.errors} />
          ) : isUpdating ? (
            <div className="opacity-50 pointer-events-none transition-opacity">
              {prevConfig ? (
                <ComponentRenderer config={prevConfig} />
              ) : (
                <PreviewSkeleton />
              )}
            </div>
          ) : parsedConfig ? (
            <div className="animate-fade-in">
              <ComponentRenderer config={parsedConfig} />
            </div>
          ) : (
            <PreviewSkeleton />
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-5 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center">
        <svg className="w-8 h-8 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
        </svg>
      </div>
      <div>
        <p className="font-semibold text-ink text-lg">Start with a template</p>
        <p className="text-sm text-ink-secondary mt-1 max-w-xs">
          Choose a template from the sidebar, or paste your JSON configuration to see a live preview.
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs text-ink-tertiary bg-surface-2 rounded-xl px-4 py-2">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
        </svg>
        Changes render instantly — no refresh needed
      </div>
    </div>
  );
}

function ParseErrorState({ errors }: { errors: { path: string; message: string }[] }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
        <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <div>
        <p className="font-semibold text-red-700">Invalid JSON</p>
        <p className="text-sm text-ink-secondary mt-1">Fix the syntax errors to see your preview</p>
      </div>
      {errors.slice(0, 3).map((e, i) => (
        <div key={i} className="bg-red-50 border border-red-100 rounded-xl px-4 py-2 text-xs text-red-600 font-mono max-w-sm text-left">
          {e.message}
        </div>
      ))}
    </div>
  );
}
