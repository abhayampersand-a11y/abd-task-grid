"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlarmClock,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Plus,
  Timer,
  UserPlus,
  Users,
} from "lucide-react";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { PriorityBadge, StatusBadge } from "@/components/ui/badge";
import { Button, Fab } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Progress } from "@/components/ui/progress";
import { CardSkeleton, Skeleton, StatSkeleton } from "@/components/ui/skeleton";
import { CreateGroupModal } from "@/components/groups/create-group-modal";
import { GroupCard } from "@/components/groups/group-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { NoGroupsState } from "@/components/dashboard/no-groups-state";
import { useShell } from "@/components/layout/shell-context";
import { cn, formatShortDate, isOverdue, relativeTime } from "@/lib/utils";
import { useDashboardQuery } from "@/store/api";

export function DashboardView() {
  const router = useRouter();
  const { user, openTaskModal } = useShell();
  const { data, isLoading } = useDashboardQuery();
  const [createOpen, setCreateOpen] = useState(false);

  if (isLoading || !data) {
    return (
      <div className="space-y-6 pt-4">
        <Skeleton className="h-9 w-52" />
        <Skeleton className="h-32 w-full rounded-card" />
        <StatSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const { stats, groups, upcoming, recentActivity } = data;
  const firstName = user.fullName.split(" ")[0];

  // ── Condition 1: not part of any group ────────────────────────────────
  if (groups.length === 0) {
    return (
      <>
        <NoGroupsState
          onCreate={() => setCreateOpen(true)}
          onBrowse={() => router.push("/groups")}
        />
        <CreateGroupModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreated={(groupId) => router.push(`/groups/${groupId}`)}
        />
      </>
    );
  }

  // ── Condition 2: has groups ───────────────────────────────────────────
  const featured = upcoming[0];
  const openTaskCount = stats.pending + stats.inProgress;

  return (
    <div className="space-y-7 pt-2 lg:pt-0">
      {/* Greeting — phone only; desktop keeps the page header below */}
      <header className="lg:hidden">
        <h1 className="text-[30px] font-bold leading-tight tracking-tight text-ink">
          Hi, {firstName}! <span aria-hidden>👋</span>
        </h1>
        <p className="mt-1 text-[14.5px] text-ink-muted">
          You have {openTaskCount} open task{openTaskCount === 1 ? "" : "s"}{" "}
          across {stats.groupCount} group{stats.groupCount === 1 ? "" : "s"}{" "}
          today.
        </p>
      </header>

      <div className="hidden lg:block">
        <PageHeader
          title={`Hi, ${firstName} 👋`}
          description={`You have ${openTaskCount} open tasks across ${stats.groupCount} groups today.`}
          actions={
            <Link href="/groups">
              <Button iconRight={<ArrowRight className="size-4" />}>
                My Groups
              </Button>
            </Link>
          }
        />
      </div>

      {/* Featured task — the next thing due */}
      {featured && (
        <Link href={`/tasks/${featured.id}`} className="block">
          <article className="relative overflow-hidden rounded-card bg-aqua-500 p-5 text-white shadow-raise transition-transform active:scale-[0.99]">
            <div
              className="pointer-events-none absolute -right-10 -top-12 size-44 rounded-full bg-white/10"
              aria-hidden
            />
            <span className="relative inline-flex rounded-full bg-white/25 px-3 py-1 text-[10px] font-bold tracking-wide">
              {isOverdue(featured.dueDate, featured.status)
                ? "OVERDUE"
                : "PRIORITY"}
            </span>

            <h2 className="relative mt-3 text-[21px] font-bold leading-snug tracking-tight">
              {featured.title}
            </h2>

            <div className="relative mt-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {featured.assignee && (
                  <AvatarGroup
                    users={[featured.assignee, featured.createdBy]}
                    max={2}
                    size="sm"
                  />
                )}
                <span className="text-[12.5px] font-medium text-white/85">
                  {formatShortDate(featured.dueDate)}
                </span>
              </div>
              <ChevronRight className="size-6 shrink-0" />
            </div>
          </article>
        </Link>
      )}

      {/* Stat widgets */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Pending"
          value={stats.pending}
          icon={CircleDot}
          tone="brand"
        />
        <StatCard
          label="In progress"
          value={stats.inProgress}
          icon={Timer}
          tone="lilac"
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon={CheckCircle2}
          tone="aqua"
          hint={`${stats.completionRate}% completion rate`}
        />
        <StatCard
          label="Overdue"
          value={stats.overdue}
          icon={AlarmClock}
          tone="danger"
        />
      </section>

      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Assigned to me"
          value={stats.assignedToMe}
          icon={UserPlus}
        />
        <StatCard
          label="Assigned by me"
          value={stats.assignedByMe}
          icon={Users}
        />
        <StatCard
          label="Due today"
          value={stats.dueToday}
          icon={CalendarClock}
          tone="brand"
        />
        <StatCard
          label="Due this week"
          value={stats.dueThisWeek}
          icon={CalendarClock}
        />
      </section>

      {/* Your groups */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-bold tracking-tight text-ink">
            Your Groups
          </h2>
          <Link
            href="/groups"
            className="text-[13.5px] font-bold text-brand-600"
          >
            View all
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {groups.slice(0, 6).map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      </section>

      {/* Upcoming deadlines */}
      <section className="space-y-4">
        <h2 className="text-[20px] font-bold tracking-tight text-ink">
          Upcoming deadlines
        </h2>

        {upcoming.length === 0 ? (
          <div className="card p-8 text-center text-sm text-ink-muted">
            Nothing on the horizon. Enjoy the calm.
          </div>
        ) : (
          <ul className="space-y-3">
            {upcoming.map((task) => {
              const overdue = isOverdue(task.dueDate, task.status);
              return (
                <li key={task.id}>
                  <Link
                    href={`/tasks/${task.id}`}
                    className="card card-interactive flex items-center gap-4 p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-semibold text-ink">
                        {task.title}
                      </p>
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-muted">
                        <span>{task.group.name}</span>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1",
                            overdue && "font-bold text-brand-600",
                          )}
                        >
                          <CalendarClock className="size-3" />
                          {formatShortDate(task.dueDate)}
                        </span>
                      </p>
                      {task.progress > 0 && (
                        <Progress
                          value={task.progress}
                          size="sm"
                          className="mt-2.5 max-w-44"
                        />
                      )}
                    </div>
                    <div className="hidden shrink-0 sm:block">
                      <PriorityBadge priority={task.priority} />
                    </div>
                    <StatusBadge status={task.status} />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Recent activity */}
      {recentActivity.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-[20px] font-bold tracking-tight text-ink">
            Recent activity
          </h2>
          <ul className="card space-y-4 p-5">
            {recentActivity.map((activity) => (
              <li key={activity.id} className="flex gap-3">
                <Avatar user={activity.actor} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] leading-snug text-ink-soft">
                    <span className="font-bold text-ink">
                      {activity.actor.fullName}
                    </span>{" "}
                    {activity.message.replace(`${activity.actor.fullName} `, "")}
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-ink-faint">
                    {relativeTime(activity.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Fab
        onClick={openTaskModal}
        label="Assign a new task"
        icon={<Plus className="size-7" />}
      />

      <CreateGroupModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(groupId) => router.push(`/groups/${groupId}`)}
      />
    </div>
  );
}
