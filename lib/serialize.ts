import "server-only";

import type {
  ActivityDto,
  AttachmentDto,
  ChecklistItemDto,
  CommentDto,
  CurrentUser,
  GroupMemberDto,
  NotificationDto,
  TaskSummary,
  UserSummary,
} from "./types";

export const userSummarySelect = {
  id: true,
  fullName: true,
  email: true,
  avatarUrl: true,
  jobTitle: true,
} as const;

type UserSummaryRow = {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  jobTitle: string | null;
};

export function toUserSummary(user: UserSummaryRow): UserSummary {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    avatarUrl: user.avatarUrl,
    jobTitle: user.jobTitle,
  };
}

export function toCurrentUser(user: UserSummaryRow & {
  mobile: string;
  bio: string | null;
  role: string;
  status: string;
  createdAt: Date;
}): CurrentUser {
  return {
    ...toUserSummary(user),
    mobile: user.mobile,
    bio: user.bio,
    role: user.role === "ADMIN" ? "ADMIN" : "USER",
    status: user.status as CurrentUser["status"],
    createdAt: user.createdAt.toISOString(),
  };
}

export function toMember(row: {
  id: string;
  role: string;
  joinedAt: Date;
  user: UserSummaryRow;
}): GroupMemberDto {
  return {
    id: row.id,
    role: row.role === "OWNER" ? "OWNER" : "MEMBER",
    joinedAt: row.joinedAt.toISOString(),
    user: toUserSummary(row.user),
  };
}

/** Shape required by `toTaskSummary` — keep route `include`s in sync with this. */
export const taskSummaryInclude = {
  group: { select: { id: true, name: true, colorKey: true } },
  assignee: { select: userSummarySelect },
  createdBy: { select: userSummarySelect },
  checklist: { select: { id: true, done: true } },
  _count: { select: { comments: true, attachments: true } },
} as const;

type TaskSummaryRow = {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  progress: number;
  dueDate: Date | null;
  createdAt: Date;
  completedAt: Date | null;
  group: { id: string; name: string; colorKey: string };
  assignee: UserSummaryRow | null;
  createdBy: UserSummaryRow;
  checklist: { id: string; done: boolean }[];
  _count: { comments: number; attachments: number };
};

export function toTaskSummary(task: TaskSummaryRow): TaskSummary {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    priority: task.priority as TaskSummary["priority"],
    status: task.status as TaskSummary["status"],
    progress: task.progress,
    dueDate: task.dueDate?.toISOString() ?? null,
    createdAt: task.createdAt.toISOString(),
    completedAt: task.completedAt?.toISOString() ?? null,
    group: task.group,
    assignee: task.assignee ? toUserSummary(task.assignee) : null,
    createdBy: toUserSummary(task.createdBy),
    commentCount: task._count.comments,
    attachmentCount: task._count.attachments,
    checklistTotal: task.checklist.length,
    checklistDone: task.checklist.filter((item) => item.done).length,
  };
}

export function toComment(row: {
  id: string;
  body: string;
  createdAt: Date;
  author: UserSummaryRow;
}): CommentDto {
  return {
    id: row.id,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
    author: toUserSummary(row.author),
  };
}

export function toAttachment(row: {
  id: string;
  name: string;
  url: string;
  sizeBytes: number;
  mimeType: string;
  createdAt: Date;
  uploadedBy: UserSummaryRow;
}): AttachmentDto {
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    sizeBytes: row.sizeBytes,
    mimeType: row.mimeType,
    createdAt: row.createdAt.toISOString(),
    uploadedBy: toUserSummary(row.uploadedBy),
  };
}

export function toChecklistItem(row: {
  id: string;
  label: string;
  done: boolean;
  position: number;
}): ChecklistItemDto {
  return { id: row.id, label: row.label, done: row.done, position: row.position };
}

export function toActivity(row: {
  id: string;
  type: string;
  message: string;
  createdAt: Date;
  actor: UserSummaryRow;
}): ActivityDto {
  return {
    id: row.id,
    type: row.type as ActivityDto["type"],
    message: row.message,
    createdAt: row.createdAt.toISOString(),
    actor: toUserSummary(row.actor),
  };
}

export function toNotification(row: {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: Date;
}): NotificationDto {
  return {
    id: row.id,
    type: row.type as NotificationDto["type"],
    title: row.title,
    body: row.body,
    link: row.link,
    read: row.read,
    createdAt: row.createdAt.toISOString(),
  };
}
