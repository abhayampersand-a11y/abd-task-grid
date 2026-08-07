import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { badRequest, handler, ok, requireUser } from "@/lib/api";
import { deleteObjectQuietly, putObject } from "@/lib/r2";
import { toCurrentUser } from "@/lib/serialize";

/** Only formats every browser and both mobile platforms render natively. */
const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

/**
 * Generous for a picture the client already downscales, but small enough that
 * the request stays under the 4.5 MB body limit of a Vercel function.
 */
const MAX_BYTES = 4 * 1024 * 1024;

export const POST = handler(async (request: Request) => {
  const user = await requireUser();

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    throw badRequest("Upload the image as multipart form data.");
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    throw badRequest("No image was attached.");
  }

  const extension = ALLOWED.get(file.type);
  if (!extension) {
    throw badRequest("Pictures must be a JPEG, PNG or WebP image.");
  }
  if (file.size === 0) throw badRequest("That image file is empty.");
  if (file.size > MAX_BYTES) {
    throw badRequest("Pictures must be smaller than 4 MB.");
  }

  // A fresh key every time. Overwriting one stable key per user would spare us
  // the delete below, but then every CDN edge and every phone that already
  // cached the old picture would keep serving it.
  const key = `avatars/${user.id}/${randomUUID()}.${extension}`;
  const url = await putObject(
    key,
    new Uint8Array(await file.arrayBuffer()),
    file.type,
  );

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
