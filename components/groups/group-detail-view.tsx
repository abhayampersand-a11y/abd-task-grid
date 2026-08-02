"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlarmClock,
  ClipboardList,
  Plus,
  Settings,
  UsersRound,
} from "lucide-react";
import { AvatarGroup } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { EmptyTasksIllustration } from "@/components/ui/illustrations";
import { PageHeader } from "@/components/ui/page-header";
import { CardSkeleton } from "@/components/ui/skeleton";
import { Tabs } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/ui/modal";
import { AssignTaskModal } from "@/components/tasks/assign-task-modal";
import { EditTaskModal } from "@/components/tasks/edit-task-modal";
import { TaskCard } from "@/components/tasks/task-card";
import { TaskFilters } from "@/components/tasks/task-filters";
import type { TaskSummary } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setActiveTaskTab } from "@/store/ui-slice";
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

  // Counts for the tab badges, unaffected by the filter bar.
  const { data: toMe } = useTasksQuery({ scope: "assigned-to-me", groupId });
  const { data: byMe } = useTasksQuery({ scope: "assigned-by-me", groupId });

  if (groupLoading) {
    return (
      <div className="space-y-8">
        <div className="h-10 w-72 animate-shimmer rounded-lg bg-line/70" />
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
    <div className="space-y-8">
      <PageHeader
        crumbs={[
          { label: "Groups", href: "/groups" },
          { label: group.name },
        ]}
        title={group.name}
        description={group.description ?? undefined}
        aside={
          <div className="flex flex-wrap items-center gap-3">
            <div className="card flex items-center gap-3 px-4 py-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <ClipboardList className="size-4.5" />
              </span>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">
                  Active tasks
                </p>
                <p className="text-xl font-bold leading-tight text-ink">
                  {group.activeTaskCount}
                </p>
              </div>
            </div>

            <div className="card flex items-center gap-3 px-4 py-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <UsersRound className="size-4.5" />
              </span>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">
                  Members
                </p>
                <p className="text-xl font-bold leading-tight text-ink">
                  {group.memberCount}
                </p>
              </div>
            </div>

            {group.overdueTaskCount > 0 && (
              <div className="card flex items-center gap-3 px-4 py-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                  <AlarmClock className="size-4.5" />
                </span>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">
                    Overdue
                  </p>
                  <p className="text-xl font-bold leading-tight text-rose-600">
                    {group.overdueTaskCount}
                  </p>
                </div>
              </div>
            )}
          </div>
        }
      />

      {/* Member strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-surface px-5 py-4">
        <div className="flex items-center gap-4">
          <AvatarGroup
            users={group.allMembers.map((member) => member.user)}
            total={group.memberCount}
            max={6}
            size="md"
          />
          <p className="text-[13px] text-ink-muted">
            Owned by{" "}
            <span className="font-semibold text-ink">
              {group.createdBy.fullName}
            </span>
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={<Settings className="size-4" />}
          onClick={() => setSettingsOpen(true)}
        >
          Group settings
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        items={[
          {
            value: "assigned-to-me" as const,
            label: "Tasks assigned to me",
            count: toMe?.tasks.length ?? 0,
          },
          {
            value: "assigned-by-me" as const,
            label: "Tasks assigned by me",
            count: byMe?.tasks.length ?? 0,
          },
        ]}
        value={tab}
        onChange={(value) => dispatch(setActiveTaskTab(value))}
        trailing={
          tab === "assigned-by-me" ? (
            <Button
              size="sm"
              icon={<Plus className="size-4" />}
              onClick={() => setAssignOpen(true)}
            >
              Assign New Task
            </Button>
          ) : undefined
        }
      />

      <TaskFilters
        people={assigners}
        showAssignedBy={tab === "assigned-to-me"}
      />

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
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
