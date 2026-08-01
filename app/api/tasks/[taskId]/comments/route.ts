import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  handler,
  notFound,
  ok,
  parseBody,
  requireMembership,
  requireUser,
} from "@/lib/api";
import { notify, recordActivity } from "@/lib/events";
import { toComment, userSummarySelect } from "@/lib/serialize";
import { commentSchema } from "@/lib/validation";

export const POST = handler(
  async (
    request: NextRequest,
    ctx: RouteContext<"/api/tasks/[taskId]/comments">,
  ) => {
    const user = await requireUser();
    const { taskId } = await ctx.params;
    const { body } = await parseBody(request, commentSchema);

    const task = await db.task.findUnique({ where: { id: taskId } });
    if (!task) throw notFound("That task no longer exists.");
    await requireMembership(task.groupId, user.id);

    const comment = await db.taskComment.create({
      data: { taskId, authorId: user.id, body },
      include: { author: { select: userSummarySelect } },
    });

    await recordActivity({
      type: "COMMENT_ADDED",
      message: `${user.fullName} commented`,
      actorId: user.id,
      taskId,
      groupId: task.groupId,
    });

    await notify({
      userIds: [task.createdById, task.assigneeId].filter(
        (id): id is string => Boolean(id),
      ),
      type: "NEW_COMMENT",
      title: "New comment",
      body: `${user.fullName} commented on "${task.title}".`,
      link: `/tasks/${taskId}`,
      exceptUserId: user.id,
    });

    return ok({ comment: toComment(comment) }, 201);
  },
);
