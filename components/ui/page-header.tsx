import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Breadcrumb, type Crumb } from "./breadcrumb";

export function PageHeader({
  title,
  description,
  crumbs,
  actions,
  aside,
}: {
  title: string;
  description?: string;
  crumbs?: Crumb[];
  actions?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <header className="space-y-3 lg:space-y-4">
      {crumbs && <Breadcrumb items={crumbs} />}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-5">
        <div className="min-w-0 space-y-2">
          {/* Phones get a compact one-line title so the content starts near the
              top of the viewport — when crumbs are present they already name
              the page, so the heading stays for screen readers only. */}
          <h1
            className={cn(
              "truncate text-[17px] font-semibold tracking-tight text-ink lg:whitespace-normal lg:text-[32px] lg:font-bold lg:leading-tight",
              crumbs && "sr-only lg:not-sr-only",
            )}
          >
            {title}
          </h1>
          {description && (
            <p className="hidden max-w-2xl text-sm leading-relaxed text-ink-muted lg:block">
              {description}
            </p>
          )}
        </div>
        {(actions || aside) && (
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            {aside}
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
