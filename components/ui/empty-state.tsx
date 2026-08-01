import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  illustration,
  title,
  description,
  actions,
  footnote,
  className,
}: {
  illustration?: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
  footnote?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-16 text-center animate-fade-up",
        className,
      )}
    >
      {illustration}
      <h2 className="mt-8 max-w-lg text-balance text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 max-w-md text-balance text-sm leading-relaxed text-ink-muted">
          {description}
        </p>
      )}
      {actions && (
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">{actions}</div>
      )}
      {footnote && (
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-ink-faint">
          {footnote}
        </div>
      )}
    </div>
  );
}
