"use client";

import Link from "next/link";
import { CircleHelp, LogOut, Menu, Settings, User } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dropdown,
  DropdownItem,
  DropdownSeparator,
} from "@/components/ui/dropdown";
import { Logo } from "@/components/ui/logo";
import type { CurrentUser } from "@/lib/types";
import { useAppDispatch } from "@/store/hooks";
import { toggleSidebar } from "@/store/ui-slice";
import { GlobalSearch } from "./global-search";
import { NotificationBell } from "./notification-bell";

export function Topbar({
  user,
  onSignOut,
}: {
  user: CurrentUser;
  onSignOut: () => void;
}) {
  const dispatch = useAppDispatch();
  const isAdmin = user.role === "ADMIN";

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:gap-4 sm:px-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatch(toggleSidebar())}
          aria-label="Open menu"
          className="lg:hidden"
        >
          <Menu className="size-5" />
        </Button>

        <Link href={isAdmin ? "/admin" : "/dashboard"} className="hidden sm:block">
          <Logo />
        </Link>

        <GlobalSearch
          className="min-w-0 flex-1 sm:max-w-lg"
          placeholder={
            isAdmin ? "Search for users, roles, or dates…" : "Search tasks or groups…"
          }
        />

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            aria-label="Help"
            className="hidden size-10 items-center justify-center rounded-xl text-ink-muted transition-colors hover:bg-brand-50 hover:text-brand-700 sm:flex"
          >
            <CircleHelp className="size-5" />
          </button>

          {!isAdmin && <NotificationBell />}

          <Link
            href="/profile"
            aria-label="Settings"
            className="hidden size-10 items-center justify-center rounded-xl text-ink-muted transition-colors hover:bg-brand-50 hover:text-brand-700 sm:flex"
          >
            <Settings className="size-5" />
          </Link>

          <span className="mx-1.5 hidden h-6 w-px bg-line sm:block" />

          <button
            type="button"
            onClick={onSignOut}
            className="hidden rounded-lg px-2.5 py-1.5 text-[13.5px] font-semibold text-brand-600 transition-colors hover:bg-brand-50 sm:block"
          >
            Sign Out
          </button>

          <Dropdown
            trigger={({ toggle }) => (
              <button
                type="button"
                onClick={toggle}
                aria-label="Account menu"
                className="rounded-full p-1 transition-colors hover:bg-surface-muted"
              >
                <Avatar user={user} size="md" />
              </button>
            )}
          >
            {({ close }) => (
              <>
                <div className="px-3 py-2.5">
                  <p className="truncate text-sm font-semibold text-ink">
                    {user.fullName}
                  </p>
                  <p className="truncate text-xs text-ink-muted">{user.email}</p>
                </div>
                <DropdownSeparator />
                <Link href="/profile" onClick={close}>
                  <DropdownItem icon={<User />}>Profile settings</DropdownItem>
                </Link>
                {!isAdmin && (
                  <Link href="/notifications" onClick={close}>
                    <DropdownItem icon={<Settings />}>
                      Notification preferences
                    </DropdownItem>
                  </Link>
                )}
                <DropdownSeparator />
                <DropdownItem icon={<LogOut />} tone="danger" onClick={onSignOut}>
                  Sign out
                </DropdownItem>
              </>
            )}
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
