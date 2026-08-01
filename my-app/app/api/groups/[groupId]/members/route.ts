import type { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  forbidden,
  handler,
  ok,
  parseBody,
  requireMembership,
  requireUser,
} from "@/lib/api";
import { notify, recordActivity } from "@/lib/events";
import { toMember, userSummarySelect } from "@/lib/serialize";

const addMembersSchema = z.object({
  memberIds: z.array(z.string()).min(1, "Select at least one member."),
});

export const GET = handler(
  async (
    _request: NextRequest,
    ctx: RouteContext<"/api/groups/[groupId]/members">,
  ) => {
    const user = await requireUser();
    const { groupId } = await ctx.params;
    await requireMembership(groupId, user.id);

    const members = await db.groupMember.findMany({
      where: { groupId },
      orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
      include: { user: { select: userSummarySelect } },
    });

    return ok({ members: members.map(toMember) });
  },
);

export const POST = handler(
  async (
    request: NextRequest,
    ctx: RouteContext<"/api/groups/[groupId]/members">,
  ) => {
    const user = await requireUser();
    const { groupId } = await ctx.params;
    const membership = await requireMembership(groupId, user.id);
    if (membership.role !== "OWNER") {
      throw forbidden("Only the group owner can add members.");
    }

    const { memberIds } = await parseBody(request, addMembersSchema);

    const existing = await db.groupMember.findMany({
      where: { groupId },
      select: { userId: true },
    });
    const alreadyIn = new Set(existing.map((m) => m.userId));

    const candidates = await db.user.findMany({
      where: {
        id: { in: memberIds.filter((id) => !alreadyIn.has(id)) },
        status: { not: "DISABLED" },
        role: "USER",
      },
      select: { id: true },
    });

    if (candidates.length === 0) {
      return ok({ added: 0 });
    }

    const group = await db.group.findUniqueOrThrow({
      where: { id: groupId },
      select: { name: true },
    });

    await db.groupMember.createMany({
      data: candidates.map((c) => ({ groupId, userId: c.id })),
    });

    await recordActivity({
      type: "MEMBER_ADDED",
      message: `${user.fullName} added ${candidates.length} member${
        candidates.length === 1 ? "" : "s"
      }`,
      actorId: user.id,
      groupId,
    });

    await notify({
      userIds: candidates.map((c) => c.id),
      type: "GROUP_INVITATION",
      title: "Added to a group",
      body: `${user.fullName} added you to "${group.name}".`,
      link: `/groups/${groupId}`,
      exceptUserId: user.id,
    });

    return ok({ added: candidates.length }, 201);
  },
);
