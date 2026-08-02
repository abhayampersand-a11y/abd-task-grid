import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { handler, ok, requireMembership, requireUser } from "@/lib/api";
import { buildTaskWhere } from "../route";

/**
 * Counters for the task table header. Takes the same query params as
 * GET /api/tasks (minus status/due, which the tiles themselves represent), so
 * the numbers always describe the same set of rows the table is showing.
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

  const [total, pending, inProgress, completed, overdue] = await Promise.all([
    db.task.count({ where: base }),
    db.task.count({ where: { ...base, status: { in: ["BACKLOG", "TODO"] } } }),
    db.task.count({
      where: { ...base, status: { in: ["IN_PROGRESS", "IN_REVIEW"] } },
    }),
    db.task.count({ where: { ...base, status: "COMPLETED" } }),
    db.task.count({
      where: {
        ...base,
        status: { not: "COMPLETED" },
        dueDate: { lt: new Date() },
      },
    }),
  ]);

  return ok({ total, pending, inProgress, completed, overdue });
});
