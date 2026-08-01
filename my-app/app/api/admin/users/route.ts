import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { handler, ok, requireAdmin } from "@/lib/api";
import type { AdminUserRow, Paginated, UserStatus } from "@/lib/types";
import type { Prisma } from "@/generated/prisma/client";

const PAGE_SIZE = 8;

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

  const [total, users, active, disabled, pending] = await Promise.all([
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
    db.user.count({ where: { role: "USER", status: "ACTIVE" } }),
    db.user.count({ where: { role: "USER", status: "DISABLED" } }),
    db.user.count({ where: { role: "USER", status: "PENDING" } }),
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
    totals: { all: active + disabled + pending, active, disabled, pending },
  };

  return ok(payload);
});
