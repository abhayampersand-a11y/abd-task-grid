import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  forbidden,
  handler,
  notFound,
  ok,
  requireMembership,
  requireUser,
} from "@/lib/api";
import { readImageUpload } from "@/lib/image-upload";
import { deleteObjectQuietly, putObject } from "@/lib/r2";

/**
 * The group's picture, changed exactly the way a profile picture is: the file
 * is posted here, the server checks it and stores it, and the row is the only
 * thing that decides what everybody sees.
 *
 * Owner-only. Every member reads the icon on their cards, but a group's face
 * is a group-wide edit, in the same bracket as renaming or deleting it.
 */
async function requireOwnedGroup(groupId: string) {
  const user = await requireUser();
  const membership = await requireMembership(groupId, user.id);
  if (membership.role !== "OWNER") {
    throw forbidden("Only the group owner can change the group icon.");
  }

  const group = await db.group.findUnique({
    where: { id: groupId },
    select: { id: true, iconKey: true },
  });
  if (!group) throw notFound("That group no longer exists.");

  return group;
}

export const POST = handler(
  async (
    request: NextRequest,
    ctx: RouteContext<"/api/groups/[groupId]/icon">,
  ) => {
    const { groupId } = await ctx.params;
    const group = await requireOwnedGroup(groupId);
    const image = await readImageUpload(request, "Group icons");

    // A fresh key every time, so no CDN edge or phone keeps serving the icon
    // this one replaces. See the same note on the avatar route.
    const key = `group-icons/${groupId}/${randomUUID()}.${image.extension}`;
    const url = await putObject(key, image.bytes, image.contentType);

    let updated;
    try {
      updated = await db.group.update({
        where: { id: groupId },
        data: { iconUrl: url, iconKey: key },
      });
    } catch (error) {
      // Nothing points at the object yet, so nothing would ever clean it up.
      await deleteObjectQuietly(key);
      throw error;
    }

    // Only once the new icon is safely the stored one.
    await deleteObjectQuietly(group.iconKey);

    return ok({
      group: { id: updated.id, name: updated.name, iconUrl: updated.iconUrl },
    });
  },
);

export const DELETE = handler(
  async (
    _request: NextRequest,
    ctx: RouteContext<"/api/groups/[groupId]/icon">,
  ) => {
    const { groupId } = await ctx.params;
    const group = await requireOwnedGroup(groupId);

    const updated = await db.group.update({
      where: { id: groupId },
      data: { iconUrl: null, iconKey: null },
    });
    await deleteObjectQuietly(group.iconKey);

    return ok({
      group: { id: updated.id, name: updated.name, iconUrl: updated.iconUrl },
    });
  },
);
