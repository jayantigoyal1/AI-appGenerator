"use client";
import React, { useId } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { FormConfig, FormField, FieldType } from "@/types";
import { VALID_FIELD_TYPES } from "@/types";
import { safeArray, safeString, safeBool, cn } from "@/lib/utils";
import { useRendererStore } from "@/stores";

// ─── Zod schema builder ───────────────────────────────────────────────────────

function buildSchema(fields: FormField[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of fields) {
    if (!f.name) continue;
    let s: z.ZodTypeAny;
    switch (f.type) {
      case "email":
        s = z.string().email("Enter a valid email address");
        break;
      case "number":
      case "range":
        s = z.coerce.number({ invalid_type_error: "Must be a number" });
        if (f.min !== undefined) s = (s as z.ZodNumber).min(f.min, `Minimum is ${f.min}`);
        if (f.max !== undefined) s = (s as z.ZodNumber).max(f.max, `Maximum is ${f.max}`);
        break;
      case "checkbox":
        s = z.boolean().optional().default(false);
        break;
      case "toggle":
        s = z.boolean().optional().default(false);
        break;
      case "url":
        s = z.string().url("Enter a valid URL (https://...)").or(z.literal(""));
        break;
      case "password":
        s = z.string();
        if (f.minLength) s = (s as z.ZodString).min(f.minLength, `At least ${f.minLength} characters`);
        if (f.maxLength) s = (s as z.ZodString).max(f.maxLength, `Maximum ${f.maxLength} characters`);
        break;
      default:
        s = z.string();
        if (f.minLength) s = (s as z.ZodString).min(f.minLength, `At least ${f.minLength} characters`);
        if (f.maxLength) s = (s as z.ZodString).max(f.maxLength, `Maximum ${f.maxLength} characters`);
    }
    if (f.required && !["checkbox", "toggle"].includes(f.type)) {
      if (s instanceof z.ZodString) s = s.min(1, `${f.label || f.name} is required`);
    }
    if (!f.required && !["checkbox", "toggle", "number", "range"].includes(f.type)) {
      s = s.optional();
    }
    shape[f.name] = s;
  }
  return z.object(shape);
}

// ─── Safe field normalizer ────────────────────────────────────────────────────

function normalizeField(raw: unknown, index: number): FormField | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const f = raw as Record<string, unknown>;
  const type = VALID_FIELD_TYPES.includes(f.type as FieldType)
    ? (f.type as FieldType)
    : "text";
  return {
    name:         safeString(f.name) || `field_${index}`,
    label:        safeString(f.label) || safeString(f.name) || `Field ${index + 1}`,
    type,
    placeholder:  safeString(f.placeholder),
    required:     safeBool(f.required),
    disabled:     safeBool(f.disabled),
    helpText:     safeString(f.helpText),
    width:        (f.width === "half" ? "half" : "full"),
    min:          f.min !== undefined ? Number(f.min) : undefined,
    max:          f.max !== undefined ? Number(f.max) : undefined,
    step:         f.step !== undefined ? Number(f.step) : undefined,
    minLength:    f.minLength !== undefined ? Number(f.minLength) : undefined,
    maxLength:    f.maxLength !== undefined ? Number(f.maxLength) : undefined,
    defaultValue: f.defaultValue,
    options: Array.isArray(f.options)
      ? f.options.map((o: unknown) => {
          if (typeof o === "object" && o !== null) {
            const oo = o as Record<string, unknown>;

            return {
              label:
                safeString(oo.label) ||
                safeString(oo.value),

              value:
                typeof oo.value === "number"
                  ? oo.value
                  : safeString(oo.value),
            };
          }

          return {
            label: String(o),
            value:
              typeof o === "number"
                ? o
                : String(o),
          };
        })
      : undefined,
  };
}

// ─── Input base styles ────────────────────────────────────────────────────────

const inputBase = "w-full px-3 py-2.5 text-sm text-neutral-800 bg-white border border-neutral-200 rounded-md placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all duration-150 shadow-xs";
const inputError = "border-danger-DEFAULT/60 focus:ring-danger-DEFAULT/20 focus:border-danger-DEFAULT/80";

// ─── Field component ──────────────────────────────────────────────────────────

function Field({ field, control, register, errors }: {
  field: FormField;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any; register: any; errors: any;
}) {
  const err = errors[field.name];
  const id = `field-${field.name}`;

  const renderInput = () => {
    switch (field.type) {
      case "textarea":
        return (
          <textarea
            id={id}
            {...register(field.name)}
            placeholder={field.placeholder}
            disabled={field.disabled}
            rows={4}
            className={cn(inputBase, "resize-y min-h-[90px]", err && inputError)}
          />
        );

      case "select":
        return (
          <select id={id} {...register(field.name)} disabled={field.disabled}
            className={cn(inputBase, "cursor-pointer appearance-none bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")] bg-[right_10px_center] bg-no-repeat pr-9", err && inputError)}
          >
            <option value="">Select an option…</option>
            {(field.options || []).map((opt, i) => (
              <option key={i} value={String(opt.value)}>{opt.label}</option>
            ))}
          </select>
        );

      case "checkbox":
        return (
          <label className="flex items-start gap-3 cursor-pointer group w-fit">
            <input type="checkbox" id={id} {...register(field.name)} disabled={field.disabled}
              className="mt-0.5 w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-400/30 cursor-pointer flex-shrink-0"
            />
            <span className="text-sm text-neutral-700 group-hover:text-neutral-900 transition-colors leading-5">
              {field.label}
              {field.required && <span className="text-danger-DEFAULT ml-1 text-xs">*</span>}
            </span>
          </label>
        );

      case "toggle":
        return (
          <Controller name={field.name} control={control} defaultValue={!!field.defaultValue}
            render={({ field: cf }) => (
              <label className="flex items-center gap-3 cursor-pointer w-fit group">
                <button type="button" role="switch" aria-checked={cf.value}
                  onClick={() => cf.onChange(!cf.value)}
                  className={cn("relative w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400/30",
                    cf.value ? "bg-primary-500" : "bg-neutral-300"
                  )}
                >
                  <span className={cn("absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200",
                    cf.value ? "translate-x-4" : "translate-x-0"
                  )} />
                </button>
                <span className="text-sm text-neutral-700 group-hover:text-neutral-900">{field.label}</span>
              </label>
            )}
          />
        );

      case "range":
        return (
          <Controller name={field.name} control={control} defaultValue={field.min ?? 0}
            render={({ field: cf }) => (
              <div className="space-y-2">
                <input type="range" id={id} min={field.min ?? 0} max={field.max ?? 100} step={field.step ?? 1}
                  value={cf.value} onChange={(e) => cf.onChange(Number(e.target.value))}
                  className="w-full h-1.5 appearance-none bg-neutral-200 rounded-full accent-primary-500 cursor-pointer"
                />
                <div className="flex justify-between text-xs text-neutral-400">
                  <span>{field.min ?? 0}</span>
                  <span className="font-medium text-primary-600">{cf.value}</span>
                  <span>{field.max ?? 100}</span>
                </div>
              </div>
            )}
          />
        );

      case "color":
        return (
          <div className="flex items-center gap-3">
            <input type="color" id={id} {...register(field.name)}
              className="w-10 h-10 rounded-md border border-neutral-200 cursor-pointer p-0.5 bg-white"
            />
            <span className="text-sm text-neutral-500">Click to choose a color</span>
          </div>
        );

      default: {
        const t = field.type === "phone" ? "tel" : field.type;
        return (
          <input type={t} id={id} {...register(field.name)}
            placeholder={field.placeholder}
            disabled={field.disabled}
            min={field.min}
            max={field.max}
            step={field.step}
            className={cn(inputBase, err && inputError)}
          />
        );
      }
    }
  };

  if (field.type === "checkbox") {
    return (
      <div className="pt-1">
        {renderInput()}
        {err && <p className="text-xs text-danger-text mt-1.5 flex items-center gap-1"><span>⚠</span>{err.message}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {field.type !== "toggle" && (
        <label htmlFor={id} className="block text-sm font-medium text-neutral-700">
          {field.label}
          {field.required && <span className="text-danger-DEFAULT ml-1">*</span>}
        </label>
      )}
      {renderInput()}
      {field.helpText && !err && (
        <p className="text-xs text-neutral-400">{field.helpText}</p>
      )}
      {err && (
        <p className="text-xs text-danger-text flex items-center gap-1.5 animate-fade-in">
          <span>⚠</span>{err.message}
        </p>
      )}
    </div>
  );
}

// ─── DynamicForm ──────────────────────────────────────────────────────────────

export function DynamicForm({ config }: { config: FormConfig }) {
  const formId = config.id || "default-form";
  const { setFormState, formStates, resetForm } = useRendererStore();
  const state = formStates[formId] || "idle";

  const rawFields = safeArray(config.fields);
  const fields = rawFields.map(normalizeField).filter((f): f is FormField => f !== null);

  const schema = buildSchema(fields);
  const defaultValues = Object.fromEntries(
    fields.map((f) => [f.name, f.defaultValue ?? (f.type === "checkbox" || f.type === "toggle" ? false : "")])
  );

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const isGrid = config.layout === "grid";

  const onSubmit = async () => {
    setFormState(formId, "loading");
    await new Promise((r) => setTimeout(r, 1100));
    setFormState(formId, "success");
    setTimeout(() => resetForm(formId), 3500);
  };

  if (state === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-5 animate-slide-up">
        <div className="w-16 h-16 rounded-2xl bg-success-light border border-success-border flex items-center justify-center">
          <svg className="w-8 h-8 text-success-text" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-neutral-800">Submitted successfully</p>
          <p className="text-sm text-neutral-500 mt-1">Your response has been recorded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {(config.title || config.description) && (
        <div className="space-y-1">
          {config.title && <h2 className="text-xl font-semibold text-neutral-800 tracking-tight">{config.title}</h2>}
          {config.description && <p className="text-sm text-neutral-500">{config.description}</p>}
        </div>
      )}

      {fields.length === 0 && (
        <div className="rounded-lg border border-warning-border bg-warning-light px-4 py-3 text-sm text-warning-text">
          No valid fields found in configuration.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={cn(
          isGrid ? "grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5" : "space-y-5"
        )}>
          {fields.map((field, i) => (
            <div key={field.name} className={cn(isGrid && field.width === "full" && "sm:col-span-2")}>
              <Field field={field} register={register} control={control} errors={errors} />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-7">
          <button
            type="submit"
            disabled={state === "loading"}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-medium rounded-md transition-all active:scale-[0.98] shadow-sm"
          >
            {state === "loading" ? (
              <>
                <svg className="w-4 h-4 animate-spin-slow" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Submitting…
              </>
            ) : (
              config.submitLabel || "Submit"
            )}
          </button>
          {config.cancelLabel && (
            <button type="button"
              className="px-5 py-2.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-all">
              {config.cancelLabel}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}