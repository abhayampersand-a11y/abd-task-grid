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
  "bg-indigo-100 text-indigo-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
  "bg-teal-100 text-teal-700",
];

export function tintFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return AVATAR_TINTS[hash % AVATAR_TINTS.length];
}

export const GROUP_COLORS: Record<
  string,
  { chip: string; ring: string; dot: string }
> = {
  indigo: {
    chip: "bg-indigo-50 text-indigo-600",
    ring: "ring-indigo-200",
    dot: "bg-indigo-500",
  },
  emerald: {
    chip: "bg-emerald-50 text-emerald-600",
    ring: "ring-emerald-200",
    dot: "bg-emerald-500",
  },
  amber: {
    chip: "bg-amber-50 text-amber-600",
    ring: "ring-amber-200",
    dot: "bg-amber-500",
  },
  rose: {
    chip: "bg-rose-50 text-rose-600",
    ring: "ring-rose-200",
    dot: "bg-rose-500",
  },
  sky: {
    chip: "bg-sky-50 text-sky-600",
    ring: "ring-sky-200",
    dot: "bg-sky-500",
  },
  violet: {
    chip: "bg-violet-50 text-violet-600",
    ring: "ring-violet-200",
    dot: "bg-violet-500",
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
    label: "Low",
    badge: "bg-slate-100 text-slate-600",
    dot: "bg-slate-400",
  },
  MEDIUM: {
    label: "Medium",
    badge: "bg-sky-50 text-sky-700",
    dot: "bg-sky-500",
  },
  HIGH: {
    label: "High",
    badge: "bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  URGENT: {
    label: "Urgent",
    badge: "bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
  },
};

export const STATUS_META: Record<
  TaskStatus,
  { label: string; badge: string; dot: string }
> = {
  BACKLOG: {
    label: "Backlog",
    badge: "bg-slate-100 text-slate-600",
    dot: "bg-slate-400",
  },
  TODO: {
    label: "To Do",
    badge: "bg-indigo-50 text-indigo-700",
    dot: "bg-indigo-500",
  },
  IN_PROGRESS: {
    label: "In Progress",
    badge: "bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
  IN_REVIEW: {
    label: "In Review",
    badge: "bg-violet-50 text-violet-700",
    dot: "bg-violet-500",
  },
  COMPLETED: {
    label: "Completed",
    badge: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
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

/**
 * The board's stat tiles each stand for a bucket of statuses, not a single
 * one, so filtering by a tile has to match the same bucket the tile counted —
 * otherwise "In progress: 2" opens a list with one row in it.
 */
export const STATUS_GROUPS = {
  PENDING: ["BACKLOG", "TODO"],
  ACTIVE: ["IN_PROGRESS", "IN_REVIEW"],
} as const satisfies Record<string, readonly TaskStatus[]>;

export type StatusGroup = keyof typeof STATUS_GROUPS;

/** Anything the status filter can hold: every status, one bucket, or one status. */
export type StatusFilter = "ALL" | StatusGroup | TaskStatus;

const STATUS_GROUP_LABEL: Record<StatusGroup, string> = {
  PENDING: "Pending",
  ACTIVE: "In Progress",
};

function isStatusGroup(value: StatusFilter): value is StatusGroup {
  return value in STATUS_GROUPS;
}

/** Short label for the filter chip. */
export function statusFilterLabel(value: StatusFilter): string {
  if (value === "ALL") return "All";
  return isStatusGroup(value)
    ? STATUS_GROUP_LABEL[value]
    : STATUS_META[value].label;
}

/** The `status` param for GET /api/tasks — a bucket sends every status in it. */
export function statusFilterParam(value: StatusFilter): string | undefined {
  if (value === "ALL") return undefined;
  return isStatusGroup(value) ? STATUS_GROUPS[value].join(",") : value;
}

/** Options for the status dropdowns: the tile buckets first, then each status. */
export const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All statuses" },
  { value: "PENDING", label: "Pending (Backlog + To Do)" },
  { value: "ACTIVE", label: "In Progress (+ In Review)" },
  ...STATUS_ORDER.map((status) => ({
    value: status as StatusFilter,
    label: STATUS_META[status].label,
  })),
];
