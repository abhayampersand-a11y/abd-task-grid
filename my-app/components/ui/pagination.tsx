"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Compact page list: 1 … 4 5 6 … 20 */
function pageWindow(page: number, totalPages: number): (number | "gap")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);
  const sorted = [...pages]
    .filter((n) => n >= 1 && n <= totalPages)
    .sort((a, b) => a - b);

  const result: (number | "gap")[] = [];
  let previous = 0;
  for (const current of sorted) {
    if (previous && current - previous > 1) result.push("gap");
    result.push(current);
    previous = current;
  }
  return result;
}

export function Pagination({
  page,
  totalPages,
  onChange,
  summary,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  summary?: string;
}) {
  const buttonBase =
    "inline-flex size-9 items-center justify-center rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none";

  return (
    <div className="flex flex-col items-center gap-4 px-5 py-4 sm:flex-row sm:justify-between">
      {summary && <p className="text-[13px] text-ink-muted">{summary}</p>}

      <nav className="flex items-center gap-1" aria-label="Pagination">
        <button
          type="button"
          className={cn(buttonBase, "border border-line hover:bg-surface-muted")}
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </button>

        {pageWindow(page, totalPages).map((entry, index) =>
          entry === "gap" ? (
            <span
              key={`gap-${index}`}
              className="px-1.5 text-sm text-ink-faint"
            >
              …
            </span>
          ) : (
            <button
              key={entry}
              type="button"
              onClick={() => onChange(entry)}
              aria-current={entry === page ? "page" : undefined}
              className={cn(
                buttonBase,
                entry === page
                  ? "bg-brand-600 text-white shadow-soft"
                  : "text-ink-soft hover:bg-surface-muted",
              )}
            >
              {entry}
            </button>
          ),
        )}

        <button
          type="button"
          className={cn(buttonBase, "border border-line hover:bg-surface-muted")}
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </button>
      </nav>
    </div>
  );
}
