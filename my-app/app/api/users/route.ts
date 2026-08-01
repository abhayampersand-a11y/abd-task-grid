import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { handler, ok, requireUser } from "@/lib/api";
import { toUserSummary, userSummarySelect } from "@/lib/serialize";

/** The member directory used when building a group. Admins are not selectable. */
export const GET = handler(async (request: NextRequest) => {
  await requireUser();
  const q = request.nextUrl.searchParams.get("q")?.trim();

  const users = await db.user.findMany({
    where: {
      role: "USER",
      status: { not: "DISABLED" },
      ...(q
        ? {
            OR: [
              { fullName: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { jobTitle: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { fullName: "asc" },
    select: userSummarySelect,
    take: 100,
  });

  return ok({ users: users.map(toUserSummary) });
});
