"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlarmClock,
  CalendarClock,
  Copy,
  FileText,
  ImageIcon,
  ListChecks,
  Paperclip,
  Pencil,
  Send,
  Share2,
  Trash2,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { PriorityBadge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  cn,
  formatBytes,
  formatDate,
  isOverdue,
  PRIORITY_META,
  PRIORITY_ORDER,
  relativeTime,
  STATUS_META,
  STATUS_ORDER,
} from "@/lib/utils";
import {
  toApiError,
  useAddCommentMutation,
  useDeleteTaskMutation,
  useTaskQuery,
  useToggleChecklistItemMutation,
  useUpdateTaskMutation,
} from "@/store/api";
import { ActivityTimeline } from "./activity-timeline";
import { EditTaskModal } from "./edit-task-modal";

export function TaskDetailView({ taskId }: { taskId: string }) {
  const router = useRouter();
  const { data, isLoading, isError } = useTaskQuery(taskId);
  const [updateTask] = useUpdateTaskMutation();
  const [toggleItem] = useToggleChecklistItemMutation();
  const [addComment, { isLoading: posting }] = useAddCommentMutation();
  const [deleteTask, { isLoading: deleting }] = useDeleteTaskMutation();

  const [comment, setComment] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [progressDraft, setProgressDraft] = useState<number | null>(null);

  const task = data?.task;

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.9fr_1fr]">
        <div className="space-y-4">
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-52 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !task) {
    return (
      <EmptyState
        title="Task not found"
        description="It may have been deleted, or you no longer have access to the group it belongs to."
        actions={
          <Button onClick={() => router.push("/dashboard")}>
            Back to dashboard
          </Button>
        }
      />
    );
  }

  const canEdit = task.viewerIsCreator;
  const canReport = task.viewerIsAssignee || task.viewerIsCreator;
  const overdue = isOverdue(task.dueDate, task.status);
  const progress = progressDraft ?? task.progress;

  async function patch(payload: Parameters<typeof updateTask>[0]) {
    try {
      await updateTask(payload).unwrap();
    } catch (error) {
      toast.error(toApiError(error).message);
    } finally {
      // Hand control of the slider back to the server value.
      setProgressDraft(null);
    }
  }

  async function postComment() {
    const body = comment.trim();
    if (!body) return;
    try {
      await addComment({ taskId, body }).unwrap();
      setComment("");
    } catch (error) {
      toast.error(toApiError(error).message);
    }
  }

  async function confirmDeleteTask() {
    try {
      await deleteTask(taskId).unwrap();
      toast.success("Task deleted");
      router.push(`/groups/${task!.group.id}`);
    } catch (error) {
      toast.error(toApiError(error).message);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        crumbs={[
          { label: "Groups", href: "/groups" },
          { label: task.group.name, href: `/groups/${task.group.id}` },
          { label: task.title },
        ]}
        title={task.title}
        actions={
          canEdit ? (
            <Button
              variant="outline"
              icon={<Pencil className="size-4" />}
              onClick={() => setEditOpen(true)}
            >
              Edit task
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={task.status} />
        <PriorityBadge priority={task.priority} />
        {overdue && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700">
            <AlarmClock className="size-3" />
            OVERDUE
          </span>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.9fr_1fr] lg:items-start">
        {/* ── Main column ─────────────────────────────────────────── */}
        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="text-[15px] font-semibold text-ink">Description</h2>
            {task.description ? (
              <div className="mt-4 space-y-3 text-[14px] leading-relaxed text-ink-soft">
                {task.description.split("\n").map((line, index) =>
                  line.trim() ? (
                    <p key={index}>{line}</p>
                  ) : (
                    <span key={index} className="block h-1" />
                  ),
                )}
              </div>
            ) : (
              <p className="mt-4 text-[14px] text-ink-muted">
                No description was provided for this task.
              </p>
            )}
          </section>

          {task.checklist.length > 0 && (
            <section className="card p-6">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                  <ListChecks className="size-4.5 text-brand-600" />
                  Checklist
                </h2>
                <span className="text-[13px] font-medium text-ink-muted">
                  {task.checklistDone} of {task.checklistTotal} done
                </span>
              </div>

              <Progress
                value={
                  task.checklistTotal === 0
                    ? 0
                    : (task.checklistDone / task.checklistTotal) * 100
                }
                className="mt-4"
              />

              <ul className="mt-4 space-y-1">
                {task.checklist.map((item) => (
                  <li key={item.id}>
                    <label
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-surface-muted",
                        !canReport && "cursor-default",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={item.done}
                        disabled={!canReport}
                        onChange={(event) =>
                          toggleItem({
                            taskId,
                            itemId: item.id,
                            done: event.target.checked,
                          })
                        }
                        className="size-4.5 shrink-0 cursor-pointer appearance-none rounded-[5px] border border-line-strong bg-surface transition-all checked:border-brand-600 checked:bg-brand-600 dark:checked:border-brand-500 dark:checked:bg-brand-500 checked:bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22white%22 stroke-width=%223%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><polyline points=%2220 6 9 17 4 12%22/></svg>')] checked:bg-[length:13px] checked:bg-center checked:bg-no-repeat disabled:opacity-60"
                      />
                      <span
                        className={cn(
                          "text-[14px]",
                          item.done
                            ? "text-ink-faint line-through"
                            : "text-ink-soft",
                        )}
                      >
                        {item.label}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {task.attachments.length > 0 && (
            <section className="card p-6">
              <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                <Paperclip className="size-4.5 text-brand-600" />
                Attachments
              </h2>

              {/* Horizontal snap strip on phones, grid from `sm` up. */}
              <div className="no-scrollbar scroll-contain -mx-6 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0">
                {task.attachments.map((file) => {
                  const isImage = file.mimeType.startsWith("image/");
                  return (
                    <div
                      key={file.id}
                      className="flex w-[78%] shrink-0 snap-start items-center gap-3 rounded-xl border border-line bg-surface-muted p-3 sm:w-auto sm:shrink"
                    >
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-surface text-ink-muted ring-1 ring-line">
                        {isImage ? (
                          <ImageIcon className="size-5" />
                        ) : (
                          <FileText className="size-5" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[13.5px] font-medium text-ink">
                          {file.name}
                        </p>
                        <p className="text-[12px] text-ink-muted">
                          {formatBytes(file.sizeBytes)} ·{" "}
                          {relativeTime(file.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Comments */}
          <section className="card p-6">
            <h2 className="text-[15px] font-semibold text-ink">
              Comments ({task.comments.length})
            </h2>

            {task.comments.length > 0 && (
              <ul className="mt-5 space-y-5">
                {task.comments.map((entry) => (
                  <li key={entry.id} className="flex gap-3.5">
                    <Avatar user={entry.author} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <p className="text-[13.5px] font-semibold text-ink">
                          {entry.author.fullName}
                        </p>
                        <p className="text-[11.5px] text-ink-faint">
                          {relativeTime(entry.createdAt)}
                        </p>
                      </div>
                      <p className="mt-1.5 whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink-soft">
                        {entry.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6 rounded-xl border border-line bg-surface-muted p-3">
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    (event.metaKey || event.ctrlKey)
                  ) {
                    event.preventDefault();
                    postComment();
                  }
                }}
                rows={3}
                placeholder="Write a comment…"
                className="w-full resize-none bg-transparent text-ink placeholder:text-ink-faint focus:outline-none lg:text-[13.5px]"
              />
              <div className="flex items-center justify-between gap-3 pt-2">
                <p className="hidden text-[11.5px] text-ink-faint lg:block">
                  Press ⌘/Ctrl + Enter to post
                </p>
                <Button
                  size="sm"
                  onClick={postComment}
                  loading={posting}
                  disabled={!comment.trim()}
                  icon={<Send className="size-3.5" />}
                  className="ml-auto"
                >
                  Comment
                </Button>
              </div>
            </div>
          </section>
        </div>

        {/* ── Sidebar ─────────────────────────────────────────────── */}
        <aside className="space-y-6">
          <section className="card p-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-faint">
              Task properties
            </h2>

            <dl className="mt-4 space-y-4 text-[13.5px]">
              <Row label="Assignee">
                {task.assignee ? (
                  <span className="inline-flex items-center gap-2">
                    <Avatar user={task.assignee} size="xs" />
                    <span className="font-medium text-ink">
                      {task.assignee.fullName}
                    </span>
                  </span>
                ) : (
                  <span className="text-ink-muted">Unassigned</span>
                )}
              </Row>

              <Row label="Assigned by">
                <span className="inline-flex items-center gap-2">
                  <Avatar user={task.createdBy} size="xs" />
                  <span className="font-medium text-ink">
                    {task.createdBy.fullName}
                  </span>
                </span>
              </Row>

              <Row label="Status">
                {canReport ? (
                  <select
                    value={task.status}
                    onChange={(event) =>
                      patch({
                        taskId,
                        status: event.target.value as typeof task.status,
                      })
                    }
                    className="h-8 cursor-pointer rounded-lg border border-line bg-surface px-2 text-[12.5px] font-medium text-ink focus:border-brand-400 focus:outline-none"
                  >
                    {STATUS_ORDER.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_META[status].label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <StatusBadge status={task.status} />
                )}
              </Row>

              <Row label="Priority">
                {canEdit ? (
                  <select
                    value={task.priority}
                    onChange={(event) =>
                      patch({
                        taskId,
                        priority: event.target.value as typeof task.priority,
                      })
                    }
                    className="h-8 cursor-pointer rounded-lg border border-line bg-surface px-2 text-[12.5px] font-medium text-ink focus:border-brand-400 focus:outline-none"
                  >
                    {PRIORITY_ORDER.map((priority) => (
                      <option key={priority} value={priority}>
                        {PRIORITY_META[priority].label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <PriorityBadge priority={task.priority} />
                )}
              </Row>

              <Row label="Due date">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 font-medium",
                    overdue ? "text-rose-600" : "text-ink",
                  )}
                >
                  <CalendarClock className="size-3.5" />
                  {task.dueDate ? formatDate(task.dueDate) : "No deadline"}
                </span>
              </Row>

              <Row label="Created">
                <span className="font-medium text-ink">
                  {formatDate(task.createdAt)}
                </span>
              </Row>
            </dl>

            {/* Progress reporting */}
            {canReport && (
              <div className="mt-5 border-t border-line pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-ink-soft">
                    Progress
                  </span>
                  <span className="text-[13px] font-bold text-brand-600">
                    {progress}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={progress}
                  onChange={(event) =>
                    setProgressDraft(Number(event.target.value))
                  }
                  onMouseUp={() =>
                    progressDraft !== null &&
                    patch({ taskId, progress: progressDraft })
                  }
                  onTouchEnd={() =>
                    progressDraft !== null &&
                    patch({ taskId, progress: progressDraft })
                  }
                  className="mt-3 w-full accent-brand-600"
                />
              </div>
            )}
          </section>

          <section className="card p-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-faint">
              Activity timeline
            </h2>
            <div className="mt-4">
              <ActivityTimeline items={task.activities} />
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              icon={<Share2 className="size-4" />}
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                toast.success("Link copied to clipboard");
              }}
            >
              Share
            </Button>
            <Button
              variant="outline"
              icon={<Copy className="size-4" />}
              onClick={() => {
                navigator.clipboard?.writeText(task.title);
                toast.success("Title copied");
              }}
            >
              Copy
            </Button>
            {canEdit && (
              <Button
                variant="danger"
                className="col-span-2"
                icon={<Trash2 className="size-4" />}
                onClick={() => setConfirmDelete(true)}
              >
                Delete task
              </Button>
            )}
          </section>
        </aside>
      </div>

      {editOpen && (
        <EditTaskModal
          task={task}
          groupId={task.group.id}
          open={editOpen}
          onClose={() => setEditOpen(false)}
        />
      )}

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={confirmDeleteTask}
        loading={deleting}
        title="Delete this task?"
        message="The task and all of its comments, attachments and history will be permanently removed."
        confirmLabel="Delete task"
      />
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="shrink-0 text-ink-muted">{label}</dt>
      <dd className="min-w-0 text-right">{children}</dd>
    </div>
  );
}
