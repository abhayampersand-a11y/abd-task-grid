import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { TaskPriority, TaskStatus } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Deterministic avatar tint so a user looks the same everywhere. */
const AVATAR_TINTS = [
  "bg-brand-100 text-brand-700",
  "bg-lilac-100 text-lilac-700",
  "bg-aqua-100 text-aqua-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-fuchsia-100 text-fuchsia-700",
  "bg-rose-100 text-rose-700",
];

export function tintFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return AVATAR_TINTS[hash % AVATAR_TINTS.length];
}

/**
 * Group accents. `solid` is the filled icon tile from the mobile cards,
 * `chip` the soft background, `dot` the small status marker.
 */
export const GROUP_COLORS: Record<
  string,
  { chip: string; solid: string; ring: string; dot: string }
> = {
  indigo: {
    chip: "bg-brand-100 text-brand-600",
    solid: "bg-brand-500 text-white",
    ring: "ring-brand-200",
    dot: "bg-brand-500",
  },
  violet: {
    chip: "bg-lilac-100 text-lilac-600",
    solid: "bg-lilac-500 text-white",
    ring: "ring-lilac-200",
    dot: "bg-lilac-500",
  },
  sky: {
    chip: "bg-aqua-100 text-aqua-700",
    solid: "bg-aqua-500 text-white",
    ring: "ring-aqua-200",
    dot: "bg-aqua-500",
  },
  emerald: {
    chip: "bg-emerald-100 text-emerald-700",
    solid: "bg-emerald-500 text-white",
    ring: "ring-emerald-200",
    dot: "bg-emerald-500",
  },
  amber: {
    chip: "bg-amber-100 text-amber-700",
    solid: "bg-amber-500 text-white",
    ring: "ring-amber-200",
    dot: "bg-amber-500",
  },
  rose: {
    chip: "bg-rose-100 text-rose-600",
    solid: "bg-rose-500 text-white",
    ring: "ring-rose-200",
    dot: "bg-rose-500",
  },
};

export function groupColor(key: string) {
  return GROUP_COLORS[key] ?? GROUP_COLORS.indigo;
}

export const PRIORITY_META: Record<
  TaskPriority,
  { label: string; badge: string; dot: string }
> = {
  LOW: {
    label: "Low priority",
    badge: "bg-aqua-100 text-aqua-700",
    dot: "bg-aqua-500",
  },
  MEDIUM: {
    label: "Medium",
    badge: "bg-lilac-100 text-lilac-600",
    dot: "bg-lilac-500",
  },
  HIGH: {
    label: "High priority",
    badge: "bg-brand-100 text-brand-600",
    dot: "bg-brand-500",
  },
  URGENT: {
    label: "Urgent",
    badge: "bg-brand-600 text-white",
    dot: "bg-white",
  },
};

export const STATUS_META: Record<
  TaskStatus,
  { label: string; badge: string; dot: string }
> = {
  BACKLOG: {
    label: "Backlog",
    badge: "bg-surface-muted text-ink-muted",
    dot: "bg-ink-faint",
  },
  TODO: {
    label: "Pending",
    badge: "bg-surface-muted text-ink-soft",
    dot: "bg-ink-muted",
  },
  IN_PROGRESS: {
    label: "In progress",
    badge: "bg-aqua-100 text-aqua-700",
    dot: "bg-aqua-500",
  },
  IN_REVIEW: {
    label: "In review",
    badge: "bg-lilac-100 text-lilac-600",
    dot: "bg-lilac-500",
  },
  COMPLETED: {
    label: "Done",
    badge: "bg-brand-100 text-brand-600",
    dot: "bg-brand-500",
  },
};

export const PRIORITY_ORDER: TaskPriority[] = [
  "URGENT",
  "HIGH",
  "MEDIUM",
  "LOW",
];

export const STATUS_ORDER: TaskStatus[] = [
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "COMPLETED",
];

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatShortDate(value: string | Date | null | undefined) {
  if (!value) return "No deadline";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "No deadline";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function relativeTime(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;

  return formatDate(date);
}

export function isOverdue(dueDate: string | null, status: TaskStatus) {
  if (!dueDate || status === "COMPLETED") return false;
  return new Date(dueDate).getTime() < Date.now();
}

export function formatBytes(bytes: number) {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB", "GB"];
  const exp = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  return `${(bytes / 1024 ** exp).toFixed(exp === 0 ? 0 : 1)} ${units[exp]}`;
}

/** `2024-10-24` for <input type="date"> without timezone drift. */
export function toDateInputValue(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}
