import { handler, ok } from "@/lib/api";
import { destroySessionCookie } from "@/lib/session";

export const POST = handler(async () => {
  await destroySessionCookie();
  return ok({ success: true });
});
