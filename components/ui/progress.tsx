import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
  barClassName,
  size = "md",
}: {
  value: number;
  className?: string;
  barClassName?: string;
  size?: "sm" | "md";
}) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "w-full overflow-hidden rounded-full bg-line",
        size === "sm" ? "h-1" : "h-1.5",
        className,
      )}
    >
      <div
        className={cn(
          "h-full rounded-full bg-brand-600 transition-[width] duration-500 ease-out",
          barClassName,
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
