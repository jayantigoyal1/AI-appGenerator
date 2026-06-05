"use client";

interface ProgressItem {
  label: string;
  value: number;
}

interface Props {
  config: {
    title?: string;
    items?: ProgressItem[];
  };
}

export function DynamicProgress({ config }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-5">
      {config.title && (
        <h3 className="font-semibold mb-4">
          {config.title}
        </h3>
      )}

      <div className="space-y-4">
        {config.items?.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between text-sm mb-1">
              <span>{item.label}</span>
              <span>{item.value}%</span>
            </div>

            <div className="w-full bg-zinc-100 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-blue-500"
                style={{
                  width: `${item.value}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}