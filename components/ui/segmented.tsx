"use client";

import { cn } from "@/lib/utils";

export interface SegmentItem<T extends string> {
  value: T;
  label: string;
  count?: number;
}

/**
 * Pill-in-a-pill switch used for the task tabs. Reads better than underlined
 * tabs on a phone, and stays comfortable on desktop.
 */
export function Segmented<T extends string>({
  items,
  value,
  onChange,
  className,
}: {
  items: SegmentItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex w-full gap-1 rounded-full bg-surface-muted p-1.5",
        className,
      )}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2.5",
              "text-[13px] font-semibold transition-all duration-200",
              active
                ? "bg-brand-600 text-white shadow-pop"
                : "text-ink-muted hover:text-ink-soft",
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 text-[10px] font-bold leading-4",
                  active ? "bg-white/25 text-white" : "bg-line text-ink-muted",
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
