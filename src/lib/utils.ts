import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { AppConfig, ValidationResult } from "@/types";
import { VALID_FIELD_TYPES, VALID_COMPONENT_TYPES } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Safe coercions ──────────────────────────────────────────────────────────

export function safeString(v: unknown, fallback = ""): string {
  if (v === null || v === undefined) return fallback;
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return fallback;
}

export function safeNumber(v: unknown, fallback = 0): number {
  if (typeof v === "number" && isFinite(v)) return v;
  const n = Number(v);
  return isFinite(n) ? n : fallback;
}

export function safeArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

export function safeObject(v: unknown): Record<string, unknown> {
  if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, unknown>;
  return {};
}

export function safeBool(v: unknown, fallback = false): boolean {
  if (typeof v === "boolean") return v;
  if (v === "true") return true;
  if (v === "false") return false;
  return fallback;
}

// ─── JSON parsing ────────────────────────────────────────────────────────────

export function safeParseJson(raw: string): { config: AppConfig | null; parseError: string | null } {
  const trimmed = raw.trim();
  if (!trimmed) return { config: null, parseError: null };
  try {
    const config = JSON.parse(trimmed) as AppConfig;
    if (typeof config !== "object" || config === null || Array.isArray(config)) {
      return { config: null, parseError: "Root value must be a JSON object, not an array or primitive." };
    }
    return { config, parseError: null };
  } catch (e) {
    return { config: null, parseError: (e as Error).message };
  }
}

// ─── Config validation ───────────────────────────────────────────────────────

export function validateConfig(config: unknown): ValidationResult {
  const errors: ValidationResult["errors"] = [];
  const warnings: ValidationResult["warnings"] = [];

  if (!config || typeof config !== "object" || Array.isArray(config)) {
    errors.push({ path: "root", message: "Configuration must be a JSON object" });
    return { valid: false, errors, warnings };
  }

  const cfg = config as Record<string, unknown>;

  if (!cfg.type) {
    errors.push({ path: "type", message: 'Missing required field "type"' });
    return { valid: false, errors, warnings };
  }

  if (typeof cfg.type !== "string") {
    errors.push({ path: "type", message: `"type" must be a string, got ${typeof cfg.type}` });
    return { valid: false, errors, warnings };
  }

  const type = cfg.type;

  if (!VALID_COMPONENT_TYPES.includes(type as never)) {
    warnings.push({ path: "type", message: `Unknown component type "${type}" — will render unsupported fallback` });
    return { valid: true, errors, warnings };
  }

  switch (type) {
    case "form":   validateForm(cfg, errors, warnings); break;
    case "table":  validateTable(cfg, errors, warnings); break;
    case "dashboard": validateDashboard(cfg, warnings); break;
    case "tabs":   validateTabs(cfg, warnings); break;
    case "layout": validateLayout(cfg, errors, warnings); break;
    case "progress": validateProgress(cfg, warnings); break;
  }

  return { valid: errors.length === 0, errors, warnings };
}

function validateForm(cfg: Record<string, unknown>, errors: ValidationResult["errors"], warnings: ValidationResult["warnings"]) {
  if (cfg.fields === undefined || cfg.fields === null) {
    errors.push({ path: "fields", message: "Form requires a \"fields\" array" });
    return;
  }
  if (!Array.isArray(cfg.fields)) {
    errors.push({ path: "fields", message: `"fields" must be an array, got ${typeof cfg.fields}` });
    return;
  }
  cfg.fields.forEach((f: unknown, i: number) => {
    if (!f || typeof f !== "object" || Array.isArray(f)) {
      warnings.push({ path: `fields[${i}]`, message: `Field at index ${i} must be an object — skipped` });
      return;
    }
    const field = f as Record<string, unknown>;
    if (!field.name) warnings.push({ path: `fields[${i}].name`, message: `Field ${i} missing "name" — will use fallback` });
    if (!field.type) warnings.push({ path: `fields[${i}].type`, message: `Field ${i} missing "type" — will default to text` });
    else if (!VALID_FIELD_TYPES.includes(field.type as never)) {
      warnings.push({ path: `fields[${i}].type`, message: `Unknown field type "${field.type}" — will default to text` });
    }
    if (field.type === "select" && (!field.options || !Array.isArray(field.options))) {
      warnings.push({ path: `fields[${i}].options`, message: `Select field "${field.name}" has no options` });
    }
  });
}

function validateTable(cfg: Record<string, unknown>, errors: ValidationResult["errors"], warnings: ValidationResult["warnings"]) {
  if (!cfg.columns) { errors.push({ path: "columns", message: 'Table requires a "columns" array' }); return; }
  if (!Array.isArray(cfg.columns)) { errors.push({ path: "columns", message: '"columns" must be an array' }); return; }
  if (cfg.columns.length === 0) warnings.push({ path: "columns", message: "Table has no columns defined" });
  if (cfg.data !== undefined && !Array.isArray(cfg.data)) {
    warnings.push({ path: "data", message: '"data" should be an array — ignored' });
  }
}

function validateDashboard(cfg: Record<string, unknown>, warnings: ValidationResult["warnings"]) {
  if (!cfg.widgets) { warnings.push({ path: "widgets", message: "Dashboard has no widgets" }); return; }
  if (!Array.isArray(cfg.widgets)) warnings.push({ path: "widgets", message: '"widgets" must be an array' });
}

function validateTabs(cfg: Record<string, unknown>, warnings: ValidationResult["warnings"]) {
  if (!cfg.tabs) { warnings.push({ path: "tabs", message: "Tabs component has no tabs defined" }); return; }
  if (!Array.isArray(cfg.tabs)) warnings.push({ path: "tabs", message: '"tabs" must be an array' });
}

function validateLayout(cfg: Record<string, unknown>, errors: ValidationResult["errors"], warnings: ValidationResult["warnings"]) {
  if (!cfg.children) { errors.push({ path: "children", message: 'Layout requires a "children" array' }); return; }
  if (!Array.isArray(cfg.children)) errors.push({ path: "children", message: '"children" must be an array' });
  else if (cfg.children.length === 0) warnings.push({ path: "children", message: "Layout has no children" });
}

function validateProgress(cfg: Record<string, unknown>, warnings: ValidationResult["warnings"]) {
  const hasItems = Array.isArray(cfg.items) && cfg.items.length > 0;
  const hasValue = cfg.value !== undefined;
  if (!hasItems && !hasValue) warnings.push({ path: "value", message: 'Progress needs "value" (0–100) or "items" array' });
}

// ─── Format helpers ──────────────────────────────────────────────────────────

export function formatCurrency(v: unknown): string {
  const n = safeNumber(v);
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);
}

export function formatDate(v: unknown): string {
  if (!v) return "—";
  try {
    return new Date(String(v)).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch { return String(v); }
}

export function formatDatetime(v: unknown): string {
  if (!v) return "—";
  try {
    return new Date(String(v)).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return String(v); }
}

export function formatPercent(v: unknown): string {
  const n = safeNumber(v);
  return `${n.toLocaleString()}%`;
}