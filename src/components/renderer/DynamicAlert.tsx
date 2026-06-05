"use client";

interface Props {
  config: {
    title?: string;
    message?: string;
    variant?: "info" | "success" | "warning" | "danger";
  };
}

export function DynamicAlert({ config }: Props) {
  const variant = config.variant ?? "info";

  const styles = {
    info: "bg-blue-50 border-blue-200 text-blue-700",
    success: "bg-green-50 border-green-200 text-green-700",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-700",
    danger: "bg-red-50 border-red-200 text-red-700",
  };

  return (
    <div className={`rounded-2xl border p-4 ${styles[variant]}`}>
      {config.title && (
        <h3 className="font-semibold mb-1">
          {config.title}
        </h3>
      )}

      {config.message && (
        <p className="text-sm">
          {config.message}
        </p>
      )}
    </div>
  );
}