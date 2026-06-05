"use client";

import React from "react";
import { Header } from "@/components/layout/Header";
import { TemplateSidebar } from "@/components/layout/TemplateSidebar";
import { JsonEditor } from "@/components/editor/JsonEditor";
import { LivePreview } from "@/components/editor/LivePreview";
import { useUIStore } from "@/stores";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const { activePanel } = useUIStore();

  return (
    <div className="h-screen flex flex-col bg-[#fafafa] overflow-hidden">
      <Header />
      <div className="flex flex-1 min-h-0">
        <TemplateSidebar />
        <main className="flex-1 min-w-0 flex min-h-0">
          {activePanel === "editor" && (
            <JsonEditor className="flex-1" />
          )}
          {activePanel === "split" && (
            <SplitView />
          )}
          {activePanel === "preview" && (
            <LivePreview className="flex-1" />
          )}
        </main>
      </div>
    </div>
  );
}

function SplitView() {
  return (
    <div className="flex flex-1 min-h-0 min-w-0">
      <div className="flex-1 min-w-0 border-r border-surface-3">
        <JsonEditor className="h-full" />
      </div>
      <div className="flex-1 min-w-0">
        <LivePreview className="h-full" />
      </div>
    </div>
  );
}
