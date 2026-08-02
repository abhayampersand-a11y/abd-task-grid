import { db } from "@/lib/db";
import { handler, ok, requireUser } from "@/lib/api";
import { invitationInclude, toInvitation } from "@/lib/serialize";

/** Join requests waiting on the signed-in user — the Requests page. */
export const GET = handler(async () => {
  const user = await requireUser();

  const invitations = await db.groupInvitation.findMany({
    where: { inviteeId: user.id, status: "PENDING" },
    orderBy: { createdAt: "desc" },
    include: invitationInclude,
  });

  return ok({
    invitations: invitations.map(toInvitation),
    pendingCount: invitations.length,
  });
});
