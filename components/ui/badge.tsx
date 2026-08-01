import type { ReactNode } from "react";
import { cn, PRIORITY_META, STATUS_META } from "@/lib/utils";
import type { TaskPriority, TaskStatus, UserStatus } from "@/lib/types";

export function Badge({
  children,
  className,
  dot,
}: {
  children: ReactNode;
  className?: string;
  dot?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold tracking-wide",
        className,
      )}
    >
      {dot && <span className={cn("size-1.5 rounded-full", dot)} />}
      {children}
    </span>
  );
}

export function PriorityBadge({
  priority,
  className,
}: {
  priority: TaskPriority;
  className?: string;
}) {
  const meta = PRIORITY_META[priority];
  return (
    <Badge className={cn(meta.badge, "uppercase", className)} dot={meta.dot}>
      {meta.label}
    </Badge>
  );
}

export function StatusBadge({
  status,
  className,
}: {
  status: TaskStatus;
  className?: string;
}) {
  const meta = STATUS_META[status];
  return (
    <Badge className={cn(meta.badge, className)} dot={meta.dot}>
      {meta.label}
    </Badge>
  );
}

const USER_STATUS: Record<UserStatus, { label: string; className: string }> = {
  ACTIVE: { label: "Active", className: "bg-emerald-50 text-emerald-700" },
  PENDING: { label: "Pending", className: "bg-amber-50 text-amber-700" },
  DISABLED: { label: "Disabled", className: "bg-rose-50 text-rose-700" },
};

export function UserStatusBadge({ status }: { status: UserStatus }) {
  const meta = USER_STATUS[status];
  return <Badge className={meta.className}>{meta.label}</Badge>;
}
