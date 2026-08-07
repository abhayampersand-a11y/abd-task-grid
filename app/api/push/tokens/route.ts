import { db } from "@/lib/db";
import { badRequest, handler, ok, parseBody, requireUser } from "@/lib/api";
import { pushTokenSchema } from "@/lib/validation";

/**
 * Registers this device for push, or moves it to the signed-in user.
 *
 * The app calls this on every launch, not only the first: Expo tokens can be
 * rotated by the OS, and the same handset can change hands between accounts.
 * Upserting on the token keeps exactly one row per device either way.
 */
export const POST = handler(async (request: Request) => {
  const user = await requireUser();
  const input = await parseBody(request, pushTokenSchema);

  await db.pushToken.upsert({
    where: { token: input.token },
    create: {
      token: input.token,
      userId: user.id,
      platform: input.platform,
      deviceName: input.deviceName ?? null,
    },
    update: {
      userId: user.id,
      platform: input.platform,
      deviceName: input.deviceName ?? null,
      lastUsedAt: new Date(),
    },
  });

  return ok({ success: true }, 201);
});

/**
 * Drops the device on sign-out, so the next person to use the phone — or nobody
 * at all — stops receiving this account's alerts.
 *
 * Scoped to the caller's own rows: knowing a token must not be enough to
 * unregister somebody else's handset.
 */
export const DELETE = handler(async (request: Request) => {
  const user = await requireUser();
  const token = new URL(request.url).searchParams.get("token");
  if (!token) throw badRequest("A push token is required.");

  await db.pushToken.deleteMany({ where: { token, userId: user.id } });

  return ok({ success: true });
});
