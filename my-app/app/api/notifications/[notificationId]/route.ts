import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { handler, ok, requireUser } from "@/lib/api";

export const PATCH = handler(
  async (
    _request: NextRequest,
    ctx: RouteContext<"/api/notifications/[notificationId]">,
  ) => {
    const user = await requireUser();
    const { notificationId } = await ctx.params;

    await db.notification.updateMany({
      where: { id: notificationId, userId: user.id },
      data: { read: true },
    });

    return ok({ success: true });
  },
);

export const DELETE = handler(
  async (
    _request: NextRequest,
    ctx: RouteContext<"/api/notifications/[notificationId]">,
  ) => {
    const user = await requireUser();
    const { notificationId } = await ctx.params;

    await db.notification.deleteMany({
      where: { id: notificationId, userId: user.id },
    });

    return ok({ success: true });
  },
);
