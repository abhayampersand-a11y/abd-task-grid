import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  forbidden,
  handler,
  notFound,
  ok,
  parseBody,
  requireMembership,
  requireUser,
} from "@/lib/api";
import {
  invitationInclude,
  toInvitation,
  toMember,
  toUserSummary,
  userSummarySelect,
} from "@/lib/serialize";
import { updateGroupSchema } from "@/lib/validation";
import type { GroupDetail } from "@/lib/types";

export const GET = handler(
  async (_request: NextRequest, ctx: RouteContext<"/api/groups/[groupId]">) => {
    const user = await requireUser();
    const { groupId } = await ctx.params;
    const membership = await requireMembership(groupId, user.id);

    const group = await db.group.findUnique({
      where: { id: groupId },
      include: {
        createdBy: { select: userSummarySelect },
        members: {
          orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
          include: { user: { select: userSummarySelect } },
        },
        _count: { select: { members: true, tasks: true } },
      },
    });

    if (!group) throw notFound("That group no longer exists.");

    const isOwner = membership.role === "OWNER";

    const [completed, active, overdue, pending] = await Promise.all([
      db.task.count({ where: { groupId, status: "COMPLETED" } }),
      db.task.count({ where: { groupId, status: { not: "COMPLETED" } } }),
      db.task.count({
        where: {
          groupId,
          status: { not: "COMPLETED" },
          dueDate: { lt: new Date() },
        },
      }),
      // Only the owner can invite, so only the owner is shown the outbox.
      isOwner
        ? db.groupInvitation.findMany({
            where: { groupId, status: "PENDING" },
            orderBy: { createdAt: "desc" },
            include: invitationInclude,
          })
        : Promise.resolve([]),
    ]);

    const detail: GroupDetail = {
      id: group.id,
      name: group.name,
      description: group.description,
      visibility: group.visibility,
      colorKey: group.colorKey,
      createdAt: group.createdAt.toISOString(),
      memberCount: group._count.members,
      taskCount: group._count.tasks,
      completedTaskCount: completed,
      activeTaskCount: active,
      overdueTaskCount: overdue,
      myRole: isOwner ? "OWNER" : "MEMBER",
      createdBy: toUserSummary(group.createdBy),
      members: group.members.slice(0, 6).map((m) => toUserSummary(m.user)),
      allMembers: group.members.map(toMember),
      pendingInvitations: pending.map(toInvitation),
    };

    return ok({ group: detail });
  },
);

export const PATCH = handler(
  async (request: NextRequest, ctx: RouteContext<"/api/groups/[groupId]">) => {
    const user = await requireUser();
    const { groupId } = await ctx.params;
    const membership = await requireMembership(groupId, user.id);
    if (membership.role !== "OWNER") {
      throw forbidden("Only the group owner can edit these settings.");
    }

    const input = await parseBody(request, updateGroupSchema);

    const group = await db.group.update({
      where: { id: groupId },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined
          ? { description: input.description || null }
          : {}),
        ...(input.visibility !== undefined
          ? { visibility: input.visibility }
          : {}),
        ...(input.colorKey !== undefined ? { colorKey: input.colorKey } : {}),
      },
    });

    return ok({ group: { id: group.id, name: group.name } });
  },
);

export const DELETE = handler(
  async (_request: NextRequest, ctx: RouteContext<"/api/groups/[groupId]">) => {
    const user = await requireUser();
    const { groupId } = await ctx.params;
    const membership = await requireMembership(groupId, user.id);
    if (membership.role !== "OWNER") {
      throw forbidden("Only the group owner can delete this group.");
    }

    await db.group.delete({ where: { id: groupId } });
    return ok({ success: true });
  },
);
