import { cn } from "@/lib/utils";
import { TaskgridIcon } from "@/components/ui/taskgrid-icon";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        className ?? "size-9",
      )}
    >
      <TaskgridIcon className="size-full" />
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
