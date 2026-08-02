import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  badRequest,
  handler,
  ok,
  parseBody,
  requireMembership,
  requireUser,
} from "@/lib/api";
import { notify, recordActivity } from "@/lib/events";
import { endOfToday, endOfWeek, startOfToday } from "@/lib/queries";
import { taskSummaryInclude, toTaskSummary } from "@/lib/serialize";
import { createTaskSchema } from "@/lib/validation";
import type { Prisma } from "@/generated/prisma/client";
import type { TaskPriority, TaskStatus } from "@/generated/prisma/enums";

/** Shared by GET /api/tasks and GET /api/tasks/stats so both agree on scope. */
export function buildTaskWhere(
  params: URLSearchParams,
  userId: string,
): Prisma.TaskWhereInput {
  const scope = params.get("scope") ?? "assigned-to-me";
  const groupId = params.get("groupId");
  const status = params.get("status");
  const priority = params.get("priority");
  const assignedBy = params.get("assignedBy");
  const assigneeId = params.get("assigneeId");
  const due = params.get("due");
  const q = params.get("q")?.trim();

  const where: Prisma.TaskWhereInput = {
    // Never leak tasks from groups the viewer isn't in.
    group: { members: { some: { userId } } },
    ...(groupId ? { groupId } : {}),
    ...(status ? { status: status as TaskStatus } : {}),
    ...(priority ? { priority: priority as TaskPriority } : {}),
    ...(assignedBy ? { createdById: assignedBy } : {}),
    ...(assigneeId ? { assigneeId } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  if (scope === "assigned-by-me") {
    where.createdById = userId;
    where.NOT = { assigneeId: userId };
  } else if (scope === "assigned-to-me") {
    where.assigneeId = userId;
  }
  // Any other scope (e.g. "all") leaves the viewer's group membership as the
  // only boundary, which is what the dashboard table wants.

  if (due === "overdue") {
    where.status = { not: "COMPLETED" };
    where.dueDate = { lt: new Date() };
  } else if (due === "today") {
    where.dueDate = { gte: startOfToday(), lte: endOfToday() };
  } else if (due === "week") {
    where.dueDate = { gte: startOfToday(), lte: endOfWeek() };
  } else if (due === "none") {
    where.dueDate = null;
  }

  return where;
}

/**
 * GET /api/tasks
 *   scope=assigned-to-me | assigned-by-me | all   (default: assigned-to-me)
 *   groupId, status, priority, assignedBy, assigneeId, due, q, sort
 *   page, pageSize   (omit pageSize for the un-paginated list)
 */
export const GET = handler(async (request: NextRequest) => {
  const user = await requireUser();
  const params = request.nextUrl.searchParams;

  const groupId = params.get("groupId");
  if (groupId) await requireMembership(groupId, user.id);

  const where = buildTaskWhere(params, user.id);
  const sort = params.get("sort") ?? "newest";

  const orderBy: Prisma.TaskOrderByWithRelationInput[] =
    sort === "due-soon"
      ? [{ dueDate: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }]
      : sort === "priority"
        ? [{ priority: "desc" }, { createdAt: "desc" }]
        : sort === "oldest"
          ? [{ createdAt: "asc" }]
          : [{ createdAt: "desc" }];

  const page = Math.max(1, Number(params.get("page") ?? 1) || 1);
  const rawPageSize = Number(params.get("pageSize") ?? 0);
  const pageSize =
    Number.isFinite(rawPageSize) && rawPageSize > 0
      ? Math.min(50, Math.floor(rawPageSize))
      : null;

  // Always pass concrete skip/take — a conditional spread breaks Prisma's
  // overload resolution for `findMany`.
  const skip = pageSize ? (page - 1) * pageSize : 0;
  const take = pageSize ?? 200;

  const [total, tasks] = await Promise.all([
    db.task.count({ where }),
    db.task.findMany({
      where,
      orderBy,
      include: taskSummaryInclude,
      skip,
      take,
    }),
  ]);

  return ok({
    tasks: tasks.map(toTaskSummary),
    total,
    page,
    pageSize: pageSize ?? tasks.length,
    totalPages: pageSize ? Math.max(1, Math.ceil(total / pageSize)) : 1,
  });
});

export const POST = handler(async (request: Request) => {
  const user = await requireUser();
  const input = await parseBody(request, createTaskSchema);

  await requireMembership(input.groupId, user.id);

  const assigneeMembership = await db.groupMember.findUnique({
    where: {
      groupId_userId: { groupId: input.groupId, userId: input.assigneeId },
    },
  });
  if (!assigneeMembership) {
    throw badRequest("You can only assign tasks to members of this group.", {
      assigneeId: ["That person is not a member of this group."],
    });
  }

  let dueDate: Date | null = null;
  if (input.dueDate) {
    const parsed = new Date(input.dueDate);
    if (Number.isNaN(parsed.getTime())) {
      throw badRequest("Enter a valid due date.", {
        dueDate: ["Enter a valid due date."],
      });
    }
    dueDate = parsed;
  }

  const task = await db.task.create({
    data: {
      groupId: input.groupId,
      title: input.title,
      description: input.description || null,
      priority: input.priority,
      status: input.status,
      dueDate,
      createdById: user.id,
      assigneeId: input.assigneeId,
      checklist: {
        create: input.checklist.map((label, position) => ({ label, position })),
      },
      attachments: {
        create: input.attachments.map((file) => ({
          name: file.name,
          url: file.url,
          sizeBytes: file.sizeBytes,
          mimeType: file.mimeType,
          uploadedById: user.id,
        })),
      },
    },
    include: taskSummaryInclude,
  });

  await recordActivity({
    type: "TASK_CREATED",
    message: `${user.fullName} created this task`,
    actorId: user.id,
    taskId: task.id,
    groupId: task.groupId,
  });

  await notify({
    userIds: [input.assigneeId],
    type: "TASK_ASSIGNED",
    title: "New task assigned",
    body: `${user.fullName} assigned you "${task.title}".`,
    link: `/tasks/${task.id}`,
    exceptUserId: user.id,
  });

  return ok({ task: toTaskSummary(task) }, 201);
});
