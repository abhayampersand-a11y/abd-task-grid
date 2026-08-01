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
import { taskSummaryInclude, toTaskSummary } from "@/lib/serialize";
import { createTaskSchema } from "@/lib/validation";
import type { Prisma } from "@/generated/prisma/client";
import type { TaskPriority, TaskStatus } from "@/generated/prisma/enums";

/**
 * GET /api/tasks
 *   scope=assigned-to-me | assigned-by-me   (default: assigned-to-me)
 *   groupId, status, priority, assignedBy, assigneeId, q, sort
 */
export const GET = handler(async (request: NextRequest) => {
  const user = await requireUser();
  const params = request.nextUrl.searchParams;

  const scope = params.get("scope") ?? "assigned-to-me";
  const groupId = params.get("groupId");
  const status = params.get("status");
  const priority = params.get("priority");
  const assignedBy = params.get("assignedBy");
  const assigneeId = params.get("assigneeId");
  const q = params.get("q")?.trim();
  const sort = params.get("sort") ?? "newest";

  if (groupId) await requireMembership(groupId, user.id);

  const where: Prisma.TaskWhereInput = {
    // Never leak tasks from groups the viewer isn't in.
    group: { members: { some: { userId: user.id } } },
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
    where.createdById = user.id;
    where.NOT = { assigneeId: user.id };
  } else if (scope === "assigned-to-me") {
    where.assigneeId = user.id;
  }

  const orderBy: Prisma.TaskOrderByWithRelationInput[] =
    sort === "due-soon"
      ? [{ dueDate: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }]
      : sort === "priority"
        ? [{ priority: "desc" }, { createdAt: "desc" }]
        : sort === "oldest"
          ? [{ createdAt: "asc" }]
          : [{ createdAt: "desc" }];

  const tasks = await db.task.findMany({
    where,
    orderBy,
    include: taskSummaryInclude,
    take: 200,
  });

  return ok({ tasks: tasks.map(toTaskSummary) });
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
