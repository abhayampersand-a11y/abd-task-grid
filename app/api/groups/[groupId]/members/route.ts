import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  forbidden,
  handler,
  ok,
  parseBody,
  requireMembership,
  requireUser,
} from "@/lib/api";
import { notify } from "@/lib/events";
import { toMember, userSummarySelect } from "@/lib/serialize";
import { inviteMembersSchema } from "@/lib/validation";

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

/**
 * Invites people to the group. Nobody is added here — a PENDING invitation is
 * created and the invitee joins from their Requests page.
 */
export const POST = handler(
  async (
    request: NextRequest,
    ctx: RouteContext<"/api/groups/[groupId]/members">,
  ) => {
    const user = await requireUser();
    const { groupId } = await ctx.params;
    const membership = await requireMembership(groupId, user.id);
    if (membership.role !== "OWNER") {
      throw forbidden("Only the group owner can invite members.");
    }

    const { memberIds } = await parseBody(request, inviteMembersSchema);

    const [members, invitations] = await Promise.all([
      db.groupMember.findMany({ where: { groupId }, select: { userId: true } }),
      db.groupInvitation.findMany({
        where: { groupId, status: "PENDING" },
        select: { inviteeId: true },
      }),
    ]);

    const settled = new Set([
      ...members.map((m) => m.userId),
      ...invitations.map((i) => i.inviteeId),
    ]);

    const candidates = await db.user.findMany({
      where: {
        id: { in: memberIds.filter((id) => !settled.has(id)) },
        status: { not: "DISABLED" },
        role: "USER",
      },
      select: { id: true },
    });

    if (candidates.length === 0) {
      return ok({ invited: 0 });
    }

    const group = await db.group.findUniqueOrThrow({
      where: { id: groupId },
      select: { name: true },
    });

    // Somebody who declined earlier still owns the (group, user) row, so the
    // re-invite has to reset it rather than insert a second one.
    await Promise.all(
      candidates.map((candidate) =>
        db.groupInvitation.upsert({
          where: {
            groupId_inviteeId: { groupId, inviteeId: candidate.id },
          },
          create: { groupId, inviteeId: candidate.id, invitedById: user.id },
          update: {
            status: "PENDING",
            invitedById: user.id,
            respondedAt: null,
            createdAt: new Date(),
          },
        }),
      ),
    );

    await notify({
      userIds: candidates.map((c) => c.id),
      type: "GROUP_INVITATION",
      title: "Group invitation",
      body: `${user.fullName} asked you to join "${group.name}".`,
      link: "/requests",
      exceptUserId: user.id,
    });

    return ok({ invited: candidates.length }, 201);
  },
);
