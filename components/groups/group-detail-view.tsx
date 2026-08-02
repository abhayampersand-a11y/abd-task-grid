"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Clock,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Users,
  Zap,
} from "lucide-react";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { Button, Fab } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { EmptyTasksIllustration } from "@/components/ui/illustrations";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { CardSkeleton } from "@/components/ui/skeleton";
import { Segmented } from "@/components/ui/segmented";
import { StatTile } from "@/components/ui/stat-tile";
import { ConfirmDialog, Modal } from "@/components/ui/modal";
import { AssignTaskModal } from "@/components/tasks/assign-task-modal";
import { EditTaskModal } from "@/components/tasks/edit-task-modal";
import { TaskCard } from "@/components/tasks/task-card";
import { TaskFilters } from "@/components/tasks/task-filters";
import type { TaskSummary } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setActiveTaskTab, setTaskFilter } from "@/store/ui-slice";
import {
  toApiError,
  useDeleteTaskMutation,
  useGroupQuery,
  useTasksQuery,
} from "@/store/api";
import { GroupSettingsModal } from "./group-settings-modal";

export function GroupDetailView({ groupId }: { groupId: string }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const tab = useAppSelector((state) => state.ui.activeTaskTab);
  const filters = useAppSelector((state) => state.ui.taskFilters);

  const [assignOpen, setAssignOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [editing, setEditing] = useState<TaskSummary | null>(null);
  const [deleting, setDeleting] = useState<TaskSummary | null>(null);

  const { data: groupData, isLoading: groupLoading, isError } =
    useGroupQuery(groupId);
  const [deleteTask, { isLoading: deletingTask }] = useDeleteTaskMutation();

  const query = useMemo(
    () => ({
      scope: tab,
      groupId,
      status: filters.status === "ALL" ? undefined : filters.status,
      priority: filters.priority === "ALL" ? undefined : filters.priority,
      assignedBy:
        tab === "assigned-to-me" && filters.assignedBy !== "ALL"
          ? filters.assignedBy
          : undefined,
      q: filters.search || undefined,
      sort: filters.sort,
    }),
    [tab, groupId, filters],
  );

  const { data: tasksData, isFetching } = useTasksQuery(query);
  const { data: toMe } = useTasksQuery({ scope: "assigned-to-me", groupId });
  const { data: byMe } = useTasksQuery({ scope: "assigned-by-me", groupId });

  if (groupLoading) {
    return (
      <div className="space-y-6 pt-4">
        <div className="h-9 w-64 animate-shimmer rounded-lg bg-line" />
        <div className="h-40 w-full animate-shimmer rounded-card bg-line" />
        <CardSkeleton />
      </div>
    );
  }

  if (isError || !groupData) {
    return (
      <EmptyState
        title="Group not found"
        description="It may have been deleted, or you no longer have access to it."
        actions={
          <Button onClick={() => router.push("/groups")}>
            Back to my groups
          </Button>
        }
      />
    );
  }

  const group = groupData.group;
  const tasks = tasksData?.tasks ?? [];
  const assigners = group.allMembers.map((member) => member.user);
  const activeFilterCount =
    (filters.status !== "ALL" ? 1 : 0) +
    (filters.priority !== "ALL" ? 1 : 0) +
    (filters.assignedBy !== "ALL" ? 1 : 0) +
    (filters.sort !== "newest" ? 1 : 0);

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await deleteTask(deleting.id).unwrap();
      toast.success("Task deleted");
      setDeleting(null);
    } catch (error) {
      toast.error(toApiError(error).message);
    }
  }

  return (
    <div className="space-y-6 pt-2 lg:pt-0">
      <div className="hidden lg:block">
        <Breadcrumb
          items={[{ label: "Groups", href: "/groups" }, { label: group.name }]}
        />
      </div>

      {/* Search — mobile only, mirrors the mockup */}
      <div className="relative lg:hidden">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-ink-faint" />
        <input
          value={filters.search}
          onChange={(event) =>
            dispatch(setTaskFilter({ search: event.target.value }))
          }
          placeholder="Search tasks or members…"
          aria-label="Search tasks"
          className="h-12 w-full rounded-full bg-surface-muted pl-12 pr-4 text-sm text-ink placeholder:text-ink-faint focus:bg-surface focus:ring-4 focus:ring-brand-500/12 focus:outline-none"
        />
      </div>

      {/* Title + owner avatar */}
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[28px] font-bold leading-tight tracking-tight text-ink lg:text-[34px]">
            {group.name}
          </h1>
          {group.description && (
            <p className="mt-1.5 line-clamp-2 text-[14px] leading-relaxed text-ink-muted lg:line-clamp-none">
              {group.description}
            </p>
          )}
        </div>
        <Avatar user={group.createdBy} size="lg" accentRing />
      </header>

      {/* Colour-blocked stat tiles */}
      <section className="grid grid-cols-2 grid-rows-2 gap-3">
        <StatTile
          label="Tasks done"
          value={group.completedTaskCount}
          icon={Zap}
          tone="brand"
          wide
        />
        <StatTile
          label="Members"
          value={group.memberCount}
          icon={Users}
          tone="lilac"
        />
        <StatTile
          label="Pending"
          value={group.activeTaskCount}
          icon={Clock}
          tone="aqua"
        />
      </section>

      {/* Members + settings */}
      <div className="flex items-center justify-between gap-4 rounded-card bg-surface p-4 shadow-soft">
        <div className="flex min-w-0 items-center gap-3">
          <AvatarGroup
            users={group.allMembers.map((member) => member.user)}
            total={group.memberCount}
            max={4}
            size="sm"
          />
          <p className="truncate text-[12.5px] text-ink-muted">
            Owned by{" "}
            <span className="font-bold text-ink">
              {group.createdBy.fullName}
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          aria-label="Group settings"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-muted text-ink-soft transition-transform active:scale-95"
        >
          <Settings className="size-4.5" />
        </button>
      </div>

      {/* Tabs */}
      <Segmented
        items={[
          {
            value: "assigned-to-me" as const,
            label: "Assigned To Me",
            count: toMe?.tasks.length ?? 0,
          },
          {
            value: "assigned-by-me" as const,
            label: "Assigned By Me",
            count: byMe?.tasks.length ?? 0,
          },
        ]}
        value={tab}
        onChange={(value) => dispatch(setActiveTaskTab(value))}
      />

      {/* Filter row — inline on desktop, sheet on mobile */}
      <div className="hidden lg:block">
        <TaskFilters
          people={assigners}
          showAssignedBy={tab === "assigned-to-me"}
        />
      </div>

      <div className="flex items-center justify-between gap-3 lg:hidden">
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-surface px-4 text-[13px] font-bold text-ink-soft shadow-soft"
        >
          <SlidersHorizontal className="size-4" />
          Filter
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>

        {tab === "assigned-by-me" && (
          <Button
            size="sm"
            icon={<Plus className="size-4" />}
            onClick={() => setAssignOpen(true)}
          >
            New Task
          </Button>
        )}
      </div>

      {/* Task list */}
      {isFetching && tasks.length === 0 ? (
        <CardSkeleton />
      ) : tasks.length === 0 ? (
        <EmptyState
          illustration={<EmptyTasksIllustration className="h-36 w-auto" />}
          title={
            tab === "assigned-to-me"
              ? "No tasks assigned to you here"
              : "You haven't assigned any tasks yet"
          }
          description={
            tab === "assigned-to-me"
              ? "When a teammate assigns you work in this group, it will appear here."
              : "Assign work to a group member and track it to completion from this tab."
          }
          actions={
            tab === "assigned-by-me" ? (
              <Button
                icon={<Plus className="size-4.5" />}
                onClick={() => setAssignOpen(true)}
              >
                Assign New Task
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              variant={tab}
              onEdit={tab === "assigned-by-me" ? setEditing : undefined}
              onDelete={tab === "assigned-by-me" ? setDeleting : undefined}
            />
          ))}
        </div>
      )}

      <Fab
        onClick={() => setAssignOpen(true)}
        label="Assign a new task"
        icon={<Plus className="size-7" />}
      />

      {/* Mobile filter sheet — drives the same Redux state as the desktop bar */}
      <Modal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filter tasks"
        description="Narrow the list down to what you need."
        width="sm"
        footer={
          <Button className="w-full" onClick={() => setFiltersOpen(false)}>
            Show results
          </Button>
        }
      >
        <TaskFilters
          people={assigners}
          showAssignedBy={tab === "assigned-to-me"}
          stacked
        />
      </Modal>

      <AssignTaskModal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        groupId={groupId}
      />

      {editing && (
        <EditTaskModal
          task={editing}
          groupId={groupId}
          open
          onClose={() => setEditing(null)}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={deletingTask}
        title="Delete this task?"
        message={`"${deleting?.title ?? ""}" and all of its comments, attachments and history will be permanently removed.`}
        confirmLabel="Delete task"
      />

      <GroupSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        group={group}
      />
    </div>
  );
}
