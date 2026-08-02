"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CirclePlus, Plus, Star } from "lucide-react";
import { Button, Fab } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { EmptyGroupsIllustration } from "@/components/ui/illustrations";
import { PageHeader } from "@/components/ui/page-header";
import { CardSkeleton } from "@/components/ui/skeleton";
import { useGroupsQuery } from "@/store/api";
import { CreateGroupModal } from "./create-group-modal";
import { GroupCard } from "./group-card";

export function GroupsView() {
  const router = useRouter();
  const { data, isLoading } = useGroupsQuery();
  const [createOpen, setCreateOpen] = useState(false);

  const groups = data?.groups ?? [];

  const totalTasks = groups.reduce((sum, group) => sum + group.taskCount, 0);
  const totalDone = groups.reduce(
    (sum, group) => sum + group.completedTaskCount,
    0,
  );
  const overall = totalTasks === 0 ? 0 : Math.round((totalDone / totalTasks) * 100);

  const newThisMonth = groups.filter((group) => {
    const created = new Date(group.createdAt);
    const now = new Date();
    return (
      created.getMonth() === now.getMonth() &&
      created.getFullYear() === now.getFullYear()
    );
  }).length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="My Groups"
        description="Manage your team environments and collaborative task boards."
        actions={
          <Button
            icon={<CirclePlus className="size-4.5" />}
            onClick={() => setCreateOpen(true)}
          >
            Create New Group
          </Button>
        }
      />

      {isLoading ? (
        <CardSkeleton count={6} />
      ) : groups.length === 0 ? (
        <EmptyState
          illustration={<EmptyGroupsIllustration className="h-48 w-auto" />}
          title="You are not part of any group yet"
          description="Collaborate with your team by joining an existing workspace or creating a brand new group to manage your projects."
          actions={
            <Button
              size="lg"
              icon={<Plus className="size-4.5" />}
              onClick={() => setCreateOpen(true)}
            >
              Create Group
            </Button>
          }
        />
      ) : (
        <>
          {/* Summary banner */}
          <section className="grid gap-5 lg:grid-cols-[1.7fr_1fr]">
            <div className="relative overflow-hidden rounded-2xl bg-brand-600 p-7 text-white shadow-raise dark:bg-brand-500">
              <div
                className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10"
                aria-hidden
              />
              <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-white/70">
                Overall progress
              </p>
              <div className="mt-2 flex flex-wrap items-baseline gap-3">
                <span className="text-5xl font-bold tracking-tight">
                  {overall}%
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1 text-[12.5px] font-semibold">
                  {totalDone} of {totalTasks} tasks completed
                </span>
              </div>
              <div className="relative mt-6 h-2 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white transition-[width] duration-700 ease-out"
                  style={{ width: `${overall}%` }}
                />
              </div>
            </div>

            <div className="card flex flex-col justify-between p-7">
              <div className="flex items-start justify-between">
                <span className="flex size-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Star className="size-5" />
                </span>
                <span className="text-[12.5px] font-semibold text-emerald-600">
                  Active now
                </span>
              </div>
              <div className="mt-6">
                <p className="text-4xl font-bold tracking-tight text-ink">
                  {groups.length} Group{groups.length === 1 ? "" : "s"}
                </p>
                <p className="mt-1.5 text-[13px] text-ink-muted">
                  {newThisMonth} newly created this month
                </p>
              </div>
            </div>
          </section>

          {/* Group grid */}
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}

            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-line-strong bg-surface/40 p-6 text-center transition-all hover:border-brand-300 hover:bg-brand-50/40"
            >
              <span className="flex size-14 items-center justify-center rounded-full bg-surface-muted text-ink-muted">
                <Plus className="size-6" />
              </span>
              <span className="text-[15px] font-semibold text-ink">
                Create Another Group
              </span>
              <span className="text-[13px] text-ink-muted">
                Organize your projects efficiently
              </span>
            </button>
          </section>
        </>
      )}

      <Fab
        onClick={() => setCreateOpen(true)}
        label="Create a new group"
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
