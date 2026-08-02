"use client";

import { cn } from "@/lib/utils";

export interface SegmentItem<T extends string> {
  value: T;
  label: string;
  count?: number;
}

/**
 * Pill-in-a-pill switch. Used below `lg` in place of underlined tabs, which
 * are hard to hit accurately with a thumb.
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
      className={cn("flex w-full gap-1 rounded-xl bg-surface-muted p-1", className)}
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
              "flex min-h-11 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3",
              "text-[13px] font-semibold transition-all duration-200",
              active
                ? "bg-surface text-brand-700 shadow-soft"
                : "text-ink-muted active:bg-surface/60",
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 text-[10px] font-bold leading-4",
                  active ? "bg-brand-50 text-brand-700" : "bg-line text-ink-muted",
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
