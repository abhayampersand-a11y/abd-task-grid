import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
  hint,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: "default" | "brand" | "warning" | "success" | "danger";
  hint?: string;
}) {
  const tints = {
    default: "bg-surface-muted text-ink-soft",
    brand: "bg-brand-50 text-brand-600",
    warning: "bg-amber-50 text-amber-600",
    success: "bg-emerald-50 text-emerald-600",
    danger: "bg-rose-50 text-rose-600",
  } as const;

  return (
    <div className="card card-interactive p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-faint">
          {label}
        </p>
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl",
            tints[tone],
          )}
        >
          <Icon className="size-4.5" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-ink">{value}</p>
      {hint && <p className="mt-1 text-[12.5px] text-ink-muted">{hint}</p>}
    </div>
  );
}
