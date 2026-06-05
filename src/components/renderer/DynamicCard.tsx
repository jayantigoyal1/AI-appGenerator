"use client";

import React from "react";
import type { CardConfig } from "@/types";

interface Props {
  config: CardConfig;
}

export function DynamicCard({ config }: Props) {
  return (
    <div className="rounded-2xl border border-surface-3 bg-white shadow-card overflow-hidden">
      {config.image && (
        <div className="h-40 bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
          <span className="text-brand-400 text-sm">{config.image}</span>
        </div>
      )}
      <div className="p-5 space-y-3">
        {config.badges && config.badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {config.badges.map((badge, i) => (
              <span key={i} className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700 border border-brand-100">
                {badge}
              </span>
            ))}
          </div>
        )}
        {config.title && <h3 className="text-lg font-semibold text-ink">{config.title}</h3>}
        {config.description && <p className="text-sm text-ink-secondary">{config.description}</p>}
        {config.content && <p className="text-sm text-ink">{config.content}</p>}
        {config.footer && (
          <div className="pt-3 border-t border-surface-2">
            <p className="text-xs text-ink-tertiary">{config.footer}</p>
          </div>
        )}
      </div>
    </div>
  );
}
