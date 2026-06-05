// ─── Field Types ─────────────────────────────────────────────────────────────

export const VALID_FIELD_TYPES = ["text","email","number","textarea","select","checkbox","date","password","url","phone","color","range","toggle"] as const;
export type FieldType = typeof VALID_FIELD_TYPES[number];

export const VALID_COMPONENT_TYPES = ["form","table","dashboard","card","stat","alert","progress","tabs","layout"] as const;
export type ComponentType = typeof VALID_COMPONENT_TYPES[number] | string;

export const VALID_LAYOUT_TYPES = ["single","two-column","three-column","grid","sidebar","sidebar-right"] as const;
export type LayoutType = typeof VALID_LAYOUT_TYPES[number] | string;

// ─── Form ─────────────────────────────────────────────────────────────────────

export interface FieldOption { label: string; value: string | number }

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  options?: FieldOption[];
  defaultValue?: unknown;
  helpText?: string;
  disabled?: boolean;
  width?: "full" | "half";
}

export interface FormConfig {
  type: "form";
  id?: string;
  title?: string;
  description?: string;
  fields: unknown; // intentionally loose — we validate at runtime
  submitLabel?: string;
  cancelLabel?: string;
  layout?: "stacked" | "grid";
}

// ─── Table ────────────────────────────────────────────────────────────────────

export type ColumnFormat = "text" | "number" | "date" | "datetime" | "badge" | "currency" | "percent" | "boolean" | "email" | "url";

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string | number;
  format?: ColumnFormat;
  align?: "left" | "center" | "right";
  badgeMap?: Record<string, string>; // value → color class
}

export interface TableConfig {
  type: "table";
  id?: string;
  title?: string;
  description?: string;
  columns: unknown; // loose — validated at runtime
  data?: unknown;
  searchable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  striped?: boolean;
  compact?: boolean;
  emptyMessage?: string;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface KPIWidget {
  type: "kpi";
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  prefix?: string;
  suffix?: string;
  color?: "blue" | "green" | "purple" | "amber" | "red" | "teal";
  icon?: string;
}

export interface StatWidget {
  type: "stat";
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
}

export interface ActivityItem {
  id?: string | number;
  user?: string;
  action: string;
  time?: string;
  type?: "default" | "success" | "warning" | "danger";
}

export interface ActivityWidget {
  type: "activity";
  title?: string;
  items: unknown; // loose
}

export interface SummaryWidget {
  type: "summary";
  title?: string;
  items: unknown; // loose
}

export interface ChartWidget {
  type: "chart";
  title?: string;
  chartType?: "bar" | "line" | "area";
  labels?: unknown[];
  datasets?: { label: string; data: number[]; color?: string }[];
}

export type DashboardWidget = KPIWidget | StatWidget | ActivityWidget | SummaryWidget | ChartWidget | Record<string, unknown>;

export interface DashboardConfig {
  type: "dashboard";
  id?: string;
  title?: string;
  description?: string;
  widgets?: unknown;
  columns?: number;
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export interface CardConfig {
  type: "card";
  id?: string;
  title?: string;
  description?: string;
  content?: string;
  footer?: string;
  image?: string;
  badges?: unknown;
  variant?: "default" | "outlined" | "filled";
  color?: string;
}

// ─── Stat ─────────────────────────────────────────────────────────────────────

export interface StatConfig {
  type: "stat";
  id?: string;
  title?: string;
  value?: string | number;
  change?: number;
  changeLabel?: string;
  items?: { title: string; value: string | number; change?: number }[];
  columns?: number;
}

// ─── Alert ────────────────────────────────────────────────────────────────────

export interface AlertConfig {
  type: "alert";
  id?: string;
  title?: string;
  message?: string;
  variant?: "info" | "success" | "warning" | "danger";
  dismissible?: boolean;
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export interface ProgressConfig {
  type: "progress";
  id?: string;
  title?: string;
  items?: { label: string; value: number; color?: string }[];
  value?: number;
  label?: string;
  showLabel?: boolean;
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

export interface TabItem {
  id: string;
  label: string;
  content: AppConfig;
}

export interface TabsConfig {
  type: "tabs";
  id?: string;
  tabs?: unknown;
  defaultTab?: string;
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export interface LayoutConfig {
  type: "layout";
  id?: string;
  layout?: LayoutType;
  gap?: "sm" | "md" | "lg";
  children?: unknown;
}

// ─── Union ────────────────────────────────────────────────────────────────────

export type AppConfig =
  | FormConfig | TableConfig | DashboardConfig | CardConfig
  | StatConfig | AlertConfig | ProgressConfig | TabsConfig | LayoutConfig
  | Record<string, unknown>;

// ─── Validation ──────────────────────────────────────────────────────────────

export interface ValidationError   { path: string; message: string }
export interface ValidationWarning { path: string; message: string }
export interface ValidationResult  { valid: boolean; errors: ValidationError[]; warnings: ValidationWarning[] }

// ─── Runtime ─────────────────────────────────────────────────────────────────

export interface RuntimeError {
  id: string;
  component: string;
  message: string;
  timestamp: number;
  severity: "error" | "warning" | "info";
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  config: AppConfig;
}