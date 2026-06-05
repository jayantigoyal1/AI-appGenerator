"use client";

import React from "react";
import { TEMPLATES } from "@/lib/templates";
import { useMetadataStore, useUIStore } from "@/stores";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ReactNode> = {
  BarChart3: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125z" />
    </svg>
  ),
  Table: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-4.5h.008v.008h-.008V5.625zm.375 0a1.125 1.125 0 1 0-2.25 0 1.125 1.125 0 0 0 2.25 0z" />
    </svg>
  ),
  FormInput: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75z" />
    </svg>
  ),
  LineChart: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
    </svg>
  ),
};

export function TemplateSidebar() {
  const { setRawJson, setParsedConfig, setValidation } = useMetadataStore();
  const { activeTemplate, setActiveTemplate } = useUIStore();

  const loadTemplate = (template: (typeof TEMPLATES)[0]) => {
    const json = JSON.stringify(template.config, null, 2);
    setRawJson(json);
    setParsedConfig(template.config);
    setValidation({ valid: true, errors: [], warnings: [] });
    setActiveTemplate(template.id);
  };

  return (
    <aside className="w-72 border-r border-neutral-200 bg-[#fcfcfc] flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-surface-2">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-ink leading-tight">Dynamo</p>
            <p className="text-xs text-ink-tertiary leading-tight">App Generator</p>
          </div>
        </div>
      </div>

      {/* Templates */}
      <div className="flex-1 overflow-y-auto p-3">
        <p className="text-xs font-semibold text-ink-tertiary uppercase tracking-wide px-2 mb-2">Templates</p>
        <div className="space-y-1">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => loadTemplate(template)}
              className={cn(
                "w-full text-left px-3 py-2.5 rounded-xl transition-all group",
                activeTemplate === template.id
                  ? "bg-brand-50 border border-brand-100"
                  : "hover:bg-surface-1 border border-transparent"
              )}
            >
              <div className="flex items-start gap-2.5">
                <span className={cn(
                  "flex-shrink-0 mt-0.5",
                  activeTemplate === template.id ? "text-brand-600" : "text-ink-tertiary group-hover:text-ink-secondary"
                )}>
                  {ICON_MAP[template.icon ?? "BarChart3"]}
                </span>
                <div className="min-w-0">
                  <p className={cn(
                    "text-sm font-medium leading-tight",
                    activeTemplate === template.id ? "text-brand-700" : "text-ink"
                  )}>
                    {template.name}
                  </p>
                  <p className="text-xs text-ink-tertiary mt-0.5 leading-tight">{template.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Custom entry */}
        <div className="mt-4 pt-4 border-t border-surface-2">
          <p className="text-xs font-semibold text-ink-tertiary uppercase tracking-wide px-2 mb-2">Custom</p>
          <button
            onClick={() => {
              setRawJson("{\n  \"type\": \"\"\n}");
              setParsedConfig(null);
              setActiveTemplate(null);
            }}
            className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-surface-1 border border-transparent hover:border-surface-3 transition-all group"
          >
            <div className="flex items-start gap-2.5">
              <span className="flex-shrink-0 mt-0.5 text-ink-tertiary group-hover:text-ink-secondary">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-medium text-ink leading-tight">Blank canvas</p>
                <p className="text-xs text-ink-tertiary mt-0.5">Start from scratch</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-surface-2">
        <div className="rounded-xl bg-surface-1 p-3 space-y-1">
          <p className="text-xs font-semibold text-ink">Supported types</p>
          <div className="flex flex-wrap gap-1">
            {["form", "table", "dashboard", "card", "layout"].map((t) => (
              <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-white border border-surface-3 text-ink-secondary font-mono">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
