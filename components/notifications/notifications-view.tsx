"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { EmptyInboxIllustration } from "@/components/ui/illustrations";
import { PageHeader } from "@/components/ui/page-header";
import { RowSkeleton } from "@/components/ui/skeleton";
import { Tabs } from "@/components/ui/tabs";
import { NOTIFICATION_ICON } from "@/components/layout/notification-bell";
import { cn, relativeTime } from "@/lib/utils";
import {
  useDeleteNotificationMutation,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from "@/store/api";

type Filter = "all" | "unread";

export function NotificationsView() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const { data, isLoading } = useNotificationsQuery();
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: markingAll }] =
    useMarkAllNotificationsReadMutation();
  const [remove] = useDeleteNotificationMutation();

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;
  const visible =
    filter === "unread"
      ? notifications.filter((item) => !item.read)
      : notifications;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Notifications"
        description="Everything happening across the groups you belong to."
        actions={
          unreadCount > 0 ? (
            <Button
              variant="outline"
              icon={<CheckCheck className="size-4" />}
              loading={markingAll}
              onClick={() => markAllRead()}
            >
              Mark all as read
            </Button>
          ) : undefined
        }
      />

      <Tabs
        items={[
          { value: "all" as const, label: "All", count: notifications.length },
          { value: "unread" as const, label: "Unread", count: unreadCount },
        ]}
        value={filter}
        onChange={setFilter}
      />

      <div className="card overflow-hidden">
        {isLoading ? (
          <RowSkeleton count={6} />
        ) : visible.length === 0 ? (
          <EmptyState
            illustration={<EmptyInboxIllustration className="h-32 w-auto" />}
            title={
              filter === "unread"
                ? "No unread notifications"
                : "You're all caught up"
            }
            description="New task assignments, comments, updates and group invitations will land here."
          />
        ) : (
          <ul className="divide-y divide-line">
            {visible.map((item) => {
              const meta = NOTIFICATION_ICON[item.type];
              return (
                <li
                  key={item.id}
                  className={cn(
                    "group flex items-start gap-4 px-5 py-4 transition-colors hover:bg-surface-muted",
                    !item.read && "bg-brand-50/40",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-xl",
                      meta.tint,
                    )}
                  >
                    <meta.icon className="size-4.5" />
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      if (!item.read) markRead(item.id);
                      if (item.link) router.push(item.link);
                    }}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[14px] font-semibold text-ink">
                        {item.title}
                      </span>
                      {!item.read && (
                        <span className="size-1.5 shrink-0 rounded-full bg-brand-600" />
                      )}
                    </span>
                    <span className="mt-0.5 block text-[13px] leading-relaxed text-ink-muted">
                      {item.body}
                    </span>
                    <span className="mt-1 block text-[11.5px] text-ink-faint">
                      {relativeTime(item.createdAt)}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    aria-label="Dismiss notification"
                    // Always visible on touch — `group-hover` never fires there.
                    className="flex size-11 shrink-0 items-center justify-center rounded-lg text-ink-faint transition-all active:bg-rose-50 active:text-rose-600 hover:bg-rose-50 hover:text-rose-600 lg:size-9 lg:opacity-0 lg:focus-visible:opacity-100 lg:group-hover:opacity-100"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
