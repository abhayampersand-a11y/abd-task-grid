"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LayoutDashboard, ShieldCheck, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CurrentUser } from "@/lib/types";
import { useNotificationsQuery } from "@/store/api";

interface Tab {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: boolean;
}

const USER_TABS: Tab[] = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/groups", label: "Groups", icon: Users },
  { href: "/notifications", label: "Alerts", icon: Bell, badge: true },
  { href: "/profile", label: "Profile", icon: User },
];

const ADMIN_TABS: Tab[] = [
  { href: "/admin", label: "Home", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: ShieldCheck },
  { href: "/profile", label: "Profile", icon: User },
];

/** Primary navigation below `lg`. Replaces the off-canvas sidebar entirely. */
export function TabBar({ user }: { user: CurrentUser }) {
  const pathname = usePathname();
  const isAdmin = user.role === "ADMIN";
  const tabs = isAdmin ? ADMIN_TABS : USER_TABS;

  const { data } = useNotificationsQuery(undefined, {
    pollingInterval: 60_000,
    skip: isAdmin,
  });
  const unread = data?.unreadCount ?? 0;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur-xl lg:hidden"
    >
      <ul
        className="flex items-stretch justify-around px-2 py-1.5"
        style={{ paddingBottom: "calc(0.375rem + env(safe-area-inset-bottom))" }}
      >
        {tabs.map((tab) => {
          const active =
            tab.href === "/admin"
              ? pathname === "/admin"
              : pathname === tab.href || pathname.startsWith(`${tab.href}/`);

          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "mx-auto flex min-h-11 w-full max-w-24 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5",
                  "transition-colors duration-200 active:bg-brand-50",
                  active ? "text-brand-600" : "text-ink-muted",
                )}
              >
                <span className="relative">
                  <tab.icon
                    className={cn("size-6", active && "stroke-[2.4]")}
                  />
                  {tab.badge && unread > 0 && (
                    <span className="absolute -right-2 -top-1 flex min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold leading-4 text-white ring-2 ring-surface">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    "text-[10.5px]",
                    active ? "font-bold" : "font-medium",
                  )}
                >
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
