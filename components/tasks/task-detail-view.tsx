"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlarmClock,
  AlignLeft,
  CalendarClock,
  Clock3,
  FileText,
  ImageIcon,
  ListChecks,
  MoreVertical,
  Paperclip,
  Pencil,
  Send,
  Share2,
  Trash2,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { PriorityBadge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/modal";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useShell } from "@/components/layout/shell-context";
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
  const { user } = useShell();
  const { data, isLoading, isError } = useTaskQuery(taskId);
  const [updateTask, { isLoading: saving }] = useUpdateTaskMutation();
  const [toggleItem] = useToggleChecklistItemMutation();
  const [addComment, { isLoading: posting }] = useAddCommentMutation();
  const [deleteTask, { isLoading: deleting }] = useDeleteTaskMutation();

  const [comment, setComment] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [statusDraft, setStatusDraft] = useState<string | null>(null);
  const [progressDraft, setProgressDraft] = useState<number | null>(null);

  const task = data?.task;

  if (isLoading) {
    return (
      <div className="space-y-5 pt-4">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-52 w-full rounded-card" />
        <Skeleton className="h-40 w-full rounded-card" />
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
  const status = statusDraft ?? task.status;
  const progress = progressDraft ?? task.progress;
  const dirty = statusDraft !== null || progressDraft !== null;

  async function patch(payload: Parameters<typeof updateTask>[0]) {
    try {
      await updateTask(payload).unwrap();
    } catch (error) {
      toast.error(toApiError(error).message);
    } finally {
      setStatusDraft(null);
      setProgressDraft(null);
    }
  }

  async function saveChanges() {
    await patch({
      taskId,
      ...(statusDraft
        ? { status: statusDraft as NonNullable<typeof task>["status"] }
        : {}),
      ...(progressDraft !== null ? { progress: progressDraft } : {}),
    });
    toast.success("Changes saved");
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
    <div className={cn("space-y-6 pt-2 lg:pt-0", canReport && "pb-24 lg:pb-0")}>
      <div className="hidden lg:block">
        <Breadcrumb
          items={[
            { label: "Groups", href: "/groups" },
            { label: task.group.name, href: `/groups/${task.group.id}` },
            { label: task.title },
          ]}
        />
      </div>

      {/* Title + actions */}
      <header className="flex items-start justify-between gap-4">
        <h1 className="text-[28px] font-bold leading-tight tracking-tight text-ink lg:text-[34px]">
          {task.title}
        </h1>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              toast.success("Link copied to clipboard");
            }}
            aria-label="Share task"
            className="flex size-10 items-center justify-center rounded-full text-ink-soft transition-colors active:bg-surface-muted"
          >
            <Share2 className="size-4.5" />
          </button>

          {canEdit && (
            <Dropdown
              trigger={({ toggle }) => (
                <button
                  type="button"
                  onClick={toggle}
                  aria-label="Task actions"
                  className="flex size-10 items-center justify-center rounded-full text-ink-soft transition-colors active:bg-surface-muted"
                >
                  <MoreVertical className="size-4.5" />
                </button>
              )}
            >
              {({ close }) => (
                <>
                  <DropdownItem
                    icon={<Pencil />}
                    onClick={() => {
                      close();
                      setEditOpen(true);
                    }}
                  >
                    Edit task
                  </DropdownItem>
                  <DropdownItem
                    icon={<Trash2 />}
                    tone="danger"
                    onClick={() => {
                      close();
                      setConfirmDelete(true);
                    }}
                  >
                    Delete task
                  </DropdownItem>
                </>
              )}
            </Dropdown>
          )}
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <PriorityBadge priority={task.priority} />
        {overdue && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1.5 text-[11px] font-bold text-white">
            <AlarmClock className="size-3" />
            OVERDUE
          </span>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.9fr_1fr] lg:items-start">
        <div className="space-y-6">
          {/* Status — large pill field, as per the mockup */}
          <section>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-faint">
              Current status
            </p>
            {canReport ? (
              <div className="relative">
                <select
                  value={status}
                  onChange={(event) => setStatusDraft(event.target.value)}
                  aria-label="Task status"
                  className="h-14 w-full cursor-pointer appearance-none rounded-full bg-surface-muted pl-12 pr-12 text-[15px] font-bold text-ink focus:bg-surface focus:ring-4 focus:ring-brand-500/12 focus:outline-none"
                >
                  {STATUS_ORDER.map((option) => (
                    <option key={option} value={option}>
                      {STATUS_META[option].label}
                    </option>
                  ))}
                </select>
                <span
                  className={cn(
                    "pointer-events-none absolute left-5 top-1/2 size-2.5 -translate-y-1/2 rounded-full",
                    STATUS_META[status as typeof task.status].dot,
                  )}
                />
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="pointer-events-none absolute right-5 top-1/2 size-5 -translate-y-1/2 text-ink-muted"
                  aria-hidden
                >
                  <path
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            ) : (
              <div className="flex h-14 items-center rounded-full bg-surface-muted px-5">
                <StatusBadge status={task.status} />
              </div>
            )}
          </section>

          {/* Description */}
          <section className="card p-5">
            <h2 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-lilac-600">
              <AlignLeft className="size-4" />
              Description
            </h2>
            {task.description ? (
              <div className="mt-3 space-y-3 text-[14.5px] leading-relaxed text-ink-soft">
                {task.description.split("\n").map((line, index) =>
                  line.trim() ? (
                    <p key={index}>{line}</p>
                  ) : (
                    <span key={index} className="block h-1" />
                  ),
                )}
              </div>
            ) : (
              <p className="mt-3 text-[14px] text-ink-muted">
                No description was provided for this task.
              </p>
            )}
          </section>

          {/* Checklist */}
          {task.checklist.length > 0 && (
            <section className="card p-5">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-lilac-600">
                  <ListChecks className="size-4" />
                  Checklist
                </h2>
                <span className="text-[12.5px] font-semibold text-ink-muted">
                  {task.checklistDone}/{task.checklistTotal}
                </span>
              </div>

              <Progress
                value={
                  task.checklistTotal === 0
                    ? 0
                    : (task.checklistDone / task.checklistTotal) * 100
                }
                className="mt-3"
              />

              <ul className="mt-3 space-y-1">
                {task.checklist.map((item) => (
                  <li key={item.id}>
                    <label
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors",
                        canReport
                          ? "cursor-pointer active:bg-surface-muted"
                          : "cursor-default",
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
                        className="size-5 shrink-0 cursor-pointer appearance-none rounded-full border-2 border-line-strong bg-surface transition-all checked:border-brand-600 checked:bg-brand-600 checked:bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22white%22 stroke-width=%224%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><polyline points=%2220 6 9 17 4 12%22/></svg>')] checked:bg-[length:12px] checked:bg-center checked:bg-no-repeat disabled:opacity-60"
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

          {/* Attachments — horizontal thumbnail strip */}
          {task.attachments.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-lilac-600">
                <Paperclip className="size-4" />
                Attachments ({task.attachments.length})
              </h2>

              <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:px-0">
                {task.attachments.map((file) => {
                  const isImage = file.mimeType.startsWith("image/");
                  return (
                    <div
                      key={file.id}
                      className="flex w-28 shrink-0 flex-col gap-2"
                      title={file.name}
                    >
                      <span
                        className={cn(
                          "flex aspect-square items-center justify-center rounded-2xl",
                          isImage
                            ? "bg-lilac-100 text-lilac-600"
                            : "bg-surface-muted text-ink-muted",
                        )}
                      >
                        {isImage ? (
                          <ImageIcon className="size-8" />
                        ) : (
                          <FileText className="size-8" />
                        )}
                      </span>
                      <span className="truncate text-[11.5px] font-semibold text-ink-soft">
                        {file.name}
                      </span>
                      <span className="-mt-1.5 text-[10.5px] text-ink-faint">
                        {formatBytes(file.sizeBytes)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Activity — inline on mobile, sidebar on desktop */}
          <section className="card p-5 lg:hidden">
            <h2 className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-lilac-600">
              <Clock3 className="size-4" />
              Activity
            </h2>
            <ActivityTimeline items={task.activities} />
          </section>

          {/* Comments — chat bubbles */}
          <section>
            <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.1em] text-lilac-600">
              Comments ({task.comments.length})
            </h2>

            {task.comments.length > 0 && (
              <ul className="space-y-4">
                {task.comments.map((entry) => {
                  const mine = entry.author.id === user.id;
                  return (
                    <li
                      key={entry.id}
                      className={cn(
                        "flex items-start gap-2.5",
                        mine && "flex-row-reverse",
                      )}
                    >
                      <Avatar user={entry.author} size="sm" />

                      <div
                        className={cn(
                          "min-w-0 max-w-[80%] rounded-2xl px-4 py-3",
                          mine
                            ? "rounded-tr-sm bg-brand-100"
                            : "rounded-tl-sm bg-surface-muted",
                        )}
                      >
                        <div
                          className={cn(
                            "flex items-baseline gap-2",
                            mine && "flex-row-reverse",
                          )}
                        >
                          <p className="text-[13px] font-bold text-ink">
                            {mine ? "You" : entry.author.fullName}
                          </p>
                          <p className="text-[11px] text-ink-faint">
                            {relativeTime(entry.createdAt)}
                          </p>
                        </div>
                        <p
                          className={cn(
                            "mt-1 whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink-soft",
                            mine && "text-right",
                          )}
                        >
                          {entry.body}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Composer */}
            <div className="mt-5 flex items-end gap-2 rounded-full bg-surface-muted p-2 pl-5">
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    postComment();
                  }
                }}
                rows={1}
                placeholder="Add a comment…"
                className="max-h-28 flex-1 resize-none self-center bg-transparent py-2 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none"
              />
              <button
                type="button"
                onClick={postComment}
                disabled={!comment.trim() || posting}
                aria-label="Post comment"
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white transition-transform active:scale-95 disabled:opacity-45"
              >
                <Send className="size-4" />
              </button>
            </div>
          </section>
        </div>

        {/* ── Desktop sidebar ─────────────────────────────────────── */}
        <aside className="hidden space-y-5 lg:block">
          <section className="card p-5">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-faint">
              Task properties
            </h2>

            <dl className="mt-4 space-y-4 text-[13.5px]">
              <Row label="Assignee">
                {task.assignee ? (
                  <span className="inline-flex items-center gap-2">
                    <Avatar user={task.assignee} size="xs" />
                    <span className="font-semibold text-ink">
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
                  <span className="font-semibold text-ink">
                    {task.createdBy.fullName}
                  </span>
                </span>
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
                    className="h-9 cursor-pointer rounded-full bg-surface-muted px-3 text-[12.5px] font-semibold text-ink focus:outline-none"
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
                    "inline-flex items-center gap-1.5 font-semibold",
                    overdue ? "text-brand-600" : "text-ink",
                  )}
                >
                  <CalendarClock className="size-3.5" />
                  {task.dueDate ? formatDate(task.dueDate) : "No deadline"}
                </span>
              </Row>

              <Row label="Created">
                <span className="font-semibold text-ink">
                  {formatDate(task.createdAt)}
                </span>
              </Row>
            </dl>

            {canReport && (
              <div className="mt-5 border-t border-line pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-ink-soft">
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
                  className="mt-3 w-full accent-brand-600"
                />
              </div>
            )}
          </section>

          <section className="card p-5">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-faint">
              Activity timeline
            </h2>
            <div className="mt-4">
              <ActivityTimeline items={task.activities} />
            </div>
          </section>
        </aside>
      </div>

      {/* Mobile progress + sticky save bar */}
      {canReport && (
        <>
          <section className="card p-5 lg:hidden">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-ink-soft">
                Progress
              </span>
              <span className="text-[15px] font-bold text-brand-600">
                {progress}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={progress}
              onChange={(event) => setProgressDraft(Number(event.target.value))}
              className="mt-3 w-full accent-brand-600"
            />
          </section>

          <div className="fixed inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-30 px-4 lg:hidden">
            <Button
              size="lg"
              className="w-full uppercase tracking-wide"
              loading={saving}
              disabled={!dirty}
              onClick={saveChanges}
            >
              {dirty ? "Save Changes" : "Saved"}
            </Button>
          </div>
        </>
      )}

      {/* Desktop save affordance */}
      {canReport && dirty && (
        <div className="hidden lg:block">
          <Button loading={saving} onClick={saveChanges}>
            Save changes
          </Button>
        </div>
      )}

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
