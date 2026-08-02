"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LayoutGrid, ShieldCheck, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CurrentUser } from "@/lib/types";
import { useNotificationsQuery } from "@/store/api";

interface Tab {
  href: string;
  label: string;
  icon: typeof LayoutGrid;
  badge?: boolean;
}

const USER_TABS: Tab[] = [
  { href: "/dashboard", label: "Home", icon: LayoutGrid },
  { href: "/groups", label: "Groups", icon: Users },
  { href: "/notifications", label: "Alerts", icon: Bell, badge: true },
  { href: "/profile", label: "Profile", icon: User },
];

const ADMIN_TABS: Tab[] = [
  { href: "/admin", label: "Home", icon: LayoutGrid },
  { href: "/admin/users", label: "Users", icon: ShieldCheck },
  { href: "/profile", label: "Profile", icon: User },
];

/** Phone/tablet navigation. Replaced by the sidebar from `lg` up. */
export function BottomNav({ user }: { user: CurrentUser }) {
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
      <ul className="safe-bottom flex items-center justify-around px-2 py-2.5">
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
                  "relative mx-auto flex w-full max-w-24 flex-col items-center gap-1 rounded-full px-3 py-2",
                  "transition-all duration-200",
                  active ? "bg-brand-500 text-white" : "text-ink-muted",
                )}
              >
                <span className="relative">
                  <tab.icon className="size-5" />
                  {tab.badge && unread > 0 && (
                    <span
                      className={cn(
                        "absolute -right-2 -top-1.5 flex min-w-4 items-center justify-center rounded-full px-1",
                        "text-[9px] font-bold leading-4 ring-2",
                        active
                          ? "bg-white text-brand-600 ring-brand-500"
                          : "bg-brand-600 text-white ring-surface",
                      )}
                    >
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </span>
                <span className="text-[10.5px] font-semibold">{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
