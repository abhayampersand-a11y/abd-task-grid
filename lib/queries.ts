import "server-only";

import { db } from "./db";
import { toUserSummary, userSummarySelect } from "./serialize";
import type { GroupSummary } from "./types";

/** How many member avatars a group card shows. */
const MEMBER_PREVIEW = 5;

/**
 * Every group the user belongs to, with the counts the cards need.
 *
 * Deliberately three bounded queries rather than one big include: the
 * membership row is what tells us the viewer's own role, so the group query
 * only has to fetch the handful of members the card actually paints. Reading
 * every member of every group — which is what an unbounded `include` does —
 * gets slower for everyone every time one group gets popular.
 */
export async function listGroupsForUser(userId: string): Promise<GroupSummary[]> {
  const memberships = await db.groupMember.findMany({
    where: { userId },
    select: { groupId: true, role: true },
  });

  if (memberships.length === 0) return [];

  const groupIds = memberships.map((m) => m.groupId);
  const roleByGroup = new Map(memberships.map((m) => [m.groupId, m.role]));

  const [groups, completedCounts] = await Promise.all([
    db.group.findMany({
      where: { id: { in: groupIds } },
      orderBy: { createdAt: "desc" },
      include: {
        members: {
          orderBy: { joinedAt: "asc" },
          take: MEMBER_PREVIEW,
          select: { user: { select: userSummarySelect } },
        },
        _count: { select: { members: true, tasks: true } },
      },
    }),
    db.task.groupBy({
      by: ["groupId"],
      where: { status: "COMPLETED", groupId: { in: groupIds } },
      _count: { _all: true },
    }),
  ]);

  const completedByGroup = new Map(
    completedCounts.map((row) => [row.groupId, row._count._all]),
  );

  return groups.map((group) => ({
    id: group.id,
    name: group.name,
    description: group.description,
    visibility: group.visibility,
    colorKey: group.colorKey,
    iconUrl: group.iconUrl,
    createdAt: group.createdAt.toISOString(),
    memberCount: group._count.members,
    taskCount: group._count.tasks,
    completedTaskCount: completedByGroup.get(group.id) ?? 0,
    myRole: roleByGroup.get(group.id) === "OWNER" ? "OWNER" : "MEMBER",
    members: group.members.map((m) => toUserSummary(m.user)),
  }));
}

export interface TaskCounters {
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  assignedByMe: number;
  assignedToMe: number;
  dueToday: number;
  dueThisWeek: number;
}

/**
 * The eight dashboard tiles, in one pass over the rows instead of eight
 * separate `count` round trips.
 *
 * Eight parallel counts also means eight pooled connections held for the same
 * request, so the old version got dramatically worse exactly when traffic went
 * up. `FILTER` lets one scan answer all of them, and the outer `WHERE` keeps
 * that scan on the two index ranges that matter — tasks assigned to the user,
 * and tasks the user assigned to somebody else.
 */
export async function taskCountersForUser(userId: string): Promise<TaskCounters> {
  const now = new Date();
  const today = startOfToday();
  const todayEnd = endOfToday();
  const weekEnd = endOfWeek();

  const [row] = await db.$queryRaw<
    Record<keyof TaskCounters, number>[]
  >`
    SELECT
      count(*) FILTER (
        WHERE t."assigneeId" = ${userId} AND t."status" IN ('BACKLOG', 'TODO')
      )::int AS "pending",
      count(*) FILTER (
        WHERE t."assigneeId" = ${userId}
          AND t."status" IN ('IN_PROGRESS', 'IN_REVIEW')
      )::int AS "inProgress",
      count(*) FILTER (
        WHERE t."assigneeId" = ${userId} AND t."status" = 'COMPLETED'
      )::int AS "completed",
      count(*) FILTER (
        WHERE t."assigneeId" = ${userId}
          AND t."status" <> 'COMPLETED'
          AND t."dueDate" < ${now}
      )::int AS "overdue",
      count(*) FILTER (
        WHERE t."createdById" = ${userId}
          AND t."assigneeId" IS DISTINCT FROM ${userId}
      )::int AS "assignedByMe",
      count(*) FILTER (WHERE t."assigneeId" = ${userId})::int AS "assignedToMe",
      count(*) FILTER (
        WHERE t."assigneeId" = ${userId}
          AND t."status" <> 'COMPLETED'
          AND t."dueDate" >= ${today} AND t."dueDate" <= ${todayEnd}
      )::int AS "dueToday",
      count(*) FILTER (
        WHERE t."assigneeId" = ${userId}
          AND t."status" <> 'COMPLETED'
          AND t."dueDate" >= ${today} AND t."dueDate" <= ${weekEnd}
      )::int AS "dueThisWeek"
    FROM "Task" t
    WHERE (
        t."assigneeId" = ${userId}
        OR (
          t."createdById" = ${userId}
          AND t."assigneeId" IS DISTINCT FROM ${userId}
        )
      )
      -- Same boundary the Prisma queries enforce: never count a task from a
      -- group the viewer has since left.
      AND EXISTS (
        SELECT 1 FROM "GroupMember" m
        WHERE m."groupId" = t."groupId" AND m."userId" = ${userId}
      )
  `;

  return (
    row ?? {
      pending: 0,
      inProgress: 0,
      completed: 0,
      overdue: 0,
      assignedByMe: 0,
      assignedToMe: 0,
      dueToday: 0,
      dueThisWeek: 0,
    }
  );
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

export interface GroupTaskCounters {
  completed: number;
  active: number;
  overdue: number;
}

/** The three task numbers on a group page, in one pass over that group's rows. */
export async function groupTaskCounters(
  groupId: string,
): Promise<GroupTaskCounters> {
  const now = new Date();

  const [row] = await db.$queryRaw<Record<keyof GroupTaskCounters, number>[]>`
    SELECT
      count(*) FILTER (WHERE t."status" = 'COMPLETED')::int AS "completed",
      count(*) FILTER (WHERE t."status" <> 'COMPLETED')::int AS "active",
      count(*) FILTER (
        WHERE t."status" <> 'COMPLETED' AND t."dueDate" < ${now}
      )::int AS "overdue"
    FROM "Task" t
    WHERE t."groupId" = ${groupId}
  `;

  return row ?? { completed: 0, active: 0, overdue: 0 };
}
