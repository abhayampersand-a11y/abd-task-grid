import { db } from "@/lib/db";
import { badRequest, handler, ok, parseBody, requireUser } from "@/lib/api";
import { deleteObjectQuietly } from "@/lib/r2";
import { toCurrentUser } from "@/lib/serialize";
import { updateProfileSchema } from "@/lib/validation";

export const PATCH = handler(async (request: Request) => {
  const user = await requireUser();
  const input = await parseBody(request, updateProfileSchema);
  // An empty field clears the number rather than storing "", which would
  // collide with every other cleared account on the unique index.
  const mobile = input.mobile?.replace(/\s+/g, " ").trim() || null;

  if (mobile && mobile !== user.mobile) {
    const clash = await db.user.findFirst({
      where: { mobile, id: { not: user.id } },
      select: { id: true },
    });
    if (clash) {
      throw badRequest("That mobile number is already in use.", {
        mobile: ["That mobile number is already in use."],
      });
    }
  }

  // This route can still set the URL by hand (the web form takes a pasted
  // link, and clearing it removes the photo). When it points somewhere new,
  // the file we were hosting for this account is orphaned — drop the key here
  // and the object itself once the row is saved.
  const avatarUrl = input.avatarUrl !== undefined ? input.avatarUrl || null : undefined;
  const orphanedKey =
    avatarUrl !== undefined && avatarUrl !== user.avatarUrl
      ? user.avatarKey
      : null;

  const updated = await db.user.update({
    where: { id: user.id },
    data: {
      fullName: input.fullName,
      jobTitle: input.jobTitle || null,
      mobile,
      bio: input.bio || null,
      ...(avatarUrl !== undefined ? { avatarUrl } : {}),
      ...(orphanedKey ? { avatarKey: null } : {}),
    },
  });

  await deleteObjectQuietly(orphanedKey);

  return ok({ user: toCurrentUser(updated) });
});
