import { db } from "@/lib/db";
import { handler, ok, requireAdmin } from "@/lib/api";
import { startOfToday } from "@/lib/queries";

export const GET = handler(async () => {
  await requireAdmin();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalUsers,
    activeUsers,
    disabledUsers,
    newThisMonth,
    joinedToday,
    totalGroups,
    totalTasks,
    completedTasks,
  ] = await Promise.all([
    db.user.count({ where: { role: "USER" } }),
    db.user.count({ where: { role: "USER", status: "ACTIVE" } }),
    db.user.count({ where: { role: "USER", status: "DISABLED" } }),
    db.user.count({
      where: { role: "USER", createdAt: { gte: thirtyDaysAgo } },
    }),
    db.user.count({ where: { role: "USER", createdAt: { gte: startOfToday() } } }),
    db.group.count(),
    db.task.count(),
    db.task.count({ where: { status: "COMPLETED" } }),
  ]);

  return ok({
    totalUsers,
    activeUsers,
    disabledUsers,
    newThisMonth,
    joinedToday,
    totalGroups,
    totalTasks,
    completedTasks,
    completionRate:
      totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100),
    growthRate:
      totalUsers === 0 ? 0 : Math.round((newThisMonth / totalUsers) * 100),
  });
});
