import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  badRequest,
  handler,
  notFound,
  ok,
  parseBody,
  requireAdmin,
} from "@/lib/api";
import { deleteObjectQuietly } from "@/lib/r2";
import { adminUserActionSchema } from "@/lib/validation";

async function loadTarget(userId: string) {
  const target = await db.user.findUnique({ where: { id: userId } });
  if (!target) throw notFound("That user no longer exists.");
  if (target.role === "ADMIN") {
    throw badRequest("The administrator account cannot be modified here.");
  }
  return target;
}

export const PATCH = handler(
  async (
    request: NextRequest,
    ctx: RouteContext<"/api/admin/users/[userId]">,
  ) => {
    await requireAdmin();
    const { userId } = await ctx.params;
    await loadTarget(userId);

    const { status } = await parseBody(request, adminUserActionSchema);
    await db.user.update({ where: { id: userId }, data: { status } });

    return ok({ success: true });
  },
);

export const DELETE = handler(
  async (
    _request: NextRequest,
    ctx: RouteContext<"/api/admin/users/[userId]">,
  ) => {
    await requireAdmin();
    const { userId } = await ctx.params;
    const target = await loadTarget(userId);

    await db.user.delete({ where: { id: userId } });
    // The row is gone, so nothing will ever reference their picture again.
    await deleteObjectQuietly(target.avatarKey);

    return ok({ success: true });
  },
);
