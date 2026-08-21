import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  AdminUserRow,
  CommentDto,
  CurrentUser,
  DashboardOverview,
  GroupDetail,
  GroupInvitationDto,
  GroupMemberDto,
  GroupSummary,
  LookupResult,
  NotificationDto,
  Paginated,
  SearchResults,
  TaskDetail,
  TaskSummary,
  UserSummary,
} from "@/lib/types";
import type {
  ChangePasswordInput,
  CreateGroupInput,
  CreateTaskInput,
  DeleteAccountInput,
  InvitationAction,
  SignInInput,
  SignUpInput,
  UpdateProfileInput,
  UpdateTaskInput,
} from "@/lib/validation";

export interface ApiErrorShape {
  message: string;
  fieldErrors?: Record<string, string[]>;
}

/** Narrows an RTK Query error into something a form can display. */
export function toApiError(error: unknown): ApiErrorShape {
  if (
    error &&
    typeof error === "object" &&
    "data" in error &&
    error.data &&
    typeof error.data === "object" &&
    "message" in error.data
  ) {
    return error.data as ApiErrorShape;
  }
  return { message: "Something went wrong. Please try again." };
}

export interface TaskFilters {
  scope?: "assigned-to-me" | "assigned-by-me" | "all";
  groupId?: string;
  status?: string;
  priority?: string;
  assignedBy?: string;
  assigneeId?: string;
  /** overdue | today | week | none */
  due?: string;
  q?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export interface TaskListResponse {
  tasks: TaskSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
}

export interface AdminUserFilters {
  q?: string;
  status?: string;
  sort?: string;
  page?: number;
}

type AdminUsersResponse = Paginated<AdminUserRow> & {
  totals: { all: number; active: number; disabled: number; pending: number };
};

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  disabledUsers: number;
  newThisMonth: number;
  joinedToday: number;
  totalGroups: number;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  growthRate: number;
}

/** What both group-icon endpoints echo back once the row is stored. */
export interface GroupIconResult {
  id: string;
  name: string;
  iconUrl: string | null;
}

/** Drops empty values so the querystring stays readable. */
function clean(params: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== "" && value !== null,
    ),
  );
}

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: [
    "Session",
    "Group",
    "GroupList",
    "Task",
    "TaskList",
    "Notification",
    "Invitation",
    "Dashboard",
    "AdminUsers",
    "Directory",
  ],
  endpoints: (build) => ({
    // ── Auth ──────────────────────────────────────────────────────────────
    me: build.query<{ user: CurrentUser }, void>({
      query: () => "/auth/me",
      providesTags: ["Session"],
    }),
    signUp: build.mutation<{ user: CurrentUser }, SignUpInput>({
      query: (body) => ({ url: "/auth/sign-up", method: "POST", body }),
      invalidatesTags: ["Session"],
    }),
    signIn: build.mutation<{ user: CurrentUser }, SignInInput>({
      query: (body) => ({ url: "/auth/sign-in", method: "POST", body }),
      invalidatesTags: ["Session"],
    }),
    signOut: build.mutation<{ success: boolean }, void>({
      query: () => ({ url: "/auth/sign-out", method: "POST" }),
      invalidatesTags: ["Session"],
    }),

    // ── Dashboard ─────────────────────────────────────────────────────────
    dashboard: build.query<DashboardOverview, void>({
      query: () => "/dashboard",
      providesTags: ["Dashboard", "GroupList"],
    }),

    // ── Groups ────────────────────────────────────────────────────────────
    groups: build.query<{ groups: GroupSummary[] }, void>({
      query: () => "/groups",
      providesTags: ["GroupList"],
    }),
    group: build.query<{ group: GroupDetail }, string>({
      query: (groupId) => `/groups/${groupId}`,
      providesTags: (_r, _e, groupId) => [{ type: "Group", id: groupId }],
    }),
    groupMembers: build.query<{ members: GroupMemberDto[] }, string>({
      query: (groupId) => `/groups/${groupId}/members`,
      providesTags: (_r, _e, groupId) => [{ type: "Group", id: groupId }],
    }),
    createGroup: build.mutation<
      { group: { id: string; name: string }; invited: number },
      CreateGroupInput
    >({
      query: (body) => ({ url: "/groups", method: "POST", body }),
      invalidatesTags: ["GroupList", "Dashboard"],
    }),
    updateGroup: build.mutation<
      { group: { id: string; name: string } },
      { groupId: string } & Partial<CreateGroupInput>
    >({
      query: ({ groupId, ...body }) => ({
        url: `/groups/${groupId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { groupId }) => [
        { type: "Group", id: groupId },
        "GroupList",
      ],
    }),
    deleteGroup: build.mutation<{ success: boolean }, string>({
      query: (groupId) => ({ url: `/groups/${groupId}`, method: "DELETE" }),
      invalidatesTags: ["GroupList", "Dashboard", "TaskList"],
    }),
    /**
     * `fetchBaseQuery` passes FormData through untouched — it only reaches for
     * JSON.stringify on plain objects — so the browser sets the multipart
     * boundary itself and no Content-Type must be written by hand.
     *
     * The icon shows up on group cards, the dashboard and pending invitations,
     * so all three lists are invalidated rather than just the open group.
     */
    uploadGroupIcon: build.mutation<
      { group: GroupIconResult },
      { groupId: string; body: FormData }
    >({
      query: ({ groupId, body }) => ({
        url: `/groups/${groupId}/icon`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { groupId }) => [
        { type: "Group", id: groupId },
        "GroupList",
        "Dashboard",
        "Invitation",
      ],
    }),
    removeGroupIcon: build.mutation<{ group: GroupIconResult }, string>({
      query: (groupId) => ({
        url: `/groups/${groupId}/icon`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, groupId) => [
        { type: "Group", id: groupId },
        "GroupList",
        "Dashboard",
        "Invitation",
      ],
    }),
    inviteGroupMembers: build.mutation<
      { invited: number },
      { groupId: string; memberIds: string[] }
    >({
      query: ({ groupId, memberIds }) => ({
        url: `/groups/${groupId}/members`,
        method: "POST",
        body: { memberIds },
      }),
      invalidatesTags: (_r, _e, { groupId }) => [
        { type: "Group", id: groupId },
        "GroupList",
      ],
    }),
    removeGroupMember: build.mutation<
      { success: boolean },
      { groupId: string; userId: string }
    >({
      query: ({ groupId, userId }) => ({
        url: `/groups/${groupId}/members/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { groupId }) => [
        { type: "Group", id: groupId },
        "GroupList",
      ],
    }),

    // ── Directory ─────────────────────────────────────────────────────────
    directory: build.query<{ users: UserSummary[] }, string | void>({
      query: (q) => ({ url: "/users", params: clean({ q: q ?? undefined }) }),
      providesTags: ["Directory"],
    }),
    /** Exact-email lookup behind the invite box. No partial matching. */
    lookupUser: build.query<LookupResult, { email: string; groupId?: string }>({
      query: ({ email, groupId }) => ({
        url: "/users/lookup",
        params: clean({ email, groupId }),
      }),
      providesTags: ["Directory", "Invitation"],
    }),

    // ── Invitations ───────────────────────────────────────────────────────
    invitations: build.query<
      { invitations: GroupInvitationDto[]; pendingCount: number },
      void
    >({
      query: () => "/invitations",
      providesTags: ["Invitation"],
    }),
    respondToInvitation: build.mutation<
      { invitation: GroupInvitationDto },
      { invitationId: string; action: InvitationAction }
    >({
      query: ({ invitationId, action }) => ({
        url: `/invitations/${invitationId}`,
        method: "PATCH",
        body: { action },
      }),
      invalidatesTags: ["Invitation", "GroupList", "Dashboard", "Notification"],
    }),
    cancelInvitation: build.mutation<
      { success: boolean },
      { invitationId: string; groupId: string }
    >({
      query: ({ invitationId }) => ({
        url: `/invitations/${invitationId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { groupId }) => [
        { type: "Group", id: groupId },
        "Invitation",
      ],
    }),

    // ── Tasks ─────────────────────────────────────────────────────────────
    tasks: build.query<TaskListResponse, TaskFilters>({
      query: (filters) => ({ url: "/tasks", params: clean({ ...filters }) }),
      providesTags: ["TaskList"],
    }),
    taskStats: build.query<TaskStats, TaskFilters>({
      query: (filters) => ({
        url: "/tasks/stats",
        params: clean({ ...filters }),
      }),
      providesTags: ["TaskList"],
    }),
    task: build.query<{ task: TaskDetail }, string>({
      query: (taskId) => `/tasks/${taskId}`,
      providesTags: (_r, _e, taskId) => [{ type: "Task", id: taskId }],
    }),
    createTask: build.mutation<{ task: TaskSummary }, CreateTaskInput>({
      query: (body) => ({ url: "/tasks", method: "POST", body }),
      invalidatesTags: ["TaskList", "Dashboard", "GroupList", "Notification"],
    }),
    updateTask: build.mutation<
      { task: TaskSummary },
      { taskId: string } & UpdateTaskInput
    >({
      query: ({ taskId, ...body }) => ({
        url: `/tasks/${taskId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { taskId }) => [
        { type: "Task", id: taskId },
        "TaskList",
        "Dashboard",
        "Notification",
      ],
    }),
    deleteTask: build.mutation<{ success: boolean }, string>({
      query: (taskId) => ({ url: `/tasks/${taskId}`, method: "DELETE" }),
      invalidatesTags: ["TaskList", "Dashboard", "GroupList"],
    }),
    addComment: build.mutation<
      { comment: CommentDto },
      { taskId: string; body: string }
    >({
      query: ({ taskId, body }) => ({
        url: `/tasks/${taskId}/comments`,
        method: "POST",
        body: { body },
      }),
      invalidatesTags: (_r, _e, { taskId }) => [
        { type: "Task", id: taskId },
        "Notification",
      ],
    }),
    toggleChecklistItem: build.mutation<
      { item: { id: string; done: boolean } },
      { taskId: string; itemId: string; done: boolean }
    >({
      query: ({ taskId, itemId, done }) => ({
        url: `/tasks/${taskId}/checklist/${itemId}`,
        method: "PATCH",
        body: { done },
      }),
      invalidatesTags: (_r, _e, { taskId }) => [
        { type: "Task", id: taskId },
        "TaskList",
      ],
    }),

    // ── Notifications ─────────────────────────────────────────────────────
    notifications: build.query<
      { notifications: NotificationDto[]; unreadCount: number },
      void
    >({
      query: () => "/notifications",
      providesTags: ["Notification"],
    }),
    markNotificationRead: build.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/notifications/${id}`, method: "PATCH" }),
      invalidatesTags: ["Notification"],
    }),
    deleteNotification: build.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/notifications/${id}`, method: "DELETE" }),
      invalidatesTags: ["Notification"],
    }),
    markAllNotificationsRead: build.mutation<{ success: boolean }, void>({
      query: () => ({ url: "/notifications", method: "PATCH" }),
      invalidatesTags: ["Notification"],
    }),

    // ── Search ────────────────────────────────────────────────────────────
    search: build.query<SearchResults, string>({
      query: (q) => ({ url: "/search", params: { q } }),
    }),

    // ── Profile ───────────────────────────────────────────────────────────
    updateProfile: build.mutation<{ user: CurrentUser }, UpdateProfileInput>({
      query: (body) => ({ url: "/profile", method: "PATCH", body }),
      invalidatesTags: ["Session"],
    }),
    changePassword: build.mutation<{ success: boolean }, ChangePasswordInput>({
      query: (body) => ({ url: "/profile/password", method: "POST", body }),
    }),
    /**
     * No `invalidatesTags`: the account is gone by the time this resolves, so
     * refetching `/auth/me` could only spend a round trip to earn a 401. The
     * caller resets the whole cache instead, which is the honest answer —
     * every entry in it describes a user that no longer exists.
     */
    deleteAccount: build.mutation<{ success: boolean }, DeleteAccountInput>({
      query: (body) => ({ url: "/profile", method: "DELETE", body }),
    }),

    // ── Admin ─────────────────────────────────────────────────────────────
    adminUsers: build.query<AdminUsersResponse, AdminUserFilters>({
      query: (filters) => ({
        url: "/admin/users",
        params: clean({ ...filters }),
      }),
      providesTags: ["AdminUsers"],
    }),
    adminStats: build.query<AdminStats, void>({
      query: () => "/admin/stats",
      providesTags: ["AdminUsers"],
    }),
    setUserStatus: build.mutation<
      { success: boolean },
      { userId: string; status: "ACTIVE" | "DISABLED" }
    >({
      query: ({ userId, status }) => ({
        url: `/admin/users/${userId}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["AdminUsers"],
    }),
    deleteUser: build.mutation<{ success: boolean }, string>({
      query: (userId) => ({ url: `/admin/users/${userId}`, method: "DELETE" }),
      invalidatesTags: ["AdminUsers"],
    }),
  }),
});

export const {
  useMeQuery,
  useSignUpMutation,
  useSignInMutation,
  useSignOutMutation,
  useDashboardQuery,
  useGroupsQuery,
  useGroupQuery,
  useGroupMembersQuery,
  useCreateGroupMutation,
  useUpdateGroupMutation,
  useDeleteGroupMutation,
  useUploadGroupIconMutation,
  useRemoveGroupIconMutation,
  useInviteGroupMembersMutation,
  useRemoveGroupMemberMutation,
  useDirectoryQuery,
  useLookupUserQuery,
  useInvitationsQuery,
  useRespondToInvitationMutation,
  useCancelInvitationMutation,
  useTasksQuery,
  useTaskStatsQuery,
  useTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useAddCommentMutation,
  useToggleChecklistItemMutation,
  useNotificationsQuery,
  useMarkNotificationReadMutation,
  useDeleteNotificationMutation,
  useMarkAllNotificationsReadMutation,
  useSearchQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
  useAdminUsersQuery,
  useAdminStatsQuery,
  useSetUserStatusMutation,
  useDeleteUserMutation,
} = api;
