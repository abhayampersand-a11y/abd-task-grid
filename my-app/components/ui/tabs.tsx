"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TabItem<T extends string> {
  value: T;
  label: string;
  count?: number;
}

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  className,
  trailing,
}: {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  trailing?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-line sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div
        role="tablist"
        className="no-scrollbar -mb-px flex gap-1 overflow-x-auto"
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
                "relative shrink-0 whitespace-nowrap border-b-2 px-3.5 pb-3 pt-2 text-[13px] font-semibold uppercase tracking-wide transition-colors",
                active
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-ink-muted hover:text-ink-soft",
              )}
            >
              {item.label}
              {item.count !== undefined && (
                <span
                  className={cn(
                    "ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                    active
                      ? "bg-brand-50 text-brand-700"
                      : "bg-line text-ink-muted",
                  )}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {trailing && <div className="pb-3 sm:pb-2.5">{trailing}</div>}
    </div>
  );
}
