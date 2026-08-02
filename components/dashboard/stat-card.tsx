import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "default" | "brand" | "lilac" | "aqua" | "warning" | "success" | "danger";

const TONES: Record<Tone, { icon: string; value: string }> = {
  default: { icon: "bg-surface-muted text-ink-soft", value: "text-ink" },
  brand: { icon: "bg-brand-100 text-brand-600", value: "text-ink" },
  lilac: { icon: "bg-lilac-100 text-lilac-600", value: "text-ink" },
  aqua: { icon: "bg-aqua-100 text-aqua-700", value: "text-ink" },
  warning: { icon: "bg-amber-100 text-amber-600", value: "text-ink" },
  success: { icon: "bg-emerald-100 text-emerald-600", value: "text-ink" },
  danger: { icon: "bg-brand-600 text-white", value: "text-brand-600" },
};

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
  tone?: Tone;
  hint?: string;
}) {
  const meta = TONES[tone];

  return (
    <div className="card card-interactive p-4 sm:p-5">
      <span
        className={cn(
          "flex size-10 items-center justify-center rounded-full",
          meta.icon,
        )}
      >
        <Icon className="size-4.5" />
      </span>

      <p
        className={cn(
          "mt-4 text-[28px] font-bold leading-none tracking-tight",
          meta.value,
        )}
      >
        {value}
      </p>
      <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-faint">
        {label}
      </p>
      {hint && <p className="mt-1 text-[12px] text-ink-muted">{hint}</p>}
    </div>
  );
}
