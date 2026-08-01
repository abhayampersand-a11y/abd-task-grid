import { db } from "@/lib/db";
import { handler, ok, requireUser } from "@/lib/api";
import {
  endOfToday,
  endOfWeek,
  listGroupsForUser,
  startOfToday,
} from "@/lib/queries";
import {
  taskSummaryInclude,
  toActivity,
  toTaskSummary,
  userSummarySelect,
} from "@/lib/serialize";
import type { DashboardOverview } from "@/lib/types";

export const GET = handler(async () => {
  const user = await requireUser();
  const now = new Date();

  const inMyGroups = { group: { members: { some: { userId: user.id } } } };
  const mine = { assigneeId: user.id, ...inMyGroups };

  const [
    groups,
    pending,
    inProgress,
    completed,
    overdue,
    assignedByMe,
    assignedToMe,
    dueToday,
    dueThisWeek,
    upcoming,
    recentActivity,
  ] = await Promise.all([
    listGroupsForUser(user.id),
    db.task.count({ where: { ...mine, status: { in: ["BACKLOG", "TODO"] } } }),
    db.task.count({
      where: { ...mine, status: { in: ["IN_PROGRESS", "IN_REVIEW"] } },
    }),
    db.task.count({ where: { ...mine, status: "COMPLETED" } }),
    db.task.count({
      where: { ...mine, status: { not: "COMPLETED" }, dueDate: { lt: now } },
    }),
    db.task.count({
      where: { createdById: user.id, NOT: { assigneeId: user.id }, ...inMyGroups },
    }),
    db.task.count({ where: mine }),
    db.task.count({
      where: {
        ...mine,
        status: { not: "COMPLETED" },
        dueDate: { gte: startOfToday(), lte: endOfToday() },
      },
    }),
    db.task.count({
      where: {
        ...mine,
        status: { not: "COMPLETED" },
        dueDate: { gte: startOfToday(), lte: endOfWeek() },
      },
    }),
    db.task.findMany({
      where: { ...mine, status: { not: "COMPLETED" }, dueDate: { not: null } },
      orderBy: { dueDate: "asc" },
      take: 5,
      include: taskSummaryInclude,
    }),
    db.activity.findMany({
      where: { group: { members: { some: { userId: user.id } } } },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { actor: { select: userSummarySelect } },
    }),
  ]);

  const overview: DashboardOverview = {
    stats: {
      pending,
      inProgress,
      completed,
      overdue,
      assignedByMe,
      assignedToMe,
      dueToday,
      dueThisWeek,
      groupCount: groups.length,
      completionRate:
        assignedToMe === 0 ? 0 : Math.round((completed / assignedToMe) * 100),
    },
    groups,
    upcoming: upcoming.map(toTaskSummary),
    recentActivity: recentActivity.map(toActivity),
  };

  return ok(overview);
});
