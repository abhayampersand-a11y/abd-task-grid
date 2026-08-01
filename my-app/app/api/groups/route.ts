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

  // The creator is always a member, regardless of what the client sent.
  const memberIds = [...new Set(input.memberIds.filter((id) => id !== user.id))];

  const valid = await db.user.findMany({
    where: { id: { in: memberIds }, status: { not: "DISABLED" }, role: "USER" },
    select: { id: true },
  });

  const group = await db.group.create({
    data: {
      name: input.name,
      description: input.description || null,
      visibility: input.visibility,
      colorKey: input.colorKey,
      createdById: user.id,
      members: {
        create: [
          { userId: user.id, role: "OWNER" },
          ...valid.map((member) => ({ userId: member.id })),
        ],
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
    userIds: valid.map((member) => member.id),
    type: "GROUP_INVITATION",
    title: "Added to a group",
    body: `${user.fullName} added you to "${group.name}".`,
    link: `/groups/${group.id}`,
    exceptUserId: user.id,
  });

  return ok({ group: { id: group.id, name: group.name } }, 201);
});
