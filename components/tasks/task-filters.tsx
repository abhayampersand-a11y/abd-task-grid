"use client";

import { RotateCcw, Search } from "lucide-react";
import { PRIORITY_META, PRIORITY_ORDER, STATUS_META, STATUS_ORDER } from "@/lib/utils";
import type { UserSummary } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { resetTaskFilters, setTaskFilter } from "@/store/ui-slice";

const SELECT =
  "h-10 rounded-lg border border-line bg-surface px-3 pr-8 text-[13px] font-medium text-ink-soft " +
  "appearance-none bg-[length:14px] bg-[right_0.6rem_center] bg-no-repeat cursor-pointer " +
  "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke-width=%222%22 stroke=%22%23767c92%22><path stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22m19.5 8.25-7.5 7.5-7.5-7.5%22/></svg>')] " +
  "focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 focus:outline-none";

export function TaskFilters({
  /** Populates the "assigned by" select — omitted on the "assigned by me" tab. */
  people,
  showAssignedBy = true,
}: {
  people: UserSummary[];
  showAssignedBy?: boolean;
}) {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.ui.taskFilters);

  const dirty =
    filters.status !== "ALL" ||
    filters.priority !== "ALL" ||
    filters.assignedBy !== "ALL" ||
    filters.search !== "" ||
    filters.sort !== "newest";

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="relative min-w-48 flex-1 sm:max-w-64">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
        <input
          value={filters.search}
          onChange={(event) =>
            dispatch(setTaskFilter({ search: event.target.value }))
          }
          placeholder="Search tasks…"
          aria-label="Search tasks"
          className="h-10 w-full rounded-lg border border-line bg-surface pl-9 pr-3 text-[13px] text-ink placeholder:text-ink-faint focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 focus:outline-none"
        />
      </div>

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
        className={SELECT}
      >
        <option value="ALL">All statuses</option>
        {STATUS_ORDER.map((status) => (
          <option key={status} value={status}>
            {STATUS_META[status].label}
          </option>
        ))}
      </select>

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
        className={SELECT}
      >
        <option value="ALL">All priorities</option>
        {PRIORITY_ORDER.map((priority) => (
          <option key={priority} value={priority}>
            {PRIORITY_META[priority].label}
          </option>
        ))}
      </select>

      {showAssignedBy && (
        <select
          value={filters.assignedBy}
          onChange={(event) =>
            dispatch(setTaskFilter({ assignedBy: event.target.value }))
          }
          aria-label="Filter by who assigned the task"
          className={SELECT}
        >
          <option value="ALL">Assigned by anyone</option>
          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {person.fullName}
            </option>
          ))}
        </select>
      )}

      <select
        value={filters.sort}
        onChange={(event) =>
          dispatch(
            setTaskFilter({ sort: event.target.value as typeof filters.sort }),
          )
        }
        aria-label="Sort tasks"
        className={SELECT}
      >
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
        <option value="due-soon">Due soonest</option>
        <option value="priority">Highest priority</option>
      </select>

      {dirty && (
        <button
          type="button"
          onClick={() => dispatch(resetTaskFilters())}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink-soft"
        >
          <RotateCcw className="size-3.5" />
          Reset
        </button>
      )}
    </div>
  );
}
