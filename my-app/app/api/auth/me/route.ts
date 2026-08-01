import { handler, ok, requireUser } from "@/lib/api";
import { toCurrentUser } from "@/lib/serialize";

export const GET = handler(async () => {
  const user = await requireUser();
  return ok({ user: toCurrentUser(user) });
});
