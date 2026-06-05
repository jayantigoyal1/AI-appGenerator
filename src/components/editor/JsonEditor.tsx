"use client";

import React, { useCallback, useRef, useEffect } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import { useMetadataStore, useErrorStore } from "@/stores";
import { safeParseJson, validateConfig } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

export function JsonEditor({ className }: Props) {
  const { rawJson, setRawJson, setParsedConfig, setValidation } = useMetadataStore();
  const { addError } = useErrorStore();
  const editorRef = useRef<unknown>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const processJson = useCallback(
    (value: string) => {
      const { config, parseError } = safeParseJson(value);

      if (parseError) {
        setValidation({
          valid: false,
          errors: [{ path: "parse", message: parseError }],
          warnings: [],
        });
        setParsedConfig(null);
        return;
      }

      if (!config) {
        setValidation({ valid: true, errors: [], warnings: [] });
        setParsedConfig(null);
        return;
      }

      const result = validateConfig(config);
      setValidation(result);
      setParsedConfig(result.valid ? config : null);

      if (!result.valid) {
        result.errors.forEach((e) => {
          addError({ component: "editor", message: e.message, severity: "error" });
        });
      }
    },
    [setValidation, setParsedConfig, addError]
  );

  const handleChange = useCallback(
    (value: string | undefined) => {
      const v = value ?? "";
      setRawJson(v);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => processJson(v), 300);
    },
    [setRawJson, processJson]
  );

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  const handleFormat = useCallback(() => {
    if (editorRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (editorRef.current as any).getAction("editor.action.formatDocument")?.run();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const { validation } = useMetadataStore();

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-surface-3 bg-surface-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-ink-secondary uppercase tracking-wide">JSON Editor</span>
          <ValidationBadge validation={validation} />
        </div>
        <button
          onClick={handleFormat}
          className="flex items-center gap-1.5 text-xs text-ink-secondary hover:text-ink px-2.5 py-1 rounded-lg hover:bg-surface-2 transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          Format
        </button>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language="json"
          value={rawJson}
          onChange={handleChange}
          onMount={handleMount}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineHeight: 20,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontLigatures: true,
            padding: { top: 16, bottom: 16 },
            scrollBeyondLastLine: false,
            renderLineHighlight: "none",
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            scrollbar: {
              vertical: "auto",
              horizontal: "hidden",
              verticalScrollbarSize: 6,
            },
            lineNumbers: "on",
            glyphMargin: false,
            folding: true,
            bracketPairColorization: { enabled: true },
            automaticLayout: true,
            tabSize: 2,
            formatOnPaste: true,
          }}
          theme="jsonEditorTheme"
          beforeMount={(monaco) => {
            monaco.editor.defineTheme("jsonEditorTheme", {
              base: "vs",
              inherit: true,
              rules: [
                { token: "string.key.json", foreground: "5b7cf6" },
                { token: "string.value.json", foreground: "16a34a" },
                { token: "number.json", foreground: "c026d3" },
                { token: "keyword.json", foreground: "dc2626" },
              ],
              colors: {
                "editor.background": "#ffffff",
                "editor.lineHighlightBackground": "#f4f4f500",
                "editorLineNumber.foreground": "#d4d4d8",
                "editorLineNumber.activeForeground": "#a1a1aa",
                "editor.selectionBackground": "#5b7cf620",
                "editorBracketMatch.background": "#5b7cf610",
                "editorBracketMatch.border": "#5b7cf660",
              },
            });
          }}
        />
      </div>

      {/* Error/Warning Panel */}
      {(validation.errors.length > 0 || validation.warnings.length > 0) && (
        <div className="border-t border-surface-3 bg-surface-1 max-h-32 overflow-y-auto">
          {validation.errors.map((e, i) => (
            <div key={i} className="flex items-start gap-2 px-4 py-2 text-xs text-red-600 bg-red-50/80">
              <span className="mt-0.5 flex-shrink-0">✕</span>
              <span className="font-mono">{e.path}: {e.message}</span>
            </div>
          ))}
          {validation.warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 px-4 py-2 text-xs text-amber-600 bg-amber-50/80">
              <span className="mt-0.5 flex-shrink-0">⚠</span>
              <span className="font-mono">{w.path}: {w.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ValidationBadge({ validation }: { validation: { valid: boolean; errors: { path: string; message: string }[]; warnings: { path: string; message: string }[] } }) {
  if (!validation) return null;
  if (validation.errors.length > 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-50 text-red-600 border border-red-200">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
        {validation.errors.length} error{validation.errors.length !== 1 ? "s" : ""}
      </span>
    );
  }
  if (validation.warnings.length > 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-50 text-amber-600 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
        {validation.warnings.length} warning{validation.warnings.length !== 1 ? "s" : ""}
      </span>
    );
  }
  if (validation.valid) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-50 text-green-600 border border-green-200">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
        Valid
      </span>
    );
  }
  return null;
}
