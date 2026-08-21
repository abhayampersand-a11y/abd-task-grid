import { db } from "@/lib/db";
import {
  badRequest,
  forbidden,
  handler,
  ok,
  parseBody,
  requireUser,
} from "@/lib/api";
import { verifyPassword } from "@/lib/password";
import { deleteObjectQuietly, keyFromPublicUrl } from "@/lib/r2";
import { toCurrentUser } from "@/lib/serialize";
import { destroySessionCookie } from "@/lib/session";
import { deleteAccountSchema, updateProfileSchema } from "@/lib/validation";

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

/**
 * Self-service account deletion — the path Google Play requires an app that
 * creates accounts to offer, and the one `/privacy#delete-account` points at.
 *
 * Everything owned by the row goes with it: `onDelete: Cascade` in the schema
 * takes the OAuth links, memberships, invitations, comments, attachments,
 * activity, notifications and push tokens, plus the groups this user created
 * and every task inside them. Tasks assigned to them but created by somebody
 * else are `SetNull` instead, so a teammate's board does not lose work in
 * progress — it just goes unassigned.
 */
export const DELETE = handler(async (request: Request) => {
  const user = await requireUser();

  // The administrator account is how the service is operated: losing it would
  // leave nobody able to manage users. Removing it is a deliberate act from
  // another admin, not a self-service one.
  if (user.role === "ADMIN") {
    throw forbidden(
      "An administrator account cannot be deleted from here. Ask another administrator to remove it.",
    );
  }

  const input = await parseBody(request, deleteAccountSchema);

  // A live session is not proof enough for something irreversible — an
  // unattended phone would be. Re-confirm with a secret only the owner has;
  // a social-only account has no password, so it retypes its own email.
  if (user.passwordHash) {
    const matches = input.password
      ? await verifyPassword(input.password, user.passwordHash)
      : false;
    if (!matches) {
      throw badRequest("That password is not correct.", {
        password: ["That password is not correct."],
      });
    }
  } else if (
    input.confirmEmail?.toLowerCase() !== user.email.toLowerCase()
  ) {
    throw badRequest("Type your email address exactly as it appears.", {
      confirmEmail: ["Type your email address exactly as it appears."],
    });
  }

  // Read the storage keys while the rows still exist. Attachments keep only a
  // URL, so the key is recovered from it; anything not served from our bucket
  // comes back null and is skipped.
  const [ownedGroups, doomedAttachments] = await Promise.all([
    db.group.findMany({
      where: { createdById: user.id },
      select: { iconKey: true },
    }),
    db.taskAttachment.findMany({
      where: {
        OR: [
          { uploadedById: user.id },
          { task: { createdById: user.id } },
          { task: { group: { createdById: user.id } } },
        ],
      },
      select: { url: true },
    }),
  ]);

  await db.user.delete({ where: { id: user.id } });
  await destroySessionCookie();

  // After the delete and best-effort on purpose: a bucket we cannot reach must
  // never turn a completed deletion into an error the user reads as "failed".
  // The worst case is an orphaned object under a key nothing references.
  const orphans = [
    user.avatarKey,
    ...ownedGroups.map((group) => group.iconKey),
    ...doomedAttachments.map((attachment) => keyFromPublicUrl(attachment.url)),
  ];
  await Promise.all(orphans.map(deleteObjectQuietly));

  return ok({ success: true });
});
