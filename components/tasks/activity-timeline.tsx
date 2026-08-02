import { cn, relativeTime } from "@/lib/utils";
import type { ActivityDto, ActivityType } from "@/lib/types";

const DOT: Record<ActivityType, string> = {
  TASK_CREATED: "bg-brand-500",
  STATUS_CHANGED: "bg-sky-500",
  PRIORITY_CHANGED: "bg-amber-500",
  PROGRESS_UPDATED: "bg-emerald-500",
  ASSIGNEE_CHANGED: "bg-violet-500",
  DUE_DATE_CHANGED: "bg-rose-500",
  DESCRIPTION_UPDATED: "bg-ink-faint",
  COMMENT_ADDED: "bg-violet-500",
  ATTACHMENT_ADDED: "bg-teal-500",
  MEMBER_ADDED: "bg-brand-400",
  GROUP_CREATED: "bg-brand-500",
};

export function ActivityTimeline({ items }: { items: ActivityDto[] }) {
  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-[13px] text-ink-muted">
        No activity recorded yet.
      </p>
    );
  }

  return (
    <ol className="relative space-y-5 pl-5">
      <span
        className="absolute bottom-2 left-[3.5px] top-2 w-px bg-line"
        aria-hidden
      />
      {items.map((item) => (
        <li key={item.id} className="relative">
          <span
            className={cn(
              "absolute -left-5 top-1.5 size-2 rounded-full ring-4 ring-surface",
              DOT[item.type],
            )}
            aria-hidden
          />
          <p className="text-[13px] font-medium leading-snug text-ink">
            {item.message}
          </p>
          <p className="mt-0.5 text-[11.5px] text-ink-muted">
            by {item.actor.fullName} · {relativeTime(item.createdAt)}
          </p>
        </li>
      ))}
    </ol>
  );
}
