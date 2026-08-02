import { db } from "@/lib/db";
import { handler, ok, parseBody, requireUser } from "@/lib/api";
import { notify, recordActivity } from "@/lib/events";
import { listGroupsForUser } from "@/lib/queries";
import { createGroupSchema } from "@/lib/validation";

export const GET = handler(async () => {
  const user = await requireUser();
  return ok({ groups: await listGroupsForUser(user.id) });
});

export const POST = handler(async (request: Request) => {
  const user = await requireUser();
  const input = await parseBody(request, createGroupSchema);

  // The creator is the only member at creation time. Everybody else is invited
  // and joins only once they accept from their Requests page.
  const inviteeIds = [...new Set(input.memberIds.filter((id) => id !== user.id))];

  const valid = await db.user.findMany({
    where: { id: { in: inviteeIds }, status: { not: "DISABLED" }, role: "USER" },
    select: { id: true },
  });

  const group = await db.group.create({
    data: {
      name: input.name,
      description: input.description || null,
      visibility: input.visibility,
      colorKey: input.colorKey,
      createdById: user.id,
      members: { create: [{ userId: user.id, role: "OWNER" }] },
      invitations: {
        create: valid.map((invitee) => ({
          inviteeId: invitee.id,
          invitedById: user.id,
        })),
      },
    },
  });

  await recordActivity({
    type: "GROUP_CREATED",
    message: `${user.fullName} created the group`,
    actorId: user.id,
    groupId: group.id,
  });

  await notify({
    userIds: valid.map((invitee) => invitee.id),
    type: "GROUP_INVITATION",
    title: "Group invitation",
    body: `${user.fullName} created "${group.name}" and asked you to join.`,
    link: "/requests",
    exceptUserId: user.id,
  });

  return ok(
    { group: { id: group.id, name: group.name }, invited: valid.length },
    201,
  );
});
