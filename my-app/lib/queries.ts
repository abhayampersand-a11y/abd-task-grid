import "server-only";

import { db } from "./db";
import { toUserSummary, userSummarySelect } from "./serialize";
import type { GroupSummary } from "./types";

const groupSummaryInclude = {
  members: {
    orderBy: { joinedAt: "asc" },
    select: {
      userId: true,
      role: true,
      user: { select: userSummarySelect },
    },
  },
  _count: { select: { members: true, tasks: true } },
} as const;

/** Every group the user belongs to, with the counts the cards need. */
export async function listGroupsForUser(userId: string): Promise<GroupSummary[]> {
  const groups = await db.group.findMany({
    where: { members: { some: { userId } } },
    orderBy: { createdAt: "desc" },
    include: groupSummaryInclude,
  });

  const completedCounts = await db.task.groupBy({
    by: ["groupId"],
    where: {
      status: "COMPLETED",
      groupId: { in: groups.map((group) => group.id) },
    },
    _count: { _all: true },
  });

  const completedByGroup = new Map(
    completedCounts.map((row) => [row.groupId, row._count._all]),
  );

  return groups.map((group) => {
    const mine = group.members.find((member) => member.userId === userId);
    return {
      id: group.id,
      name: group.name,
      description: group.description,
      visibility: group.visibility,
      colorKey: group.colorKey,
      createdAt: group.createdAt.toISOString(),
      memberCount: group._count.members,
      taskCount: group._count.tasks,
      completedTaskCount: completedByGroup.get(group.id) ?? 0,
      myRole: mine?.role === "OWNER" ? "OWNER" : "MEMBER",
      members: group.members.slice(0, 5).map((m) => toUserSummary(m.user)),
    };
  });
}

export function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

export function endOfWeek() {
  const d = endOfToday();
  d.setDate(d.getDate() + (7 - d.getDay()));
  return d;
}
