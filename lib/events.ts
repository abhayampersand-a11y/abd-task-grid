import "server-only";

import { after } from "next/server";
import { db } from "./db";
import { sendPush } from "./push";
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

  // The row above is what the in-app list reads; this is the copy that reaches
  // a phone whose owner does not have the app open. It runs *after* the
  // response is flushed so nobody waits on exp.host to see their task save —
  // still inside the same serverless invocation, so the work is not frozen.
  const push = () =>
    sendPush({
      userIds: recipients,
      type: input.type,
      title: input.title,
      body: input.body,
      link: input.link ?? null,
    });

  try {
    after(push);
  } catch {
    // `after` needs a request scope. Anything calling `notify` outside one (a
    // script, a test) still gets its push, just inline.
    await push();
  }
}
