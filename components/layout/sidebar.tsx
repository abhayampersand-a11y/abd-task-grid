"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  LayoutDashboard,
  LogOut,
  Plus,
  Rocket,
  ShieldCheck,
  User,
  Users,
  X,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CurrentUser } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSidebarOpen } from "@/store/ui-slice";
import { useNotificationsQuery } from "@/store/api";

const USER_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/groups", label: "Groups", icon: Users },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "Profile", icon: User },
];

const ADMIN_NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "User Management", icon: ShieldCheck },
  { href: "/profile", label: "Profile", icon: User },
];

export function Sidebar({
  user,
  onNewTask,
  onSignOut,
}: {
  user: CurrentUser;
  onNewTask: () => void;
  onSignOut: () => void;
}) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.ui.sidebarOpen);
  const { data: notifications } = useNotificationsQuery(undefined, {
    pollingInterval: 60_000,
  });

  const isAdmin = user.role === "ADMIN";
  const nav = isAdmin ? ADMIN_NAV : USER_NAV;
  const unread = notifications?.unreadCount ?? 0;

  const close = () => dispatch(setSidebarOpen(false));

  return (
    <>
      {/* Mobile scrim */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-[2px] lg:hidden"
          onClick={close}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col border-r border-line bg-surface transition-transform duration-300 ease-out",
          "lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Workspace identity */}
        <div className="flex items-center gap-3 px-5 py-5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-pop">
            {isAdmin ? (
              <ShieldCheck className="size-5.5" />
            ) : (
              <Rocket className="size-5.5" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[17px] font-bold leading-tight tracking-tight text-ink">
              {isAdmin ? "TaskFlow Admin" : "Acme Corp"}
            </p>
            <p className="truncate text-[12.5px] text-ink-muted">
              {isAdmin ? "Platform control" : "Enterprise Plan"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={close}
            aria-label="Close menu"
            className="lg:hidden"
          >
            <X className="size-4.5" />
          </Button>
        </div>

        {!isAdmin && (
          <div className="px-4 pb-4">
            <Button
              className="w-full"
              icon={<Plus className="size-4.5" />}
              onClick={() => {
                onNewTask();
                close();
              }}
            >
              New Task
            </Button>
          </div>
        )}

        <nav className="thin-scrollbar flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {nav.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className={cn(
                  "flex items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold transition-all duration-200",
                  active
                    ? "bg-brand-600 text-white shadow-pop"
                    : "text-ink-soft hover:bg-brand-50 hover:text-brand-700",
                )}
              >
                <item.icon className="size-5 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.href === "/notifications" && unread > 0 && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold",
                      active ? "bg-white/20 text-white" : "bg-rose-500 text-white",
                    )}
                  >
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Account footer */}
        <div className="border-t border-line p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <Avatar user={user} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-semibold text-ink">
                {user.fullName}
              </p>
              <p className="truncate text-[12px] text-ink-muted">
                {isAdmin ? "SUPER ADMIN" : user.email}
              </p>
            </div>
            <button
              type="button"
              onClick={onSignOut}
              aria-label="Sign out"
              className="flex size-9 shrink-0 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-rose-50 hover:text-rose-600"
            >
              <LogOut className="size-4.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
