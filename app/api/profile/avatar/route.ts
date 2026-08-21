import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { handler, ok, requireUser } from "@/lib/api";
import { readImageUpload } from "@/lib/image-upload";
import { deleteObjectQuietly, putObject } from "@/lib/r2";
import { toCurrentUser } from "@/lib/serialize";

export const POST = handler(async (request: Request) => {
  const user = await requireUser();
  const image = await readImageUpload(request, "Pictures");

  // A fresh key every time. Overwriting one stable key per user would spare us
  // the delete below, but then every CDN edge and every phone that already
  // cached the old picture would keep serving it.
  const key = `avatars/${user.id}/${randomUUID()}.${image.extension}`;
  const url = await putObject(key, image.bytes, image.contentType);

  let updated;
  try {
    updated = await db.user.update({
      where: { id: user.id },
      data: { avatarUrl: url, avatarKey: key },
    });
  } catch (error) {
    // The object is already in the bucket but no row will ever point at it, so
    // nothing would come back to clean it up. Undo the upload before rethrowing.
    await deleteObjectQuietly(key);
    throw error;
  }

  // Only once the new picture is safely the stored one. Reversing these would
  // risk deleting the old file and then failing to record the new one, which
  // leaves the account pointing at nothing.
  await deleteObjectQuietly(user.avatarKey);

  return ok({ user: toCurrentUser(updated) });
});

export const DELETE = handler(async () => {
  const user = await requireUser();

  const updated = await db.user.update({
    where: { id: user.id },
    data: { avatarUrl: null, avatarKey: null },
  });
  await deleteObjectQuietly(user.avatarKey);

  return ok({ user: toCurrentUser(updated) });
});
