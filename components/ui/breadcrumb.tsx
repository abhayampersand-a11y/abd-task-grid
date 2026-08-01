import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-[13px]">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className="text-ink-muted transition-colors hover:text-brand-700"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={last ? "font-semibold text-brand-700" : "text-ink-muted"}
                  aria-current={last ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
              {!last && (
                <ChevronRight className="size-3.5 text-ink-faint" aria-hidden />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
