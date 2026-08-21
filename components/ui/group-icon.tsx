import { cn, groupColor } from "@/lib/utils";
import type { GroupSummary } from "@/lib/types";

const SIZES = {
  xs: "size-8 rounded-lg text-[11px]",
  sm: "size-9 rounded-lg text-[13px]",
  md: "size-11 rounded-xl text-base",
  lg: "size-12 rounded-2xl text-lg",
  xl: "size-16 rounded-2xl text-xl",
} as const;

export type GroupIconSize = keyof typeof SIZES;

/**
 * A group's picture, with the coloured initial as the fallback — the same
 * arrangement as `Avatar`, kept square-ish because a group reads as a place
 * rather than a person.
 */
export function GroupIcon({
  group,
  size = "md",
  className,
}: {
  group: Pick<GroupSummary, "name" | "colorKey" | "iconUrl">;
  size?: GroupIconSize;
  className?: string;
}) {
  const base = cn(
    "flex shrink-0 items-center justify-center font-bold select-none",
    SIZES[size],
    className,
  );

  if (group.iconUrl) {
    return (
      // Icons come from our own bucket but also from URLs saved before it
      // existed; a plain <img> avoids whitelisting every remote host in
      // next.config, exactly as `Avatar` does.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={group.iconUrl}
        alt=""
        className={cn(base, "object-cover")}
      />
    );
  }

  return (
    <span className={cn(base, groupColor(group.colorKey).chip)} aria-hidden>
      {group.name.slice(0, 1).toUpperCase()}
    </span>
  );
}
