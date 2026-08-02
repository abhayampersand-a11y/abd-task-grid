import Link from "next/link";
import { CalendarDays, ListChecks, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn, formatDate, groupColor } from "@/lib/utils";
import type { GroupSummary } from "@/lib/types";

/** Derives the corner chip from the group's own numbers. */
function healthChip(group: GroupSummary) {
  if (group.taskCount === 0) {
    return { label: "NEW", className: "bg-surface-muted text-ink-muted" };
  }
  const done = group.completedTaskCount / group.taskCount;
  if (done >= 0.75) {
    return { label: "ON TRACK", className: "bg-aqua-100 text-aqua-700" };
  }
  if (done < 0.3) {
    return { label: "DUE SOON", className: "bg-lilac-100 text-lilac-600" };
  }
  return { label: "ACTIVE", className: "bg-brand-100 text-brand-600" };
}

export function GroupCard({ group }: { group: GroupSummary }) {
  const color = groupColor(group.colorKey);
  const chip = healthChip(group);
  const completion =
    group.taskCount === 0
      ? 0
      : Math.round((group.completedTaskCount / group.taskCount) * 100);

  return (
    <Link href={`/groups/${group.id}`} className="block">
      <article className="card card-interactive flex h-full flex-col p-5">
        <header className="flex items-start justify-between gap-3">
          <span
            className={cn(
              "flex size-12 items-center justify-center rounded-2xl text-lg font-bold",
              color.solid,
            )}
          >
            {group.name.slice(0, 1).toUpperCase()}
          </span>

          <span
            className={cn(
              "rounded-full px-3 py-1.5 text-[10px] font-bold tracking-wide",
              chip.className,
            )}
          >
            {chip.label}
          </span>
        </header>

        <h3 className="mt-4 text-[19px] font-bold leading-snug tracking-tight text-ink">
          {group.name}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-relaxed text-ink-muted">
          {group.description ?? "No description provided."}
        </p>

        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-ink-muted">
            <span>{completion}% complete</span>
            <span>
              {group.completedTaskCount}/{group.taskCount}
            </span>
          </div>
          <Progress value={completion} size="sm" />
        </div>

        <div className="mt-auto pt-5" aria-hidden />

        <footer className="flex items-center justify-between border-t border-line pt-4">
          <span className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-ink-soft">
            <Users className="size-4 text-ink-faint" />
            {group.memberCount} member{group.memberCount === 1 ? "" : "s"}
          </span>
          <span className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-ink-soft">
            <ListChecks className="size-4 text-aqua-500" />
            {group.taskCount} task{group.taskCount === 1 ? "" : "s"}
          </span>
        </footer>

        <p className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] text-ink-faint">
          <CalendarDays className="size-3.5" />
          Created {formatDate(group.createdAt)}
        </p>
      </article>
    </Link>
  );
}
