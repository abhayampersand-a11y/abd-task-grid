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
import { toChecklistItem } from "@/lib/serialize";
import { checklistToggleSchema } from "@/lib/validation";

export const PATCH = handler(
  async (
    request: NextRequest,
    ctx: RouteContext<"/api/tasks/[taskId]/checklist/[itemId]">,
  ) => {
    const user = await requireUser();
    const { taskId, itemId } = await ctx.params;
    const { done } = await parseBody(request, checklistToggleSchema);

    const task = await db.task.findUnique({
      where: { id: taskId },
      select: { groupId: true },
    });
    if (!task) throw notFound("That task no longer exists.");
    await requireMembership(task.groupId, user.id);

    const item = await db.checklistItem.update({
      where: { id: itemId },
      data: { done },
    });

    // Keep the headline progress bar in step with the checklist.
    const items = await db.checklistItem.findMany({ where: { taskId } });
    if (items.length > 0) {
      const percent = Math.round(
        (items.filter((i) => i.done).length / items.length) * 100,
      );
      await db.task.update({
        where: { id: taskId },
        data: { progress: percent },
      });
    }

    return ok({ item: toChecklistItem(item) });
  },
);
