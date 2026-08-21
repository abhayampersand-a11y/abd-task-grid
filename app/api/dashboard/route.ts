import { db } from "@/lib/db";
import { handler, ok, requireUser } from "@/lib/api";
import { listGroupsForUser, taskCountersForUser } from "@/lib/queries";
import {
  taskSummaryInclude,
  toActivity,
  toTaskSummary,
  userSummarySelect,
} from "@/lib/serialize";
import type { DashboardOverview } from "@/lib/types";

export const GET = handler(async () => {
  const user = await requireUser();

  const mine = {
    assigneeId: user.id,
    group: { members: { some: { userId: user.id } } },
  };

  const [groups, counters, upcoming, recentActivity] = await Promise.all([
    listGroupsForUser(user.id),
    taskCountersForUser(user.id),
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
      ...counters,
      groupCount: groups.length,
      completionRate:
        counters.assignedToMe === 0
          ? 0
          : Math.round((counters.completed / counters.assignedToMe) * 100),
    },
    groups,
    upcoming: upcoming.map(toTaskSummary),
    recentActivity: recentActivity.map(toActivity),
  };

  return ok(overview);
});
