import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-2xl bg-brand-600 text-white shadow-pop",
        className ?? "size-9",
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-[58%]" aria-hidden>
        <circle
          cx="12"
          cy="12"
          r="9.25"
          stroke="currentColor"
          strokeWidth="1.9"
        />
        <path
          d="m8.2 12.3 2.6 2.7 5-5.6"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function Logo({
  className,
  showMark = false,
}: {
  className?: string;
  showMark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {showMark && <LogoMark />}
      <span className="text-[17px] font-bold tracking-tight text-brand-600">
        TaskFlow Pro
      </span>
    </span>
  );
}
