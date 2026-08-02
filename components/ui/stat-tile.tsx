import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "brand" | "lilac" | "aqua" | "plain";

const TONES: Record<Tone, { wrap: string; icon: string; label: string }> = {
  brand: {
    wrap: "bg-brand-500 text-white",
    icon: "bg-white/25 text-white",
    label: "text-white/80",
  },
  lilac: {
    wrap: "bg-lilac-100 text-lilac-700",
    icon: "bg-lilac-500 text-white",
    label: "text-lilac-700/75",
  },
  aqua: {
    wrap: "bg-aqua-500 text-white",
    icon: "bg-white/25 text-white",
    label: "text-white/85",
  },
  plain: {
    wrap: "bg-surface text-ink shadow-soft",
    icon: "bg-brand-100 text-brand-600",
    label: "text-ink-muted",
  },
};

/**
 * The chunky colour-blocked tiles from the group header. `wide` fills the
 * larger left-hand slot of the mobile 2-column layout.
 */
export function StatTile({
  label,
  value,
  icon: Icon,
  tone = "plain",
  wide = false,
  className,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: Tone;
  wide?: boolean;
  className?: string;
}) {
  const meta = TONES[tone];

  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-tile p-4",
        wide ? "row-span-2" : "",
        meta.wrap,
        className,
      )}
    >
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-full",
          meta.icon,
        )}
      >
        <Icon className="size-4.5" />
      </span>

      <div className={wide ? "mt-6" : "mt-3"}>
        <p
          className={cn(
            "font-bold leading-none tracking-tight",
            wide ? "text-4xl" : "text-2xl",
          )}
        >
          {value}
        </p>
        <p
          className={cn(
            "mt-1.5 text-[10.5px] font-semibold uppercase tracking-[0.1em]",
            meta.label,
          )}
        >
          {label}
        </p>
      </div>
    </div>
  );
}
