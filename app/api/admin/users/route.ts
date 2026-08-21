import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { handler, ok, requireAdmin } from "@/lib/api";
import { cached } from "@/lib/cache";
import type { AdminUserRow, Paginated, UserStatus } from "@/lib/types";
import type { Prisma } from "@/generated/prisma/client";

const PAGE_SIZE = 8;

/**
 * The three status totals are the same for every page, every sort and every
 * search term, and they are whole-table counts — the expensive kind. One
 * grouped query answers all three, and the answer is shared for CACHE_MS so
 * paging through the table does not re-count the table on every click.
 */
const TOTALS_CACHE_MS = 30_000;

function userStatusTotals() {
  return cached("admin:user-status-totals", TOTALS_CACHE_MS, async () => {
    const rows = await db.user.groupBy({
      by: ["status"],
      where: { role: "USER" },
      _count: { _all: true },
    });
    const count = (status: UserStatus) =>
      rows.find((row) => row.status === status)?._count._all ?? 0;

    const active = count("ACTIVE");
    const disabled = count("DISABLED");
    const pending = count("PENDING");
    return { all: active + disabled + pending, active, disabled, pending };
  });
}

export const GET = handler(async (request: NextRequest) => {
  await requireAdmin();
  const params = request.nextUrl.searchParams;

  const q = params.get("q")?.trim();
  const status = params.get("status");
  const sort = params.get("sort") ?? "newest";
  const page = Math.max(1, Number(params.get("page") ?? 1) || 1);

  const where: Prisma.UserWhereInput = {
    role: "USER",
    ...(status && status !== "ALL" ? { status: status as UserStatus } : {}),
    ...(q
      ? {
          OR: [
            { fullName: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { mobile: { contains: q } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.UserOrderByWithRelationInput =
    sort === "name"
      ? { fullName: "asc" }
      : sort === "oldest"
        ? { createdAt: "asc" }
        : { createdAt: "desc" };

  const [total, users, totals] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        _count: { select: { memberships: true, tasksAssigned: true } },
      },
    }),
    userStatusTotals(),
  ]);

  const items: AdminUserRow[] = users.map((user) => ({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    mobile: user.mobile,
    avatarUrl: user.avatarUrl,
    jobTitle: user.jobTitle,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
    groupCount: user._count.memberships,
    taskCount: user._count.tasksAssigned,
  }));

  const payload: Paginated<AdminUserRow> & {
    totals: { all: number; active: number; disabled: number; pending: number };
  } = {
    items,
    page,
    pageSize: PAGE_SIZE,
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    totals,
  };

  return ok(payload);
});
