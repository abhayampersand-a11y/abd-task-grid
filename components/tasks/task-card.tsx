"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  Eye,
  ListChecks,
  MessageSquare,
  MoreVertical,
  Paperclip,
  Pencil,
  Trash2,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { PriorityBadge, StatusBadge } from "@/components/ui/badge";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { Progress } from "@/components/ui/progress";
import { cn, formatShortDate, isOverdue } from "@/lib/utils";
import type { TaskSummary } from "@/lib/types";

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
  const counterpart =
    variant === "assigned-by-me" ? task.assignee : task.createdBy;

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
              className="-mr-1.5 -mt-1 flex size-9 items-center justify-center rounded-full text-ink-faint transition-colors active:bg-surface-muted"
            >
              <MoreVertical className="size-4.5" />
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
        <h3 className="text-[18px] font-bold leading-snug tracking-tight text-ink">
          {task.title}
        </h3>
      </Link>

      {task.description && (
        <p className="mt-2 line-clamp-2 text-[13.5px] leading-relaxed text-ink-muted">
          {task.description}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-ink-muted">
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
        <span
          className={cn(
            "inline-flex items-center gap-1.5",
            overdue && "font-bold text-brand-600",
          )}
        >
          <CalendarClock className="size-3.5" />
          {task.dueDate ? formatShortDate(task.dueDate) : "No deadline"}
        </span>
      </div>

      {task.progress > 0 && task.status !== "COMPLETED" && (
        <Progress value={task.progress} size="sm" className="mt-4" />
      )}

      <div className="mt-auto pt-5" aria-hidden />

      {/* Dashed rule + people/status row, as per the mockup */}
      <footer className="flex items-center justify-between gap-3 border-t border-dashed border-line-strong pt-4">
        {counterpart ? (
          <span className="flex min-w-0 items-center gap-2.5">
            <Avatar user={counterpart} size="sm" />
            <span className="min-w-0">
              <span className="block truncate text-[12.5px] font-bold text-ink">
                {counterpart.fullName}
              </span>
              <span className="block text-[11px] text-ink-muted">
                {variant === "assigned-by-me" ? "Assigned to" : "Assigned by"}
              </span>
            </span>
          </span>
        ) : (
          <span className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-full bg-line text-[10px] font-bold text-ink-faint">
              ?
            </span>
            <span className="text-[12.5px] font-semibold text-ink-muted">
              Unassigned
            </span>
          </span>
        )}

        <StatusBadge status={task.status} />
      </footer>
    </article>
  );
}
