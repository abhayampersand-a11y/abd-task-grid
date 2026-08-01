import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { handler, ok, requireUser } from "@/lib/api";
import { toNotification } from "@/lib/serialize";

export const GET = handler(async (request: NextRequest) => {
  const user = await requireUser();
  const unreadOnly = request.nextUrl.searchParams.get("unread") === "true";

  const [notifications, unreadCount] = await Promise.all([
    db.notification.findMany({
      where: { userId: user.id, ...(unreadOnly ? { read: false } : {}) },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.notification.count({ where: { userId: user.id, read: false } }),
  ]);

  return ok({
    notifications: notifications.map(toNotification),
    unreadCount,
  });
});

/** Marks everything as read. */
export const PATCH = handler(async () => {
  const user = await requireUser();
  await db.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });
  return ok({ success: true });
});

export const DELETE = handler(async () => {
  const user = await requireUser();
  await db.notification.deleteMany({ where: { userId: user.id, read: true } });
  return ok({ success: true });
});
