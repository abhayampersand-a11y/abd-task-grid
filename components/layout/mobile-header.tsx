"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Logo } from "@/components/ui/logo";
import type { CurrentUser } from "@/lib/types";
import { NotificationBell } from "./notification-bell";

/** Detail routes get a back arrow; tab roots get the brand row. */
const DETAIL_ROUTE = /^\/(tasks|groups)\/[^/]+/;

export function MobileHeader({ user }: { user: CurrentUser }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = user.role === "ADMIN";
  const isDetail = DETAIL_ROUTE.test(pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/95 backdrop-blur-xl lg:hidden">
      <div
        className="flex h-14 items-center gap-2 px-4"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        {isDetail ? (
          <>
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back"
              className="-ml-2 flex size-11 items-center justify-center rounded-full text-ink-soft transition-colors active:bg-surface-muted"
            >
              <ArrowLeft className="size-5" />
            </button>
            <Logo />
          </>
        ) : (
          <Link
            href={isAdmin ? "/admin" : "/dashboard"}
            className="flex items-center"
          >
            <Logo />
          </Link>
        )}

        <div className="ml-auto flex items-center gap-1">
          {!isAdmin && <NotificationBell />}
          <Link
            href="/profile"
            aria-label="Profile"
            className="flex size-11 items-center justify-center rounded-full active:bg-surface-muted"
          >
            <Avatar user={user} size="sm" />
          </Link>
        </div>
      </div>
    </header>
  );
}
