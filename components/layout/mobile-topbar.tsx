"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Logo, LogoMark } from "@/components/ui/logo";
import type { CurrentUser } from "@/lib/types";
import { NotificationBell } from "./notification-bell";

/**
 * Phone header. Either the brand row (logo + bell + avatar) or, on detail
 * screens, a back arrow with the brand centred — matching the mockups.
 */
/** Detail routes get the back-arrow header; top-level tabs get the brand row. */
const DETAIL_ROUTE = /^\/(tasks|groups)\/[^/]+/;

export function MobileTopbar({
  user,
  onSearch,
  trailing,
}: {
  user: CurrentUser;
  onSearch?: () => void;
  trailing?: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = user.role === "ADMIN";

  if (DETAIL_ROUTE.test(pathname)) {
    return (
      <header className="sticky top-0 z-30 bg-canvas/95 backdrop-blur-xl lg:hidden">
        <div className="flex h-16 items-center gap-3 px-4">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex size-10 items-center justify-center rounded-full text-ink-soft transition-colors active:bg-brand-50"
          >
            <ArrowLeft className="size-5" />
          </button>
          <Logo />
          <div className="ml-auto flex items-center gap-1">{trailing}</div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 bg-canvas/95 backdrop-blur-xl lg:hidden">
      <div className="flex h-16 items-center gap-3 px-4">
        <Link
          href={isAdmin ? "/admin" : "/dashboard"}
          className="flex items-center gap-2"
        >
          <LogoMark className="size-8 rounded-lg" />
          <Logo />
        </Link>

        <div className="ml-auto flex items-center gap-2">
          {onSearch && (
            <button
              type="button"
              onClick={onSearch}
              aria-label="Search"
              className="flex size-10 items-center justify-center rounded-full bg-surface text-ink-soft shadow-soft transition-transform active:scale-95"
            >
              <Search className="size-4.5" />
            </button>
          )}

          {!isAdmin && (
            <span className="flex size-10 items-center justify-center rounded-full bg-surface shadow-soft">
              <NotificationBell />
            </span>
          )}

          <Link href="/profile" aria-label="Profile">
            <Avatar user={user} size="md" accentRing />
          </Link>
        </div>
      </div>
    </header>
  );
}
