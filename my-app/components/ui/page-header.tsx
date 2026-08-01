import type { ReactNode } from "react";
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
    <header className="space-y-4">
      {crumbs && <Breadcrumb items={crumbs} />}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-[32px] sm:leading-tight">
            {title}
          </h1>
          {description && (
            <p className="max-w-2xl text-sm leading-relaxed text-ink-muted">
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
