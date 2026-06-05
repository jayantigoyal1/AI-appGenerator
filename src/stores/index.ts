import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import type { AppConfig, ValidationResult, RuntimeError } from "@/types";

// ─── Metadata Store ──────────────────────────────────────────────────────────

interface MetadataState {
  rawJson: string;
  parsedConfig: AppConfig | null;
  validation: ValidationResult;
  lastValidConfig: AppConfig | null; // keep last good config for "ghost preview"
  setRawJson: (json: string) => void;
  setParsedConfig: (config: AppConfig | null) => void;
  setValidation: (result: ValidationResult) => void;
}

export const useMetadataStore = create<MetadataState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      rawJson: "",
      parsedConfig: null,
      validation: { valid: true, errors: [], warnings: [] },
      lastValidConfig: null,
      setRawJson: (rawJson) => set({ rawJson }),
      setParsedConfig: (config) => {
        const prev = get().lastValidConfig;
        set({ parsedConfig: config, lastValidConfig: config ?? prev });
      },
      setValidation: (validation) => set({ validation }),
    })),
    { name: "metadata" }
  )
);

// ─── Renderer Store ───────────────────────────────────────────────────────────

interface TablePageState { page: number; search: string; sortKey: string | null; sortDir: "asc" | "desc" }

interface RendererState {
  formStates: Record<string, "idle" | "loading" | "success" | "error">;
  formData: Record<string, unknown>;
  tableStates: Record<string, TablePageState>;
  activeTabs: Record<string, string>;
  dismissedAlerts: Set<string>;
  setFormState: (id: string, state: "idle" | "loading" | "success" | "error") => void;
  setFormData: (id: string, data: unknown) => void;
  setTableState: (id: string, state: Partial<TablePageState>) => void;
  setActiveTab: (id: string, tab: string) => void;
  dismissAlert: (id: string) => void;
  resetForm: (id: string) => void;
}

export const useRendererStore = create<RendererState>()(
  devtools(
    (set) => ({
      formStates: {},
      formData: {},
      tableStates: {},
      activeTabs: {},
      dismissedAlerts: new Set(),
      setFormState: (id, state) => set((s) => ({ formStates: { ...s.formStates, [id]: state } })),
      setFormData: (id, data) => set((s) => ({ formData: { ...s.formData, [id]: data } })),
      setTableState: (id, state) =>
        set((s) => ({
          tableStates: {
            ...s.tableStates,
            [id]: {
              ...(s.tableStates[id] ?? {
                page: 1,
                search: "",
                sortKey: null,
                sortDir: "asc",
              }),
              ...state,
            },
          },
        })),
      setActiveTab: (id, tab) => set((s) => ({ activeTabs: { ...s.activeTabs, [id]: tab } })),
      dismissAlert: (id) => set((s) => ({ dismissedAlerts: new Set([...s.dismissedAlerts, id]) })),
      resetForm: (id) =>
        set((s) => ({
          formStates: { ...s.formStates, [id]: "idle" },
          formData: { ...s.formData, [id]: null },
        })),
    }),
    { name: "renderer" }
  )
);

// ─── UI Store ─────────────────────────────────────────────────────────────────

type activePanel = "split" | "editor" | "preview";

interface UIState {
  activePanel: activePanel;
  activeTemplate: string | null;
  sidebarCollapsed: boolean;
  previewDevice: "desktop" | "tablet" | "mobile";
  showConfigTree: boolean;
  notifications: Notification[];
  setactivePanel: (mode: activePanel) => void;
  setActiveTemplate: (id: string | null) => void;
  setSidebarCollapsed: (v: boolean) => void;
  setPreviewDevice: (d: "desktop" | "tablet" | "mobile") => void;
  setShowConfigTree: (v: boolean) => void;
  addNotification: (n: Omit<Notification, "id" | "ts">) => void;
  removeNotification: (id: string) => void;
}

interface Notification {
  id: string;
  ts: number;
  type: "success" | "error" | "info" | "warning";
  message: string;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      activePanel: "split",
      activeTemplate: null,
      sidebarCollapsed: false,
      previewDevice: "desktop",
      showConfigTree: false,
      notifications: [],
      setactivePanel: (activePanel) => set({ activePanel }),
      setActiveTemplate: (activeTemplate) => set({ activeTemplate }),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      setPreviewDevice: (previewDevice) => set({ previewDevice }),
      setShowConfigTree: (showConfigTree) => set({ showConfigTree }),
      addNotification: (n) =>
        set((s) => ({
          notifications: [
            ...s.notifications.slice(-4),
            { ...n, id: Math.random().toString(36).slice(2), ts: Date.now() },
          ],
        })),
      removeNotification: (id) =>
        set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),
    }),
    { name: "ui" }
  )
);

// ─── Error Store ──────────────────────────────────────────────────────────────

interface ErrorState {
  errors: RuntimeError[];
  addError: (e: Omit<RuntimeError, "id" | "timestamp">) => void;
  clearErrors: () => void;
}

export const useErrorStore = create<ErrorState>()(
  devtools(
    (set) => ({
      errors: [],
      addError: (e) =>
        set((s) => ({
          errors: [
            ...s.errors.slice(-29),
            { ...e, id: Math.random().toString(36).slice(2), timestamp: Date.now() },
          ],
        })),
      clearErrors: () => set({ errors: [] }),
    }),
    { name: "errors" }
  )
);