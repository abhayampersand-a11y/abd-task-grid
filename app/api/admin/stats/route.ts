import { db } from "@/lib/db";
import { handler, ok, requireAdmin } from "@/lib/api";
import { cached } from "@/lib/cache";
import { startOfToday } from "@/lib/queries";

/**
 * These are whole-table counts, which Postgres can only answer by reading the
 * table — the one query shape that gets slower purely because the product is
 * succeeding. Two things keep it cheap: each table is summarised in a single
 * pass with `FILTER` rather than one query per number, and the result is held
 * for CACHE_MS so a room full of open admin dashboards costs one scan, not one
 * per poll. Half a minute of staleness on a growth chart is not a problem.
 */
const CACHE_MS = 30_000;

interface UserTotals {
  totalUsers: number;
  activeUsers: number;
  disabledUsers: number;
  newThisMonth: number;
  joinedToday: number;
}

interface TaskTotals {
  totalTasks: number;
  completedTasks: number;
}

async function loadStats() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const today = startOfToday();

  const [[users], [tasks], totalGroups] = await Promise.all([
    db.$queryRaw<UserTotals[]>`
      SELECT
        count(*)::int AS "totalUsers",
        count(*) FILTER (WHERE u."status" = 'ACTIVE')::int AS "activeUsers",
        count(*) FILTER (WHERE u."status" = 'DISABLED')::int AS "disabledUsers",
        count(*) FILTER (WHERE u."createdAt" >= ${thirtyDaysAgo})::int
          AS "newThisMonth",
        count(*) FILTER (WHERE u."createdAt" >= ${today})::int AS "joinedToday"
      FROM "User" u
      WHERE u."role" = 'USER'
    `,
    db.$queryRaw<TaskTotals[]>`
      SELECT
        count(*)::int AS "totalTasks",
        count(*) FILTER (WHERE t."status" = 'COMPLETED')::int
          AS "completedTasks"
      FROM "Task" t
    `,
    db.group.count(),
  ]);

  const totalUsers = users?.totalUsers ?? 0;
  const totalTasks = tasks?.totalTasks ?? 0;
  const completedTasks = tasks?.completedTasks ?? 0;
  const newThisMonth = users?.newThisMonth ?? 0;

  return {
    totalUsers,
    activeUsers: users?.activeUsers ?? 0,
    disabledUsers: users?.disabledUsers ?? 0,
    newThisMonth,
    joinedToday: users?.joinedToday ?? 0,
    totalGroups,
    totalTasks,
    completedTasks,
    completionRate:
      totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100),
    growthRate:
      totalUsers === 0 ? 0 : Math.round((newThisMonth / totalUsers) * 100),
  };
}

export const GET = handler(async () => {
  await requireAdmin();
  return ok(await cached("admin:stats", CACHE_MS, loadStats));
});
