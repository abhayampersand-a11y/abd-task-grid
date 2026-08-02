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
  X,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { PriorityBadge, StatusBadge } from "@/components/ui/badge";
import { Button, Fab } from "@/components/ui/button";
import { Dropdown, DropdownItem, DropdownLabel } from "@/components/ui/dropdown";
import { EmptyState } from "@/components/ui/empty-state";
import { EmptyTasksIllustration } from "@/components/ui/illustrations";
import { ConfirmDialog, Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { RowSkeleton, StatSkeleton } from "@/components/ui/skeleton";
import { AssignTaskModal } from "@/components/tasks/assign-task-modal";
import { EditTaskModal } from "@/components/tasks/edit-task-modal";
import { TaskListRow } from "@/components/tasks/task-card";
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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
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

  const activeCount =
    (filters.status !== "ALL" ? 1 : 0) +
    (filters.priority !== "ALL" ? 1 : 0) +
    (filters.assigneeId !== "ALL" ? 1 : 0) +
    (filters.assignedBy !== "ALL" ? 1 : 0) +
    (filters.due !== "ALL" ? 1 : 0);

  const dirty = activeCount > 0 || filters.search !== "";

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
          <h1 className="text-[26px] font-bold leading-tight tracking-tight text-ink sm:text-3xl lg:text-[38px] lg:leading-tight">
            Tasks
          </h1>
          <p className="mt-1.5 text-[14px] text-ink-muted sm:text-[15px]">
            View and manage all tasks across your groups.
          </p>
        </div>

        {/* Phone actions — icons only, so the list starts higher up the page.
            Creating is handled by the FAB. */}
        <div className="flex shrink-0 items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => setSearchOpen((open) => !open)}
            aria-label="Search tasks"
            aria-expanded={searchOpen}
            className={cn(
              "flex size-11 items-center justify-center rounded-xl border transition-colors",
              searchOpen || filters.search
                ? "border-brand-300 bg-brand-50 text-brand-700"
                : "border-line bg-surface text-ink-soft active:bg-surface-muted",
            )}
          >
            <Search className="size-5" />
          </button>

          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            aria-label={`Filter tasks${activeCount ? `, ${activeCount} active` : ""}`}
            className={cn(
              "relative flex size-11 items-center justify-center rounded-xl border transition-colors",
              activeCount > 0
                ? "border-brand-300 bg-brand-50 text-brand-700"
                : "border-line bg-surface text-ink-soft active:bg-surface-muted",
            )}
          >
            <ListFilter className="size-5" />
            {activeCount > 0 && (
              <span className="absolute -right-1 -top-1 flex min-w-4.5 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold leading-[1.125rem] text-white ring-2 ring-canvas dark:bg-brand-500">
                {activeCount}
              </span>
            )}
          </button>
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 lg:flex">
          <div className="flex items-center rounded-xl bg-surface-muted p-1">
            <FilterMenu onChange={(patch) => dispatch(setBoardFilter(patch))} />
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

      {/* Search reveals inline on phones rather than occupying a permanent row */}
      {searchOpen && (
        <div className="relative lg:hidden">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
          <input
            autoFocus
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
            placeholder="Search tasks…"
            aria-label="Search tasks"
            className="h-11 w-full rounded-xl border border-line bg-surface pl-10 pr-11 text-ink placeholder:text-ink-faint focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              setSearchDraft("");
              setSearchOpen(false);
            }}
            aria-label="Close search"
            className="absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-ink-faint active:bg-surface-muted"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Stat tiles — one scrollable row on phones so the task list starts
          near the top of the viewport; a 5-up grid from `lg`. */}
      {!stats ? (
        <StatSkeleton count={5} />
      ) : (
        <section className="no-scrollbar scroll-contain -mx-4 flex snap-x gap-2.5 overflow-x-auto px-4 sm:mx-0 sm:px-0 lg:grid lg:grid-cols-5 lg:gap-4 lg:overflow-visible">
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
      <section className="card hidden flex-wrap items-center gap-2.5 p-3 lg:flex">
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

            {/* Phone/tablet: the same dense rows the group list uses. */}
            <ul
              className={cn(
                "divide-y divide-line lg:hidden",
                isFetching && "opacity-60",
              )}
            >
              {tasks.map((task) => (
                <li key={task.id}>
                  <TaskListRow
                    task={task}
                    onEdit={setEditing}
                    onDelete={setDeleting}
                  />
                </li>
              ))}
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

      <Fab
        onClick={() => setAssignOpen(true)}
        label="Create a task"
        icon={<Plus className="size-7" />}
      />

      {/* Mobile filter sheet — same Redux state as the desktop bar */}
      <Modal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filter tasks"
        description="Narrow the list down to what you need."
        width="sm"
        footer={
          <>
            {dirty && (
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={clearAll}
              >
                Clear all
              </Button>
            )}
            <Button
              className="w-full sm:w-auto"
              onClick={() => setFiltersOpen(false)}
            >
              Show results
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <SheetSelect
            label="Status"
            value={filters.status}
            options={[
              { value: "ALL", label: "All statuses" },
              ...STATUS_ORDER.map((s) => ({
                value: s,
                label: STATUS_META[s].label,
              })),
            ]}
            onChange={(value) =>
              dispatch(
                setBoardFilter({ status: value as typeof filters.status }),
              )
            }
          />
          <SheetSelect
            label="Priority"
            value={filters.priority}
            options={[
              { value: "ALL", label: "All priorities" },
              ...PRIORITY_ORDER.map((p) => ({
                value: p,
                label: PRIORITY_META[p].label,
              })),
            ]}
            onChange={(value) =>
              dispatch(
                setBoardFilter({ priority: value as typeof filters.priority }),
              )
            }
          />
          <SheetSelect
            label="Assigned to"
            value={filters.assigneeId}
            options={[
              { value: "ALL", label: "Anyone" },
              ...roster.map((p) => ({ value: p.id, label: p.fullName })),
            ]}
            onChange={(value) => dispatch(setBoardFilter({ assigneeId: value }))}
          />
          <SheetSelect
            label="Assigned by"
            value={filters.assignedBy}
            options={[
              { value: "ALL", label: "Anyone" },
              ...roster.map((p) => ({ value: p.id, label: p.fullName })),
            ]}
            onChange={(value) => dispatch(setBoardFilter({ assignedBy: value }))}
          />
          <SheetSelect
            label="Due date"
            value={filters.due}
            options={DUE_OPTIONS.map((o) => ({
              value: o.value,
              label: o.label,
            }))}
            onChange={(value) =>
              dispatch(setBoardFilter({ due: value as typeof filters.due }))
            }
          />
          <SheetSelect
            label="Sort by"
            value={sort}
            options={SORTS.map((o) => ({ value: o.value, label: o.label }))}
            onChange={setSort}
          />
        </div>
      </Modal>

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

/** Full-width labelled select, used inside the mobile filter sheet. */
function SheetSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <span className="mb-1.5 block text-[13px] font-medium text-ink-soft">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className="h-12 w-full cursor-pointer appearance-none rounded-xl border border-line bg-surface-muted px-3.5 pr-10 text-ink focus:border-brand-400 focus:bg-surface focus:ring-4 focus:ring-brand-500/10 focus:outline-none bg-[length:16px] bg-[right_0.9rem_center] bg-no-repeat bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke-width=%222%22 stroke=%22%23767c92%22><path stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22m19.5 8.25-7.5 7.5-7.5-7.5%22/></svg>')]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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
  // Compact chip on phones (value and label side by side, ~1 line tall);
  // the taller stacked card returns at `lg`.
  const content = (
    <>
      <p className="flex items-center gap-1.5 lg:mt-2 lg:order-2">
        <span
          className={cn(
            "text-lg font-bold tracking-tight lg:text-2xl",
            valueClass ?? "text-ink",
          )}
        >
          {value}
        </span>
        {dot && value > 0 && (
          <span className={cn("size-1.5 shrink-0 rounded-full", dot)} />
        )}
      </p>
      <p className="text-[10.5px] font-bold uppercase tracking-[0.06em] text-ink-soft lg:order-1 lg:text-[11px] lg:tracking-[0.08em]">
        {label}
      </p>
    </>
  );

  const shell = cn(
    "card flex shrink-0 snap-start items-center gap-2 whitespace-nowrap px-3 py-2.5",
    "lg:w-auto lg:flex-col lg:items-start lg:gap-0 lg:p-5",
  );

  if (!onClick) {
    return <div className={shell}>{content}</div>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(shell, "card-interactive text-left")}
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
