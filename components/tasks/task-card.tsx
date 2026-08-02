"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  Eye,
  ListChecks,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Trash2,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { PriorityBadge, StatusBadge } from "@/components/ui/badge";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { Progress } from "@/components/ui/progress";
import {
  cn,
  formatShortDate,
  isOverdue,
  PRIORITY_META,
  STATUS_META,
} from "@/lib/utils";
import type { TaskSummary } from "@/lib/types";

export interface TaskCardActions {
  onEdit?: (task: TaskSummary) => void;
  onDelete?: (task: TaskSummary) => void;
}

/**
 * The task list as it appears on phones: one hairline-separated row per task
 * instead of a card, so a screenful shows ten tasks rather than three. Every
 * field the card carries is still here — priority as the leading accent bar,
 * status as the dot, then group, due date, assignee and progress.
 */
export function TaskListRow({
  task,
  variant,
  onEdit,
  onDelete,
}: TaskCardActions & {
  task: TaskSummary;
  /** Chooses whose avatar to show; defaults to the assignee. */
  variant?: "assigned-to-me" | "assigned-by-me";
}) {
  const router = useRouter();
  const overdue = isOverdue(task.dueDate, task.status);
  const person =
    variant === "assigned-to-me" ? task.createdBy : task.assignee;
  const priority = PRIORITY_META[task.priority];
  const status = STATUS_META[task.status];

  // One trailing counter only — a second one crowds the row at 320px.
  const trailing =
    task.checklistTotal > 0
      ? `${task.checklistDone}/${task.checklistTotal}`
      : task.progress > 0 && task.status !== "COMPLETED"
        ? `${task.progress}%`
        : task.commentCount > 0
          ? `${task.commentCount} 💬`
          : null;

  return (
    <div className="flex items-center gap-2.5 pl-3 pr-1 transition-colors active:bg-surface-muted">
      <span
        className={cn("h-8 w-1 shrink-0 rounded-full", priority.dot)}
        aria-hidden
      />

      <Link href={`/tasks/${task.id}`} className="min-w-0 flex-1 py-2.5">
        <span className="flex items-baseline gap-2">
          <span className="truncate text-[13.5px] font-semibold leading-snug text-ink">
            {task.title}
          </span>
          <span
            className={cn(
              "ml-auto shrink-0 text-[11px] tabular-nums",
              overdue ? "font-semibold text-rose-600" : "text-ink-faint",
            )}
          >
            {task.dueDate ? formatShortDate(task.dueDate) : "—"}
          </span>
        </span>

        <span className="mt-1 flex items-center gap-1.5 text-[11px] leading-none text-ink-muted">
          <span className={cn("size-1.5 shrink-0 rounded-full", status.dot)} />
          <span className="shrink-0">{status.label}</span>
          <span className="truncate">· {task.group.name}</span>
          {trailing && (
            <span className="ml-auto shrink-0 font-medium tabular-nums">
              {trailing}
            </span>
          )}
        </span>

        <span className="sr-only">
          {priority.label} priority
          {overdue && ", overdue"}
        </span>
      </Link>

      {person ? (
        <Avatar user={person} size="xs" />
      ) : (
        <span className="flex size-6 items-center justify-center rounded-full bg-line text-[9px] font-semibold text-ink-faint">
          ?
        </span>
      )}

      <Dropdown
        trigger={({ toggle }) => (
          <button
            type="button"
            onClick={toggle}
            aria-label={`Actions for ${task.title}`}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-ink-faint transition-colors active:bg-surface-muted"
          >
            <MoreHorizontal className="size-4" />
          </button>
        )}
      >
        {({ close }) => (
          <>
            <DropdownItem
              icon={<Eye />}
              onClick={() => {
                close();
                router.push(`/tasks/${task.id}`);
              }}
            >
              View details
            </DropdownItem>
            {onEdit && (
              <DropdownItem
                icon={<Pencil />}
                onClick={() => {
                  close();
                  onEdit(task);
                }}
              >
                Edit task
              </DropdownItem>
            )}
            {onDelete && (
              <DropdownItem
                icon={<Trash2 />}
                tone="danger"
                onClick={() => {
                  close();
                  onDelete(task);
                }}
              >
                Delete task
              </DropdownItem>
            )}
          </>
        )}
      </Dropdown>
    </div>
  );
}

export function TaskCard({
  task,
  variant = "assigned-to-me",
  onEdit,
  onDelete,
}: {
  task: TaskSummary;
  variant?: "assigned-to-me" | "assigned-by-me";
  onEdit?: (task: TaskSummary) => void;
  onDelete?: (task: TaskSummary) => void;
}) {
  const router = useRouter();
  const overdue = isOverdue(task.dueDate, task.status);
  const counterpart = variant === "assigned-by-me" ? task.assignee : task.createdBy;
  const counterpartLabel =
    variant === "assigned-by-me" ? "Assigned to" : "Assigned by";

  return (
    <article className="card card-interactive flex flex-col p-5">
      <header className="flex items-start justify-between gap-3">
        <PriorityBadge priority={task.priority} />

        <Dropdown
          trigger={({ toggle }) => (
            <button
              type="button"
              onClick={toggle}
              aria-label="Task actions"
              className="-mr-1.5 -mt-1 flex size-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-surface-muted hover:text-ink-soft"
            >
              <MoreHorizontal className="size-4.5" />
            </button>
          )}
        >
          {({ close }) => (
            <>
              <DropdownItem
                icon={<Eye />}
                onClick={() => {
                  close();
                  router.push(`/tasks/${task.id}`);
                }}
              >
                View details
              </DropdownItem>
              {onEdit && (
                <DropdownItem
                  icon={<Pencil />}
                  onClick={() => {
                    close();
                    onEdit(task);
                  }}
                >
                  Edit task
                </DropdownItem>
              )}
              {onDelete && (
                <DropdownItem
                  icon={<Trash2 />}
                  tone="danger"
                  onClick={() => {
                    close();
                    onDelete(task);
                  }}
                >
                  Delete task
                </DropdownItem>
              )}
            </>
          )}
        </Dropdown>
      </header>

      <Link href={`/tasks/${task.id}`} className="mt-3 block">
        <h3 className="text-[17px] font-semibold leading-snug tracking-tight text-ink transition-colors hover:text-brand-700">
          {task.title}
        </h3>
      </Link>

      {task.description && (
        <p className="mt-2 line-clamp-3 text-[13.5px] leading-relaxed text-ink-muted">
          {task.description}
        </p>
      )}

      {/* Meta strip */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-ink-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-brand-300" />
          {task.group.name}
        </span>
        {task.checklistTotal > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <ListChecks className="size-3.5" />
            {task.checklistDone}/{task.checklistTotal}
          </span>
        )}
        {task.commentCount > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <MessageSquare className="size-3.5" />
            {task.commentCount}
          </span>
        )}
        {task.attachmentCount > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <Paperclip className="size-3.5" />
            {task.attachmentCount}
          </span>
        )}
      </div>

      {task.progress > 0 && task.status !== "COMPLETED" && (
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-ink-muted">
            <span>Progress</span>
            <span>{task.progress}%</span>
          </div>
          <Progress value={task.progress} size="sm" />
        </div>
      )}

      {/* Spacer keeps footers aligned across cards of differing height. */}
      <div className="mt-auto pt-5" aria-hidden />

      <footer className="flex items-center justify-between gap-3 border-t border-line pt-4">
        <div className="flex min-w-0 items-center gap-2.5">
          {counterpart ? (
            <Avatar user={counterpart} size="sm" />
          ) : (
            <span className="flex size-8 items-center justify-center rounded-full bg-line text-[10px] font-semibold text-ink-faint">
              ?
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-[12.5px] font-semibold text-ink">
              {counterpart?.fullName ?? "Unassigned"}
            </p>
            <p
              className={cn(
                "flex items-center gap-1 truncate text-[11.5px]",
                overdue ? "font-semibold text-rose-600" : "text-ink-muted",
              )}
            >
              <CalendarClock className="size-3" />
              {task.dueDate ? formatShortDate(task.dueDate) : "No deadline"}
              {overdue && " · overdue"}
            </p>
          </div>
        </div>

        <StatusBadge status={task.status} />
      </footer>

      <span className="sr-only">{counterpartLabel}</span>
    </article>
  );
}
