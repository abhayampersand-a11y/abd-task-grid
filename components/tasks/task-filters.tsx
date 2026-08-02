"use client";

import { RotateCcw, Search } from "lucide-react";
import {
  cn,
  PRIORITY_META,
  PRIORITY_ORDER,
  STATUS_META,
  STATUS_ORDER,
} from "@/lib/utils";
import type { UserSummary } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { resetTaskFilters, setTaskFilter } from "@/store/ui-slice";

const SELECT =
  "h-11 rounded-full border border-transparent bg-surface-muted px-4 pr-9 text-[13px] font-semibold text-ink-soft " +
  "appearance-none bg-[length:14px] bg-[right_0.85rem_center] bg-no-repeat cursor-pointer " +
  "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke-width=%222%22 stroke=%22%23857c8a%22><path stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22m19.5 8.25-7.5 7.5-7.5-7.5%22/></svg>')] " +
  "focus:border-brand-400 focus:bg-surface focus:ring-4 focus:ring-brand-500/12 focus:outline-none";

export function TaskFilters({
  /** Populates the "assigned by" select — omitted on the "assigned by me" tab. */
  people,
  showAssignedBy = true,
  /** Full-width column layout, used inside the mobile filter sheet. */
  stacked = false,
}: {
  people: UserSummary[];
  showAssignedBy?: boolean;
  stacked?: boolean;
}) {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.ui.taskFilters);

  const dirty =
    filters.status !== "ALL" ||
    filters.priority !== "ALL" ||
    filters.assignedBy !== "ALL" ||
    filters.search !== "" ||
    filters.sort !== "newest";

  const field = stacked ? "w-full" : "";

  return (
    <div
      className={cn(
        stacked ? "flex flex-col gap-4" : "flex flex-wrap items-center gap-2.5",
      )}
    >
      <div
        className={cn(
          "relative",
          stacked ? "w-full" : "min-w-48 flex-1 sm:max-w-64",
        )}
      >
        {stacked && (
          <span className="mb-1.5 block text-[13px] font-semibold text-ink-soft">
            Search
          </span>
        )}
        <Search
          className={cn(
            "pointer-events-none absolute left-4 size-4 text-ink-faint",
            stacked ? "top-[2.35rem]" : "top-1/2 -translate-y-1/2",
          )}
        />
        <input
          value={filters.search}
          onChange={(event) =>
            dispatch(setTaskFilter({ search: event.target.value }))
          }
          placeholder="Search tasks…"
          aria-label="Search tasks"
          className="h-11 w-full rounded-full border border-transparent bg-surface-muted pl-11 pr-4 text-[13px] text-ink placeholder:text-ink-faint focus:border-brand-400 focus:bg-surface focus:ring-4 focus:ring-brand-500/12 focus:outline-none"
        />
      </div>

      <Labelled label="Status" stacked={stacked}>
        <select
          value={filters.status}
          onChange={(event) =>
            dispatch(
              setTaskFilter({
                status: event.target.value as typeof filters.status,
              }),
            )
          }
          aria-label="Filter by status"
          className={cn(SELECT, field)}
        >
          <option value="ALL">All statuses</option>
          {STATUS_ORDER.map((status) => (
            <option key={status} value={status}>
              {STATUS_META[status].label}
            </option>
          ))}
        </select>
      </Labelled>

      <Labelled label="Priority" stacked={stacked}>
        <select
          value={filters.priority}
          onChange={(event) =>
            dispatch(
              setTaskFilter({
                priority: event.target.value as typeof filters.priority,
              }),
            )
          }
          aria-label="Filter by priority"
          className={cn(SELECT, field)}
        >
          <option value="ALL">All priorities</option>
          {PRIORITY_ORDER.map((priority) => (
            <option key={priority} value={priority}>
              {PRIORITY_META[priority].label}
            </option>
          ))}
        </select>
      </Labelled>

      {showAssignedBy && (
        <Labelled label="Assigned by" stacked={stacked}>
          <select
            value={filters.assignedBy}
            onChange={(event) =>
              dispatch(setTaskFilter({ assignedBy: event.target.value }))
            }
            aria-label="Filter by who assigned the task"
            className={cn(SELECT, field)}
          >
            <option value="ALL">Anyone</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.fullName}
              </option>
            ))}
          </select>
        </Labelled>
      )}

      <Labelled label="Sort" stacked={stacked}>
        <select
          value={filters.sort}
          onChange={(event) =>
            dispatch(
              setTaskFilter({ sort: event.target.value as typeof filters.sort }),
            )
          }
          aria-label="Sort tasks"
          className={cn(SELECT, field)}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="due-soon">Due soonest</option>
          <option value="priority">Highest priority</option>
        </select>
      </Labelled>

      {dirty && (
        <button
          type="button"
          onClick={() => dispatch(resetTaskFilters())}
          className={cn(
            "inline-flex h-11 items-center justify-center gap-1.5 rounded-full px-4 text-[13px] font-semibold",
            "text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink-soft",
            stacked && "w-full bg-surface-muted",
          )}
        >
          <RotateCcw className="size-3.5" />
          Reset filters
        </button>
      )}
    </div>
  );
}

function Labelled({
  label,
  stacked,
  children,
}: {
  label: string;
  stacked: boolean;
  children: React.ReactNode;
}) {
  if (!stacked) return <>{children}</>;

  return (
    <div className="w-full">
      <span className="mb-1.5 block text-[13px] font-semibold text-ink-soft">
        {label}
      </span>
      {children}
    </div>
  );
}
