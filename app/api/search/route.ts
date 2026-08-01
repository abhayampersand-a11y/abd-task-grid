import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { handler, ok, requireUser } from "@/lib/api";
import { toUserSummary, userSummarySelect } from "@/lib/serialize";
import type { SearchResults } from "@/lib/types";

/** Global search across the groups the viewer belongs to. */
export const GET = handler(async (request: NextRequest) => {
  const user = await requireUser();
  const q = request.nextUrl.searchParams.get("q")?.trim();

  const empty: SearchResults = { groups: [], tasks: [], members: [] };
  if (!q || q.length < 2) return ok(empty);

  const myGroups = { members: { some: { userId: user.id } } };

  const [groups, tasks, members] = await Promise.all([
    db.group.findMany({
      where: {
        ...myGroups,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, description: true },
      take: 5,
    }),
    db.task.findMany({
      where: {
        group: myGroups,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        title: true,
        status: true,
        group: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    db.user.findMany({
      where: {
        memberships: { some: { group: myGroups } },
        id: { not: user.id },
        OR: [
          { fullName: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      select: userSummarySelect,
      take: 5,
    }),
  ]);

  const results: SearchResults = {
    groups,
    tasks: tasks.map((task) => ({
      id: task.id,
      title: task.title,
      status: task.status,
      groupName: task.group.name,
    })),
    members: members.map(toUserSummary),
  };

  return ok(results);
});
