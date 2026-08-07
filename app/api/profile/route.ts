import { db } from "@/lib/db";
import { badRequest, handler, ok, parseBody, requireUser } from "@/lib/api";
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

  const updated = await db.user.update({
    where: { id: user.id },
    data: {
      fullName: input.fullName,
      jobTitle: input.jobTitle || null,
      mobile,
      bio: input.bio || null,
      ...(input.avatarUrl !== undefined
        ? { avatarUrl: input.avatarUrl || null }
        : {}),
    },
  });

  return ok({ user: toCurrentUser(updated) });
});
