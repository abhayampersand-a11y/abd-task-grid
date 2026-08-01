"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlarmClock,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CircleDot,
  Sparkles,
  Timer,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { PriorityBadge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { EmptyGroupsIllustration } from "@/components/ui/illustrations";
import { PageHeader } from "@/components/ui/page-header";
import { Progress } from "@/components/ui/progress";
import { CardSkeleton, StatSkeleton } from "@/components/ui/skeleton";
import { CreateGroupModal } from "@/components/groups/create-group-modal";
import { GroupCard } from "@/components/groups/group-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { cn, formatShortDate, isOverdue, relativeTime } from "@/lib/utils";
import { useDashboardQuery } from "@/store/api";

export function DashboardView() {
  const router = useRouter();
  const { data, isLoading } = useDashboardQuery();
  const [createOpen, setCreateOpen] = useState(false);

  if (isLoading || !data) {
    return (
      <div className="space-y-8">
        <div className="h-10 w-64 animate-shimmer rounded-lg bg-line/70" />
        <StatSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const { stats, groups, upcoming, recentActivity } = data;

  // ── Condition 1: not part of any group ────────────────────────────────
  if (groups.length === 0) {
    return (
      <>
        <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center">
          <EmptyState
            illustration={<EmptyGroupsIllustration className="h-52 w-auto" />}
            title="You are not part of any group yet"
            description="Collaborate with your team by joining an existing workspace or creating a brand new group to manage your projects."
            actions={
              <>
                <Button
                  size="lg"
                  icon={<UserPlus className="size-4.5" />}
                  onClick={() => setCreateOpen(true)}
                >
                  Create Group
                </Button>
                <Link href="/groups">
                  <Button size="lg" variant="outline" className="w-full">
                    Browse Groups
                  </Button>
                </Link>
              </>
            }
            footnote={
              <>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="size-3.5" />
                  Secure workspaces
                </span>
                <span className="inline-flex items-center gap-2">
                  <Zap className="size-3.5" />
                  Real-time sync
                </span>
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="size-3.5" />
                  Activity insights
                </span>
              </>
            }
          />
        </div>

        <CreateGroupModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreated={(groupId) => router.push(`/groups/${groupId}`)}
        />
      </>
    );
  }

  // ── Condition 2: has groups ───────────────────────────────────────────
  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Everything assigned to you, across every group you belong to."
        actions={
          <Link href="/groups">
            <Button variant="outline" iconRight={<ArrowRight className="size-4" />}>
              My Groups
            </Button>
          </Link>
        }
      />

      {/* Headline widgets */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="My pending tasks"
          value={stats.pending}
          icon={CircleDot}
          tone="brand"
          hint="Backlog and to-do"
        />
        <StatCard
          label="In progress"
          value={stats.inProgress}
          icon={Timer}
          tone="warning"
          hint="Actively being worked on"
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon={CheckCircle2}
          tone="success"
          hint={`${stats.completionRate}% completion rate`}
        />
        <StatCard
          label="Overdue"
          value={stats.overdue}
          icon={AlarmClock}
          tone="danger"
          hint="Past the due date"
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
          tone="warning"
        />
        <StatCard
          label="Due this week"
          value={stats.dueThisWeek}
          icon={CalendarClock}
        />
      </section>

      {/* Overall progress banner */}
      <section className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="relative overflow-hidden rounded-2xl bg-brand-600 p-7 text-white shadow-raise">
          <div
            className="pointer-events-none absolute -right-12 -top-12 size-56 rounded-full bg-white/10"
            aria-hidden
          />
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-white/70">
            Overall progress
          </p>
          <div className="mt-2 flex flex-wrap items-baseline gap-3">
            <span className="text-5xl font-bold tracking-tight">
              {stats.completionRate}%
            </span>
            <span className="rounded-full bg-white/15 px-3 py-1 text-[12.5px] font-semibold">
              {stats.completed} of {stats.assignedToMe} tasks done
            </span>
          </div>
          <div className="relative mt-6 h-2 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white transition-[width] duration-700 ease-out"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </div>

        <div className="card flex flex-col justify-between p-7">
          <div className="flex items-start justify-between">
            <span className="flex size-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Sparkles className="size-5" />
            </span>
            <span className="text-[12.5px] font-semibold text-emerald-600">
              Active now
            </span>
          </div>
          <div className="mt-6">
            <p className="text-4xl font-bold tracking-tight text-ink">
              {stats.groupCount} Group{stats.groupCount === 1 ? "" : "s"}
            </p>
            <p className="mt-1.5 text-[13px] text-ink-muted">
              You collaborate across {stats.groupCount} workspace
              {stats.groupCount === 1 ? "" : "s"}.
            </p>
          </div>
        </div>
      </section>

      {/* Upcoming deadlines + recent activity */}
      <section className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="card overflow-hidden">
          <header className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-[15px] font-semibold text-ink">
              Upcoming deadlines
            </h2>
            <Link
              href="/groups"
              className="text-[12.5px] font-semibold text-brand-600 hover:text-brand-700"
            >
              View all
            </Link>
          </header>

          {upcoming.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-ink-muted">
              Nothing on the horizon. Enjoy the calm.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {upcoming.map((task) => {
                const overdue = isOverdue(task.dueDate, task.status);
                return (
                  <li key={task.id}>
                    <Link
                      href={`/tasks/${task.id}`}
                      className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-muted"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-medium text-ink">
                          {task.title}
                        </p>
                        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-muted">
                          <span>{task.group.name}</span>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1",
                              overdue && "font-semibold text-rose-600",
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
                            className="mt-2 max-w-40"
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
        </div>

        <div className="card overflow-hidden">
          <header className="border-b border-line px-5 py-4">
            <h2 className="text-[15px] font-semibold text-ink">
              Recent activity
            </h2>
          </header>

          {recentActivity.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-ink-muted">
              No activity yet.
            </p>
          ) : (
            <ul className="space-y-4 px-5 py-5">
              {recentActivity.map((activity) => (
                <li key={activity.id} className="flex gap-3">
                  <Avatar user={activity.actor} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] leading-snug text-ink-soft">
                      <span className="font-semibold text-ink">
                        {activity.actor.fullName}
                      </span>{" "}
                      {activity.message.replace(
                        `${activity.actor.fullName} `,
                        "",
                      )}
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-ink-faint">
                      {relativeTime(activity.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Groups */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-ink">
            My Groups
          </h2>
          <Button
            variant="outline"
            size="sm"
            icon={<UserPlus className="size-4" />}
            onClick={() => setCreateOpen(true)}
          >
            Create New Group
          </Button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {groups.slice(0, 6).map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      </section>

      <CreateGroupModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(groupId) => router.push(`/groups/${groupId}`)}
      />
    </div>
  );
}
