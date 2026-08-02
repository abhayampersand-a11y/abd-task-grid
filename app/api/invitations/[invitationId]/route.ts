import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  badRequest,
  forbidden,
  handler,
  notFound,
  ok,
  parseBody,
  requireUser,
} from "@/lib/api";
import { notify, recordActivity } from "@/lib/events";
import { invitationInclude, toInvitation } from "@/lib/serialize";
import { invitationResponseSchema } from "@/lib/validation";

/** The invitee accepts or declines. Membership only exists after ACCEPT. */
export const PATCH = handler(
  async (
    request: NextRequest,
    ctx: RouteContext<"/api/invitations/[invitationId]">,
  ) => {
    const user = await requireUser();
    const { invitationId } = await ctx.params;
    const { action } = await parseBody(request, invitationResponseSchema);

    const invitation = await db.groupInvitation.findUnique({
      where: { id: invitationId },
      include: invitationInclude,
    });

    if (!invitation || invitation.inviteeId !== user.id) {
      throw notFound("That request no longer exists.");
    }
    if (invitation.status !== "PENDING") {
      throw badRequest("You have already answered this request.");
    }

    const groupId = invitation.groupId;
    const groupName = invitation.group.name;

    if (action === "ACCEPT") {
      // The owner may have added them by another route in the meantime, so the
      // membership write has to tolerate an existing row.
      await db.groupMember.upsert({
        where: { groupId_userId: { groupId, userId: user.id } },
        create: { groupId, userId: user.id },
        update: {},
      });

      await recordActivity({
        type: "MEMBER_ADDED",
        message: `${user.fullName} joined the group`,
        actorId: user.id,
        groupId,
      });
    }

    const updated = await db.groupInvitation.update({
      where: { id: invitation.id },
      data: {
        status: action === "ACCEPT" ? "ACCEPTED" : "DECLINED",
        respondedAt: new Date(),
      },
      include: invitationInclude,
    });

    await notify({
      userIds: [invitation.invitedById],
      type: "GROUP_INVITATION",
      title: action === "ACCEPT" ? "Invitation accepted" : "Invitation declined",
      body:
        action === "ACCEPT"
          ? `${user.fullName} joined "${groupName}".`
          : `${user.fullName} declined your invitation to "${groupName}".`,
      link: action === "ACCEPT" ? `/groups/${groupId}` : null,
      exceptUserId: user.id,
    });

    return ok({ invitation: toInvitation(updated) });
  },
);

/** The owner withdraws an invitation that has not been answered yet. */
export const DELETE = handler(
  async (
    _request: NextRequest,
    ctx: RouteContext<"/api/invitations/[invitationId]">,
  ) => {
    const user = await requireUser();
    const { invitationId } = await ctx.params;

    const invitation = await db.groupInvitation.findUnique({
      where: { id: invitationId },
      select: { id: true, groupId: true, status: true },
    });

    if (!invitation) throw notFound("That invitation no longer exists.");

    const membership = await db.groupMember.findUnique({
      where: { groupId_userId: { groupId: invitation.groupId, userId: user.id } },
      select: { role: true },
    });

    if (membership?.role !== "OWNER") {
      throw forbidden("Only the group owner can withdraw an invitation.");
    }
    if (invitation.status !== "PENDING") {
      throw badRequest("That invitation has already been answered.");
    }

    await db.groupInvitation.delete({ where: { id: invitation.id } });
    return ok({ success: true });
  },
);
