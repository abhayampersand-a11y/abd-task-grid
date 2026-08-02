"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowUpDown,
  CircleCheck,
  CircleDashed,
  Layers,
  ListFilter,
  MessageSquare,
  Plus,
  Search,
  Timer,
  TriangleAlert,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { PriorityBadge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dropdown, DropdownItem, DropdownLabel } from "@/components/ui/dropdown";
import { EmptyState } from "@/components/ui/empty-state";
import { EmptyTasksIllustration } from "@/components/ui/illustrations";
import { ConfirmDialog } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { RowSkeleton, StatSkeleton } from "@/components/ui/skeleton";
import { AssignTaskModal } from "@/components/tasks/assign-task-modal";
import { EditTaskModal } from "@/components/tasks/edit-task-modal";
import {
  cn,
  formatShortDate,
  groupColor,
  isOverdue,
  PRIORITY_META,
  PRIORITY_ORDER,
  STATUS_META,
  STATUS_ORDER,
} from "@/lib/utils";
import type { TaskSummary, UserSummary } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { resetBoardFilters, setBoardFilter } from "@/store/ui-slice";
import {
  toApiError,
  useDeleteTaskMutation,
  useDirectoryQuery,
  useTasksQuery,
  useTaskStatsQuery,
} from "@/store/api";

const PAGE_SIZE = 10;

const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "due-soon", label: "Due soonest" },
  { value: "priority", label: "Highest priority" },
] as const;

const DUE_OPTIONS = [
  { value: "ALL", label: "Any due date" },
  { value: "overdue", label: "Overdue" },
  { value: "today", label: "Due today" },
  { value: "week", label: "Due this week" },
  { value: "none", label: "No deadline" },
] as const;

/** Progress bar colour tracks the task's stage, as in the design. */
function progressTone(task: TaskSummary) {
  if (task.status === "COMPLETED") return "bg-emerald-500";
  if (task.status === "IN_REVIEW") return "bg-violet-500";
  if (isOverdue(task.dueDate, task.status)) return "bg-rose-500";
  return "bg-brand-600";
}

export function TaskBoard({ people }: { people: UserSummary[] }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.ui.boardFilters);

  const [sort, setSort] = useState<string>("newest");
  const [searchDraft, setSearchDraft] = useState(filters.search);
  const [assignOpen, setAssignOpen] = useState(false);
  const [editing, setEditing] = useState<TaskSummary | null>(null);
  const [deleting, setDeleting] = useState<TaskSummary | null>(null);

  const [deleteTask, { isLoading: deletingTask }] = useDeleteTaskMutation();
  const { data: directory } = useDirectoryQuery();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchDraft !== filters.search) {
        dispatch(setBoardFilter({ search: searchDraft }));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchDraft, filters.search, dispatch]);

  const query = useMemo(
    () => ({
      scope: "all" as const,
      status: filters.status === "ALL" ? undefined : filters.status,
      priority: filters.priority === "ALL" ? undefined : filters.priority,
      assigneeId: filters.assigneeId === "ALL" ? undefined : filters.assigneeId,
      assignedBy: filters.assignedBy === "ALL" ? undefined : filters.assignedBy,
      due: filters.due === "ALL" ? undefined : filters.due,
      q: filters.search || undefined,
      sort,
      page: filters.page,
      pageSize: PAGE_SIZE,
    }),
    [filters, sort],
  );

  const { data, isLoading, isFetching } = useTasksQuery(query);
  const { data: stats } = useTaskStatsQuery({
    scope: "all",
    priority: query.priority,
    assigneeId: query.assigneeId,
    assignedBy: query.assignedBy,
    q: query.q,
  });

  const tasks = data?.tasks ?? [];
  const roster = people.length > 0 ? people : (directory?.users ?? []);

  const dirty =
    filters.status !== "ALL" ||
    filters.priority !== "ALL" ||
    filters.assigneeId !== "ALL" ||
    filters.assignedBy !== "ALL" ||
    filters.due !== "ALL" ||
    filters.search !== "";

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

  function clearAll() {
    dispatch(resetBoardFilters());
    setSearchDraft("");
    setSort("newest");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-[38px] sm:leading-tight">
            Tasks
          </h1>
          <p className="mt-1.5 text-[15px] text-ink-muted">
            View and manage all tasks across your groups.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl bg-surface-muted p-1">
            <FilterMenu
              onChange={(patch) => dispatch(setBoardFilter(patch))}
            />
            <SortMenu value={sort} onChange={setSort} />
          </div>

          <Button
            icon={<Plus className="size-4.5" />}
            onClick={() => setAssignOpen(true)}
          >
            Create Task
          </Button>
        </div>
      </header>

      {/* Stat tiles */}
      {!stats ? (
        <StatSkeleton count={5} />
      ) : (
        <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          <StatTile label="Total tasks" value={stats.total} />
          <StatTile
            label="Pending"
            value={stats.pending}
            dot="bg-ink-faint"
            onClick={() => dispatch(setBoardFilter({ status: "TODO" }))}
          />
          <StatTile
            label="In progress"
            value={stats.inProgress}
            dot="bg-brand-600"
            valueClass="text-brand-600"
            onClick={() => dispatch(setBoardFilter({ status: "IN_PROGRESS" }))}
          />
          <StatTile
            label="Completed"
            value={stats.completed}
            dot="bg-emerald-500"
            valueClass="text-emerald-600"
            onClick={() => dispatch(setBoardFilter({ status: "COMPLETED" }))}
          />
          <StatTile
            label="Overdue"
            value={stats.overdue}
            dot="bg-rose-500"
            valueClass="text-rose-600"
            onClick={() => dispatch(setBoardFilter({ due: "overdue" }))}
          />
        </section>
      )}

      {/* Filter bar */}
      <section className="card flex flex-wrap items-center gap-2.5 p-3">
        <div className="relative min-w-44 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
          <input
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
            placeholder="Search tasks…"
            aria-label="Search tasks"
            className="h-10 w-full rounded-lg border border-line bg-surface pl-10 pr-3 text-[13px] text-ink placeholder:text-ink-faint focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 focus:outline-none"
          />
        </div>

        <Chip
          label="Status"
          value={
            filters.status === "ALL" ? "All" : STATUS_META[filters.status].label
          }
          options={[
            { value: "ALL", label: "All statuses" },
            ...STATUS_ORDER.map((s) => ({
              value: s,
              label: STATUS_META[s].label,
            })),
          ]}
          onSelect={(value) =>
            dispatch(setBoardFilter({ status: value as typeof filters.status }))
          }
        />

        <Chip
          label="Priority"
          value={
            filters.priority === "ALL"
              ? undefined
              : PRIORITY_META[filters.priority].label
          }
          options={[
            { value: "ALL", label: "All priorities" },
            ...PRIORITY_ORDER.map((p) => ({
              value: p,
              label: PRIORITY_META[p].label,
            })),
          ]}
          onSelect={(value) =>
            dispatch(
              setBoardFilter({ priority: value as typeof filters.priority }),
            )
          }
        />

        <Chip
          label="Assigned To"
          value={
            roster.find((p) => p.id === filters.assigneeId)?.fullName.split(" ")[0]
          }
          options={[
            { value: "ALL", label: "Anyone" },
            ...roster.map((p) => ({ value: p.id, label: p.fullName })),
          ]}
          onSelect={(value) => dispatch(setBoardFilter({ assigneeId: value }))}
        />

        <Chip
          label="Assigned By"
          value={
            roster.find((p) => p.id === filters.assignedBy)?.fullName.split(" ")[0]
          }
          options={[
            { value: "ALL", label: "Anyone" },
            ...roster.map((p) => ({ value: p.id, label: p.fullName })),
          ]}
          onSelect={(value) => dispatch(setBoardFilter({ assignedBy: value }))}
        />

        <Chip
          label="Due Date"
          value={
            filters.due === "ALL"
              ? undefined
              : DUE_OPTIONS.find((o) => o.value === filters.due)?.label
          }
          options={DUE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          onSelect={(value) =>
            dispatch(setBoardFilter({ due: value as typeof filters.due }))
          }
        />

        {dirty && (
          <button
            type="button"
            onClick={clearAll}
            className="ml-auto shrink-0 px-2 text-[13px] font-semibold text-brand-600 transition-colors hover:text-brand-700"
          >
            Clear Filters
          </button>
        )}
      </section>

      {/* Table / list */}
      <section className="card overflow-hidden">
        {isLoading ? (
          <RowSkeleton count={6} />
        ) : tasks.length === 0 ? (
          <EmptyState
            illustration={<EmptyTasksIllustration className="h-32 w-auto" />}
            title={dirty ? "No tasks match these filters" : "No tasks yet"}
            description={
              dirty
                ? "Try widening the filters, or clear them to see everything."
                : "Create a task and assign it to someone in one of your groups."
            }
            actions={
              dirty ? (
                <Button variant="outline" onClick={clearAll}>
                  Clear filters
                </Button>
              ) : (
                <Button
                  icon={<Plus className="size-4.5" />}
                  onClick={() => setAssignOpen(true)}
                >
                  Create Task
                </Button>
              )
            }
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[980px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-line bg-surface-muted">
                    {[
                      "Task name",
                      "Assigned to",
                      "Assigned by",
                      "Priority",
                      "Status",
                      "Due date",
                      "Progress",
                    ].map((heading) => (
                      <th
                        key={heading}
                        scope="col"
                        className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-soft"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody
                  className={cn(
                    "divide-y divide-line",
                    isFetching && "opacity-60",
                  )}
                >
                  {tasks.map((task) => {
                    const color = groupColor(task.group.colorKey);
                    const overdue = isOverdue(task.dueDate, task.status);

                    return (
                      <tr
                        key={task.id}
                        onClick={() => router.push(`/tasks/${task.id}`)}
                        className="cursor-pointer transition-colors hover:bg-surface-muted"
                      >
                        <td className="max-w-72 px-5 py-4">
                          <div className="flex items-start gap-3">
                            <span
                              className={cn(
                                "flex size-9 shrink-0 items-center justify-center rounded-lg",
                                color.chip,
                              )}
                            >
                              <Layers className="size-4.5" />
                            </span>
                            <div className="min-w-0">
                              <Link
                                href={`/tasks/${task.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="line-clamp-2 text-[14px] font-semibold text-ink hover:text-brand-700"
                              >
                                {task.title}
                              </Link>
                              <p className="mt-0.5 flex items-center gap-2 text-[11.5px] text-ink-muted">
                                <span className="truncate">
                                  {task.group.name}
                                </span>
                                {task.commentCount > 0 && (
                                  <span className="inline-flex items-center gap-1">
                                    <MessageSquare className="size-3" />
                                    {task.commentCount}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          {task.assignee ? (
                            <div className="flex items-center gap-2.5">
                              <Avatar user={task.assignee} size="sm" />
                              <span className="text-[13.5px] font-medium text-ink">
                                {task.assignee.fullName}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[13.5px] text-ink-muted">
                              Unassigned
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-[13.5px] text-ink-soft">
                          {task.createdBy.fullName}
                        </td>

                        <td className="px-5 py-4">
                          <PriorityBadge priority={task.priority} />
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge status={task.status} />
                        </td>

                        <td
                          className={cn(
                            "whitespace-nowrap px-5 py-4 text-[13.5px]",
                            overdue
                              ? "font-semibold text-rose-600"
                              : "text-ink-soft",
                          )}
                        >
                          {task.dueDate ? formatShortDate(task.dueDate) : "—"}
                        </td>

                        <td className="px-5 py-4">
                          <div className="w-32">
                            <p className="mb-1 text-[11px] font-semibold text-ink-muted">
                              {task.progress}%
                            </p>
                            <div className="h-1.5 overflow-hidden rounded-full bg-line">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-[width] duration-500",
                                  progressTone(task),
                                )}
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Phone/tablet: stacked rows */}
            <ul className={cn("divide-y divide-line lg:hidden", isFetching && "opacity-60")}>
              {tasks.map((task) => {
                const color = groupColor(task.group.colorKey);
                const overdue = isOverdue(task.dueDate, task.status);

                return (
                  <li key={task.id}>
                    <Link
                      href={`/tasks/${task.id}`}
                      className="flex gap-3 p-4 transition-colors active:bg-surface-muted"
                    >
                      <span
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-lg",
                          color.chip,
                        )}
                      >
                        <Layers className="size-5" />
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="text-[14.5px] font-semibold leading-snug text-ink">
                          {task.title}
                        </p>
                        <p className="mt-0.5 text-[12px] text-ink-muted">
                          {task.group.name}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <PriorityBadge priority={task.priority} />
                          <StatusBadge status={task.status} />
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2">
                            {task.assignee && (
                              <Avatar user={task.assignee} size="xs" />
                            )}
                            <span className="truncate text-[12px] text-ink-muted">
                              {task.assignee?.fullName ?? "Unassigned"}
                            </span>
                          </div>
                          <span
                            className={cn(
                              "shrink-0 text-[12px]",
                              overdue
                                ? "font-semibold text-rose-600"
                                : "text-ink-muted",
                            )}
                          >
                            {task.dueDate ? formatShortDate(task.dueDate) : "—"}
                          </span>
                        </div>

                        <div className="mt-2.5 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                progressTone(task),
                              )}
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-semibold text-ink-muted">
                            {task.progress}%
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {data && data.totalPages > 1 && (
              <div className="border-t border-line">
                <Pagination
                  page={data.page}
                  totalPages={data.totalPages}
                  onChange={(page) => dispatch(setBoardFilter({ page }))}
                  summary={`Showing ${
                    (data.page - 1) * data.pageSize + 1
                  } to ${Math.min(
                    data.page * data.pageSize,
                    data.total,
                  )} of ${data.total} tasks`}
                />
              </div>
            )}
          </>
        )}
      </section>

      <AssignTaskModal open={assignOpen} onClose={() => setAssignOpen(false)} />

      {editing && (
        <EditTaskModal
          task={editing}
          groupId={editing.group.id}
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
    </div>
  );
}

function StatTile({
  label,
  value,
  dot,
  valueClass,
  onClick,
}: {
  label: string;
  value: number;
  dot?: string;
  valueClass?: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-soft">
        {label}
      </p>
      <p className="mt-2 flex items-center gap-2">
        <span
          className={cn(
            "text-2xl font-bold tracking-tight",
            valueClass ?? "text-ink",
          )}
        >
          {value}
        </span>
        {dot && value > 0 && (
          <span className={cn("size-1.5 rounded-full", dot)} />
        )}
      </p>
    </>
  );

  if (!onClick) {
    return <div className="card p-4 sm:p-5">{content}</div>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="card card-interactive p-4 text-left sm:p-5"
    >
      {content}
    </button>
  );
}

/** A filter pill that opens a single-select menu. */
function Chip({
  label,
  value,
  options,
  onSelect,
}: {
  label: string;
  value?: string;
  options: { value: string; label: string }[];
  onSelect: (value: string) => void;
}) {
  return (
    <Dropdown
      align="start"
      panelClassName="max-h-72 overflow-y-auto thin-scrollbar"
      trigger={({ toggle, open }) => (
        <button
          type="button"
          onClick={toggle}
          className={cn(
            "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-[13px] font-medium transition-colors",
            value
              ? "border-brand-300 bg-brand-50 text-brand-700"
              : "border-line bg-surface text-ink-soft hover:bg-surface-muted",
            open && "border-brand-400",
          )}
        >
          {label}
          {value && <span className="font-semibold">· {value}</span>}
          <svg viewBox="0 0 24 24" fill="none" className="size-3.5" aria-hidden>
            <path
              d="m19.5 8.25-7.5 7.5-7.5-7.5"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    >
      {({ close }) => (
        <>
          <DropdownLabel>{label}</DropdownLabel>
          {options.map((option) => (
            <DropdownItem
              key={option.value}
              onClick={() => {
                onSelect(option.value);
                close();
              }}
            >
              {option.label}
            </DropdownItem>
          ))}
        </>
      )}
    </Dropdown>
  );
}

function FilterMenu({
  onChange,
}: {
  onChange: (patch: Record<string, string>) => void;
}) {
  return (
    <Dropdown
      trigger={({ toggle }) => (
        <button
          type="button"
          onClick={toggle}
          aria-label="Quick filters"
          className="flex size-9 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-surface"
        >
          <ListFilter className="size-4.5" />
        </button>
      )}
    >
      {({ close }) => (
        <>
          <DropdownLabel>Quick filters</DropdownLabel>
          <DropdownItem
            icon={<CircleDashed />}
            onClick={() => {
              onChange({ status: "TODO" });
              close();
            }}
          >
            Pending only
          </DropdownItem>
          <DropdownItem
            icon={<Timer />}
            onClick={() => {
              onChange({ status: "IN_PROGRESS" });
              close();
            }}
          >
            In progress
          </DropdownItem>
          <DropdownItem
            icon={<CircleCheck />}
            onClick={() => {
              onChange({ status: "COMPLETED" });
              close();
            }}
          >
            Completed
          </DropdownItem>
          <DropdownItem
            icon={<TriangleAlert />}
            onClick={() => {
              onChange({ due: "overdue" });
              close();
            }}
          >
            Overdue
          </DropdownItem>
        </>
      )}
    </Dropdown>
  );
}

function SortMenu({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Dropdown
      trigger={({ toggle }) => (
        <button
          type="button"
          onClick={toggle}
          aria-label="Sort tasks"
          className="flex size-9 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-surface"
        >
          <ArrowUpDown className="size-4.5" />
        </button>
      )}
    >
      {({ close }) => (
        <>
          <DropdownLabel>Sort by</DropdownLabel>
          {SORTS.map((option) => (
            <DropdownItem
              key={option.value}
              onClick={() => {
                onChange(option.value);
                close();
              }}
            >
              {option.label}
              {value === option.value && (
                <span className="ml-auto text-brand-600">✓</span>
              )}
            </DropdownItem>
          ))}
        </>
      )}
    </Dropdown>
  );
}
