"use client";

import { cn, initials, tintFor } from "@/lib/utils";
import type { UserSummary } from "@/lib/types";

const SIZES = {
  xs: "size-6 text-[10px]",
  sm: "size-8 text-[11px]",
  md: "size-10 text-xs",
  lg: "size-12 text-sm",
  xl: "size-20 text-xl",
  "2xl": "size-28 text-3xl",
} as const;

export type AvatarSize = keyof typeof SIZES;

export function Avatar({
  user,
  size = "md",
  className,
  ring = false,
  /** Pink halo used for the signed-in user in the header. */
  accentRing = false,
}: {
  user: Pick<UserSummary, "id" | "fullName" | "avatarUrl">;
  size?: AvatarSize;
  className?: string;
  ring?: boolean;
  accentRing?: boolean;
}) {
  const base = cn(
    "inline-flex shrink-0 items-center justify-center rounded-full font-semibold select-none",
    SIZES[size],
    ring && "ring-2 ring-surface",
    accentRing && "ring-2 ring-brand-500 ring-offset-2 ring-offset-surface",
    className,
  );

  if (user.avatarUrl) {
    return (
      // Avatars come from arbitrary user-supplied URLs; plain <img> avoids
      // having to whitelist every remote host in next.config.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatarUrl}
        alt={user.fullName}
        className={cn(base, "object-cover")}
      />
    );
  }

  return (
    <span
      className={cn(base, tintFor(user.id))}
      title={user.fullName}
      aria-label={user.fullName}
    >
      {initials(user.fullName)}
    </span>
  );
}

export function AvatarGroup({
  users,
  max = 3,
  size = "sm",
  total,
}: {
  users: Pick<UserSummary, "id" | "fullName" | "avatarUrl">[];
  max?: number;
  size?: AvatarSize;
  total?: number;
}) {
  const shown = users.slice(0, max);
  const overflow = (total ?? users.length) - shown.length;

  return (
    <div className="flex items-center -space-x-2">
      {shown.map((user) => (
        <Avatar key={user.id} user={user} size={size} ring />
      ))}
      {overflow > 0 && (
        <span
          className={cn(
            "inline-flex items-center justify-center rounded-full bg-line font-semibold text-ink-soft ring-2 ring-surface",
            SIZES[size],
          )}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}
