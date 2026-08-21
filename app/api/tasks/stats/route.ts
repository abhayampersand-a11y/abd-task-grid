import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { handler, ok, requireMembership, requireUser } from "@/lib/api";
import { buildTaskWhere } from "../route";
import type { TaskStatus } from "@/generated/prisma/enums";

const PENDING: TaskStatus[] = ["BACKLOG", "TODO"];
const IN_PROGRESS: TaskStatus[] = ["IN_PROGRESS", "IN_REVIEW"];

/**
 * Counters for the task table header. Takes the same query params as
 * GET /api/tasks (minus status/due, which the tiles themselves represent), so
 * the numbers always describe the same set of rows the table is showing.
 *
 * One `groupBy` answers four of the five tiles — counting each status once and
 * adding the buckets up here is strictly cheaper than asking the database the
 * same question four times, and it holds one pooled connection instead of four.
 */
export const GET = handler(async (request: NextRequest) => {
  const user = await requireUser();
  const params = new URLSearchParams(request.nextUrl.searchParams);

  const groupId = params.get("groupId");
  if (groupId) await requireMembership(groupId, user.id);

  // The tiles are the status breakdown, so ignore any status/due filter.
  params.delete("status");
  params.delete("due");

  const base = buildTaskWhere(params, user.id);

  const [byStatus, overdue] = await Promise.all([
    db.task.groupBy({
      by: ["status"],
      where: base,
      _count: { _all: true },
    }),
    db.task.count({
      where: {
        ...base,
        status: { not: "COMPLETED" },
        dueDate: { lt: new Date() },
      },
    }),
  ]);

  const sum = (statuses: TaskStatus[]) =>
    byStatus.reduce(
      (n, row) => (statuses.includes(row.status) ? n + row._count._all : n),
      0,
    );

  return ok({
    total: byStatus.reduce((n, row) => n + row._count._all, 0),
    pending: sum(PENDING),
    inProgress: sum(IN_PROGRESS),
    completed: sum(["COMPLETED"]),
    overdue,
  });
});
