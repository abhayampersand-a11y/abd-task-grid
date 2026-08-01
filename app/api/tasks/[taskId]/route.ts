import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  badRequest,
  forbidden,
  handler,
  notFound,
  ok,
  parseBody,
  requireMembership,
  requireUser,
} from "@/lib/api";
import { notify, recordActivity } from "@/lib/events";
import {
  taskSummaryInclude,
  toActivity,
  toAttachment,
  toChecklistItem,
  toComment,
  toTaskSummary,
  userSummarySelect,
} from "@/lib/serialize";
import { updateTaskSchema } from "@/lib/validation";
import { STATUS_META } from "@/lib/utils";
import type { ActivityType, TaskDetail } from "@/lib/types";

const detailInclude = {
  ...taskSummaryInclude,
  comments: {
    orderBy: { createdAt: "asc" },
    include: { author: { select: userSummarySelect } },
  },
  attachments: {
    orderBy: { createdAt: "asc" },
    include: { uploadedBy: { select: userSummarySelect } },
  },
  activities: {
    orderBy: { createdAt: "desc" },
    take: 25,
    include: { actor: { select: userSummarySelect } },
  },
} as const;

async function loadTask(taskId: string, viewerId: string) {
  const task = await db.task.findUnique({
    where: { id: taskId },
    include: detailInclude,
  });
  if (!task) throw notFound("That task no longer exists.");
  await requireMembership(task.groupId, viewerId);
  return task;
}

function buildDetail(
  task: Awaited<ReturnType<typeof loadTask>>,
  viewerId: string,
  /** Full checklist rows — `taskSummaryInclude` only selects id/done. */
  checklist: Parameters<typeof toChecklistItem>[0][],
): TaskDetail {
  return {
    ...toTaskSummary(task),
    comments: task.comments.map(toComment),
    attachments: task.attachments.map(toAttachment),
    checklist: checklist.map(toChecklistItem),
    activities: task.activities.map(toActivity),
    viewerIsAssignee: task.assigneeId === viewerId,
    viewerIsCreator: task.createdById === viewerId,
  };
}

export const GET = handler(
  async (_request: NextRequest, ctx: RouteContext<"/api/tasks/[taskId]">) => {
    const user = await requireUser();
    const { taskId } = await ctx.params;

    // `checklist` in taskSummaryInclude selects only id/done — re-fetch labels.
    const [task, checklist] = await Promise.all([
      loadTask(taskId, user.id),
      db.checklistItem.findMany({
        where: { taskId },
        orderBy: { position: "asc" },
      }),
    ]);

    return ok({ task: buildDetail(task, user.id, checklist) });
  },
);

export const PATCH = handler(
  async (request: NextRequest, ctx: RouteContext<"/api/tasks/[taskId]">) => {
    const user = await requireUser();
    const { taskId } = await ctx.params;
    const input = await parseBody(request, updateTaskSchema);

    const existing = await db.task.findUnique({ where: { id: taskId } });
    if (!existing) throw notFound("That task no longer exists.");
    await requireMembership(existing.groupId, user.id);

    const isAssignee = existing.assigneeId === user.id;
    const isCreator = existing.createdById === user.id;

    // The assignee may report progress; only the creator may re-scope the task.
    const wantsOwnerOnlyChange =
      input.title !== undefined ||
      input.description !== undefined ||
      input.assigneeId !== undefined ||
      input.priority !== undefined ||
      input.dueDate !== undefined;

    if (wantsOwnerOnlyChange && !isCreator) {
      throw forbidden(
        "Only the person who assigned this task can change its details.",
      );
    }
    if (!isCreator && !isAssignee) {
      throw forbidden("You can only update tasks assigned to or by you.");
    }

    if (input.assigneeId) {
      const member = await db.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: existing.groupId,
            userId: input.assigneeId,
          },
        },
      });
      if (!member) {
        throw badRequest("That person is not a member of this group.", {
          assigneeId: ["That person is not a member of this group."],
        });
      }
    }

    let dueDate: Date | null | undefined;
    if (input.dueDate !== undefined) {
      if (input.dueDate === null || input.dueDate === "") {
        dueDate = null;
      } else {
        const parsed = new Date(input.dueDate);
        if (Number.isNaN(parsed.getTime())) {
          throw badRequest("Enter a valid due date.", {
            dueDate: ["Enter a valid due date."],
          });
        }
        dueDate = parsed;
      }
    }

    const completing =
      input.status === "COMPLETED" && existing.status !== "COMPLETED";
    const reopening =
      input.status !== undefined &&
      input.status !== "COMPLETED" &&
      existing.status === "COMPLETED";

    const task = await db.task.update({
      where: { id: taskId },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.description !== undefined
          ? { description: input.description || null }
          : {}),
        ...(input.assigneeId !== undefined
          ? { assigneeId: input.assigneeId }
          : {}),
        ...(input.priority !== undefined ? { priority: input.priority } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(dueDate !== undefined ? { dueDate } : {}),
        ...(input.progress !== undefined ? { progress: input.progress } : {}),
        ...(completing ? { progress: 100, completedAt: new Date() } : {}),
        ...(reopening ? { completedAt: null } : {}),
      },
      include: taskSummaryInclude,
    });

    // One activity entry per meaningful field change.
    const changes: { type: ActivityType; message: string }[] = [];
    if (input.status !== undefined && input.status !== existing.status) {
      changes.push({
        type: "STATUS_CHANGED",
        message: `Moved to ${STATUS_META[input.status].label}`,
      });
    }
    if (input.priority !== undefined && input.priority !== existing.priority) {
      changes.push({
        type: "PRIORITY_CHANGED",
        message: `Priority changed to ${input.priority.toLowerCase()}`,
      });
    }
    if (input.progress !== undefined && input.progress !== existing.progress) {
      changes.push({
        type: "PROGRESS_UPDATED",
        message: `Progress updated to ${input.progress}%`,
      });
    }
    if (input.assigneeId !== undefined && input.assigneeId !== existing.assigneeId) {
      changes.push({
        type: "ASSIGNEE_CHANGED",
        message: `Reassigned to ${task.assignee?.fullName ?? "nobody"}`,
      });
    }
    if (dueDate !== undefined) {
      changes.push({ type: "DUE_DATE_CHANGED", message: "Due date updated" });
    }
    if (input.title !== undefined || input.description !== undefined) {
      changes.push({
        type: "DESCRIPTION_UPDATED",
        message: "Task details updated",
      });
    }

    for (const change of changes) {
      await recordActivity({
        ...change,
        actorId: user.id,
        taskId: task.id,
        groupId: task.groupId,
      });
    }

    const audience = [existing.createdById, existing.assigneeId, task.assigneeId]
      .filter((id): id is string => Boolean(id));

    if (completing) {
      await notify({
        userIds: audience,
        type: "TASK_COMPLETED",
        title: "Task completed",
        body: `${user.fullName} completed "${task.title}".`,
        link: `/tasks/${task.id}`,
        exceptUserId: user.id,
      });
    } else if (
      input.assigneeId !== undefined &&
      input.assigneeId !== existing.assigneeId &&
      task.assigneeId
    ) {
      await notify({
        userIds: [task.assigneeId],
        type: "TASK_ASSIGNED",
        title: "Task reassigned to you",
        body: `${user.fullName} assigned you "${task.title}".`,
        link: `/tasks/${task.id}`,
        exceptUserId: user.id,
      });
    } else if (changes.length > 0) {
      await notify({
        userIds: audience,
        type: "TASK_UPDATED",
        title: "Task updated",
        body: `${user.fullName} updated "${task.title}".`,
        link: `/tasks/${task.id}`,
        exceptUserId: user.id,
      });
    }

    return ok({ task: toTaskSummary(task) });
  },
);

export const DELETE = handler(
  async (_request: NextRequest, ctx: RouteContext<"/api/tasks/[taskId]">) => {
    const user = await requireUser();
    const { taskId } = await ctx.params;

    const task = await db.task.findUnique({ where: { id: taskId } });
    if (!task) return ok({ success: true });

    const membership = await requireMembership(task.groupId, user.id);
    if (task.createdById !== user.id && membership.role !== "OWNER") {
      throw forbidden(
        "Only the person who created this task, or the group owner, can delete it.",
      );
    }

    await db.task.delete({ where: { id: taskId } });
    return ok({ success: true });
  },
);
