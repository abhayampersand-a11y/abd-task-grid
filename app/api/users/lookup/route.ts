import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { handler, ok, requireUser } from "@/lib/api";
import { toUserSummary, userSummarySelect } from "@/lib/serialize";
import type { InviteeState, LookupResult } from "@/lib/types";

/**
 * Exact-email lookup for the invite box. There is deliberately no partial
 * matching here: the directory is not browsable, so you can only reach somebody
 * whose address you already know.
 *
 * `groupId` is optional — pass it to learn whether the person is already in
 * that group or already holds a pending invitation.
 */
export const GET = handler(async (request: NextRequest) => {
  const viewer = await requireUser();

  const email = request.nextUrl.searchParams.get("email")?.trim().toLowerCase();
  const groupId = request.nextUrl.searchParams.get("groupId")?.trim();

  const empty: LookupResult = { user: null, state: null };
  if (!email) return ok(empty);

  const match = await db.user.findUnique({
    where: { email },
    select: { ...userSummarySelect, role: true, status: true },
  });

  // Admins are not group members, and disabled accounts cannot be invited.
  // Both look the same as "no such user" so the box never leaks who exists.
  if (!match || match.role !== "USER" || match.status === "DISABLED") {
    return ok(empty);
  }

  let state: InviteeState = "AVAILABLE";

  if (match.id === viewer.id) {
    state = "SELF";
  } else if (groupId) {
    const [membership, invitation] = await Promise.all([
      db.groupMember.findUnique({
        where: { groupId_userId: { groupId, userId: match.id } },
        select: { id: true },
      }),
      db.groupInvitation.findUnique({
        where: { groupId_inviteeId: { groupId, inviteeId: match.id } },
        select: { status: true },
      }),
    ]);

    if (membership) state = "MEMBER";
    else if (invitation?.status === "PENDING") state = "INVITED";
  }

  const result: LookupResult = { user: toUserSummary(match), state };
  return ok(result);
});
