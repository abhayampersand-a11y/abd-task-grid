"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  MessageSquare,
  RefreshCw,
  UserPlus,
} from "lucide-react";
import { Dropdown } from "@/components/ui/dropdown";
import { EmptyInboxIllustration } from "@/components/ui/illustrations";
import { cn, relativeTime } from "@/lib/utils";
import type { NotificationType } from "@/lib/types";
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from "@/store/api";

export const NOTIFICATION_ICON: Record<
  NotificationType,
  { icon: typeof Bell; tint: string }
> = {
  TASK_ASSIGNED: { icon: UserPlus, tint: "bg-brand-100 text-brand-600" },
  TASK_UPDATED: { icon: RefreshCw, tint: "bg-aqua-100 text-aqua-700" },
  TASK_COMPLETED: { icon: CheckCircle2, tint: "bg-emerald-100 text-emerald-600" },
  NEW_COMMENT: { icon: MessageSquare, tint: "bg-lilac-100 text-lilac-600" },
  GROUP_INVITATION: { icon: UserPlus, tint: "bg-amber-100 text-amber-600" },
};

export function NotificationBell() {
  const router = useRouter();
  const { data } = useNotificationsQuery(undefined, {
    pollingInterval: 60_000,
  });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();

  const notifications = data?.notifications ?? [];
  const unread = data?.unreadCount ?? 0;

  return (
    <Dropdown
      panelClassName="w-[min(24rem,calc(100vw-2rem))] p-0"
      trigger={({ toggle }) => (
        <button
          type="button"
          onClick={toggle}
          aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
          className="relative flex size-10 items-center justify-center rounded-xl text-ink-muted transition-colors hover:bg-brand-50 hover:text-brand-700"
        >
          <Bell className="size-5" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 flex min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold leading-4 text-white ring-2 ring-surface">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      )}
    >
      {({ close }) => (
        <div>
          <header className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-sm font-semibold text-ink">Notifications</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => markAllRead()}
                className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-brand-600 hover:text-brand-700"
              >
                <CheckCheck className="size-3.5" />
                Mark all read
              </button>
            )}
          </header>

          {notifications.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-10 text-center">
              <EmptyInboxIllustration className="h-24 w-auto" />
              <p className="mt-4 text-sm font-medium text-ink">
                You&apos;re all caught up
              </p>
              <p className="mt-1 text-xs text-ink-muted">
                New activity in your groups will show up here.
              </p>
            </div>
          ) : (
            <ul className="thin-scrollbar max-h-[380px] overflow-y-auto">
              {notifications.slice(0, 8).map((item) => {
                const meta = NOTIFICATION_ICON[item.type];
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        if (!item.read) markRead(item.id);
                        close();
                        if (item.link) router.push(item.link);
                      }}
                      className={cn(
                        "flex w-full gap-3 border-b border-line px-4 py-3 text-left transition-colors last:border-0 hover:bg-surface-muted",
                        !item.read && "bg-brand-50/40",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-lg",
                          meta.tint,
                        )}
                      >
                        <meta.icon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-[13px] font-semibold text-ink">
                            {item.title}
                          </span>
                          {!item.read && (
                            <span className="size-1.5 shrink-0 rounded-full bg-brand-600" />
                          )}
                        </span>
                        <span className="mt-0.5 line-clamp-2 block text-[12.5px] leading-snug text-ink-muted">
                          {item.body}
                        </span>
                        <span className="mt-1 block text-[11px] text-ink-faint">
                          {relativeTime(item.createdAt)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <footer className="border-t border-line p-2">
            <Link
              href="/notifications"
              onClick={close}
              className="block rounded-lg px-3 py-2 text-center text-[13px] font-semibold text-brand-600 transition-colors hover:bg-brand-50"
            >
              View all notifications
            </Link>
          </footer>
        </div>
      )}
    </Dropdown>
  );
}
