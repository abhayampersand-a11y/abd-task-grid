import "server-only";

import { db } from "./db";
import type { NotificationType } from "./types";

/**
 * Delivery to the phone's notification tray, via Expo's push service.
 *
 * Expo brokers both APNs and FCM, so nothing here needs provider credentials:
 * the Expo project that built the app owns them, and a token of the form
 * `ExponentPushToken[…]` is all we address. That is also why this file talks to
 * exp.host over plain `fetch` rather than pulling in a server SDK.
 *
 * Everything is best-effort. A push that fails is a push the user misses — it is
 * never a reason to fail the request that produced it, because the row in
 * `Notification` is the source of truth and the in-app list will still show it.
 */

const SEND_ENDPOINT = "https://exp.host/--/api/v2/push/send";

/** Expo rejects a request carrying more than 100 messages. */
const MAX_MESSAGES_PER_REQUEST = 100;

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  sound: "default";
  badge?: number;
  channelId: string;
  priority: "high";
}

interface ExpoTicket {
  status: "ok" | "error";
  id?: string;
  message?: string;
  details?: { error?: string };
}

export interface PushInput {
  userIds: string[];
  type: NotificationType;
  title: string;
  body: string;
  /** The same web-style path stored on the notification row (`/tasks/:id`). */
  link?: string | null;
}

/**
 * The badge number iOS paints on the icon — and the count the app reads to keep
 * its own tab badge honest while it is backgrounded. One grouped count for the
 * whole audience beats a query per recipient.
 */
async function unreadCounts(userIds: string[]): Promise<Map<string, number>> {
  const rows = await db.notification.groupBy({
    by: ["userId"],
    where: { userId: { in: userIds }, read: false },
    _count: { _all: true },
  });
  return new Map(rows.map((row) => [row.userId, row._count._all]));
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/**
 * Sends one alert to every device the given users have registered.
 *
 * Resolves even when Expo is unreachable; check the server log, not the return
 * value, when a notification does not arrive.
 */
export async function sendPush(input: PushInput): Promise<void> {
  const userIds = [...new Set(input.userIds)].filter(Boolean);
  if (userIds.length === 0) return;

  try {
    const devices = await db.pushToken.findMany({
      where: { userId: { in: userIds } },
      select: { token: true, userId: true },
    });
    if (devices.length === 0) return;

    const badges = await unreadCounts(userIds);

    const messages: ExpoPushMessage[] = devices.map((device) => ({
      to: device.token,
      title: input.title,
      body: input.body,
      // What the app reads on tap to open the right screen. Keep it small —
      // Expo caps the whole payload at 4KiB.
      data: { type: input.type, link: input.link ?? null },
      sound: "default",
      badge: badges.get(device.userId),
      // Matches the channel the app creates at startup. Android drops
      // notifications addressed to a channel that does not exist.
      channelId: "default",
      // Without this Android may hold the message until the next maintenance
      // window, which is exactly the delay a task assignment cannot afford.
      priority: "high",
    }));

    for (const batch of chunk(messages, MAX_MESSAGES_PER_REQUEST)) {
      await deliver(batch);
    }
  } catch (error) {
    console.error("[push] send failed", error);
  }
}

async function deliver(messages: ExpoPushMessage[]): Promise<void> {
  const accessToken = process.env.EXPO_ACCESS_TOKEN;

  const response = await fetch(SEND_ENDPOINT, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      // Optional, and only meaningful once push security is enabled on the
      // Expo project; without it Expo accepts any sender that knows the token.
      ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(messages),
  });

  if (!response.ok) {
    console.error("[push] expo returned", response.status, await response.text());
    return;
  }

  const payload = (await response.json()) as { data?: ExpoTicket[] };
  const tickets = payload.data ?? [];

  // Tickets come back positionally, so index i belongs to messages[i].
  const dead = tickets
    .map((ticket, i) =>
      ticket.status === "error" &&
      ticket.details?.error === "DeviceNotRegistered"
        ? messages[i].to
        : null,
    )
    .filter((token): token is string => token !== null);

  if (dead.length > 0) {
    // The app was uninstalled or the OS revoked permission. Keeping the row
    // would mean paying for a failed send on every future notification.
    await db.pushToken.deleteMany({ where: { token: { in: dead } } });
  }

  for (const ticket of tickets) {
    if (ticket.status === "error" && ticket.details?.error !== "DeviceNotRegistered") {
      console.error("[push] ticket error", ticket.details?.error, ticket.message);
    }
  }
}
