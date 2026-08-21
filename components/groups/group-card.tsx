import Link from "next/link";
import { CalendarDays, Lock, Globe } from "lucide-react";
import { AvatarGroup } from "@/components/ui/avatar";
import { GroupIcon } from "@/components/ui/group-icon";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/utils";
import type { GroupSummary } from "@/lib/types";

export function GroupCard({ group }: { group: GroupSummary }) {
  const completion =
    group.taskCount === 0
      ? 0
      : Math.round((group.completedTaskCount / group.taskCount) * 100);

  return (
    <Link href={`/groups/${group.id}`} className="block">
      <article className="card card-interactive flex h-full flex-col p-5">
        <header className="flex items-start justify-between gap-3">
          <GroupIcon group={group} size="md" />
          <AvatarGroup
            users={group.members}
            total={group.memberCount}
            max={3}
            size="sm"
          />
        </header>

        <h3 className="mt-5 text-[17px] font-semibold tracking-tight text-ink">
          {group.name}
        </h3>
        <p className="mt-1.5 line-clamp-2 min-h-10 text-[13.5px] leading-relaxed text-ink-muted">
          {group.description ?? "No description provided."}
        </p>

        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-ink-muted">
            <span>Completion</span>
            <span>{completion}%</span>
          </div>
          <Progress value={completion} size="sm" />
        </div>

        <div className="mt-auto pt-5" aria-hidden />

        <div className="grid grid-cols-2 gap-4 border-t border-line pt-4">
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-faint">
              Total members
            </p>
            <p className="mt-1 text-[15px] font-bold text-ink">
              {group.memberCount} Member{group.memberCount === 1 ? "" : "s"}
            </p>
          </div>
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-faint">
              Total tasks
            </p>
            <p className="mt-1 text-[15px] font-bold text-ink">
              {group.taskCount} Task{group.taskCount === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <footer className="mt-4 flex items-center justify-between text-[12px] text-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5" />
            Created {formatDate(group.createdAt)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            {group.visibility === "PUBLIC" ? (
              <Globe className="size-3.5" />
            ) : (
              <Lock className="size-3.5" />
            )}
            {group.visibility === "PUBLIC" ? "Public" : "Private"}
          </span>
        </footer>
      </article>
    </Link>
  );
}
