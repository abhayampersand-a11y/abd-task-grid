import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  badRequest,
  forbidden,
  handler,
  ok,
  requireMembership,
  requireUser,
} from "@/lib/api";

export const DELETE = handler(
  async (
    _request: NextRequest,
    ctx: RouteContext<"/api/groups/[groupId]/members/[userId]">,
  ) => {
    const user = await requireUser();
    const { groupId, userId } = await ctx.params;
    const membership = await requireMembership(groupId, user.id);

    // Owners can remove anyone; everyone else may only remove themselves.
    if (membership.role !== "OWNER" && userId !== user.id) {
      throw forbidden("Only the group owner can remove other members.");
    }

    const target = await db.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (!target) return ok({ success: true });

    if (target.role === "OWNER") {
      throw badRequest(
        "The group owner cannot be removed. Delete the group instead.",
      );
    }

    await db.groupMember.delete({ where: { id: target.id } });
    return ok({ success: true });
  },
);
