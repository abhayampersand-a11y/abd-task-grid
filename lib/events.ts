import "server-only";

import { db } from "./db";
import type { ActivityType, NotificationType } from "./types";

interface ActivityInput {
  type: ActivityType;
  message: string;
  actorId: string;
  taskId?: string | null;
  groupId?: string | null;
}

export function recordActivity(input: ActivityInput) {
  return db.activity.create({
    data: {
      type: input.type,
      message: input.message,
      actorId: input.actorId,
      taskId: input.taskId ?? null,
      groupId: input.groupId ?? null,
    },
  });
}

interface NotifyInput {
  userIds: string[];
  type: NotificationType;
  title: string;
  body: string;
  link?: string | null;
  /** The actor never gets notified about their own action. */
  exceptUserId?: string;
}

export async function notify(input: NotifyInput) {
  const recipients = [...new Set(input.userIds)].filter(
    (id) => id && id !== input.exceptUserId,
  );
  if (recipients.length === 0) return;

  await db.notification.createMany({
    data: recipients.map((userId) => ({
      userId,
      type: input.type,
      title: input.title,
      body: input.body,
      link: input.link ?? null,
    })),
  });
}
