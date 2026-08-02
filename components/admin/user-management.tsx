"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Ban,
  CheckCircle2,
  Clock,
  Download,
  ListFilter,
  Search,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { UserStatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { RowSkeleton, StatSkeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatDate } from "@/lib/utils";
import type { AdminUserRow } from "@/lib/types";
import {
  toApiError,
  useAdminUsersQuery,
  useDeleteUserMutation,
  useSetUserStatusMutation,
} from "@/store/api";

const SELECT =
  "h-10.5 rounded-xl border border-line bg-surface px-3.5 pr-9 text-[13px] font-medium text-ink-soft " +
  "appearance-none bg-[length:14px] bg-[right_0.7rem_center] bg-no-repeat cursor-pointer " +
  "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke-width=%222%22 stroke=%22%23767c92%22><path stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22m19.5 8.25-7.5 7.5-7.5-7.5%22/></svg>')] " +
  "focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 focus:outline-none";

export function UserManagement() {
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  const [status, setStatus] = useState("ALL");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const [toggling, setToggling] = useState<AdminUserRow | null>(null);
  const [deleting, setDeleting] = useState<AdminUserRow | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(term.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [term]);

  const { data, isLoading, isFetching } = useAdminUsersQuery({
    q: debounced || undefined,
    status,
    sort,
    page,
  });

  const [setUserStatus, { isLoading: updatingStatus }] =
    useSetUserStatusMutation();
  const [deleteUser, { isLoading: deletingUser }] = useDeleteUserMutation();

  const users = data?.items ?? [];
  const totals = data?.totals;

  async function confirmToggle() {
    if (!toggling) return;
    const next = toggling.status === "DISABLED" ? "ACTIVE" : "DISABLED";
    try {
      await setUserStatus({ userId: toggling.id, status: next }).unwrap();
      toast.success(
        next === "ACTIVE"
          ? `${toggling.fullName} can sign in again`
          : `${toggling.fullName} has been disabled`,
      );
      setToggling(null);
    } catch (error) {
      toast.error(toApiError(error).message);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await deleteUser(deleting.id).unwrap();
      toast.success(`${deleting.fullName} was deleted`);
      setDeleting(null);
    } catch (error) {
      toast.error(toApiError(error).message);
    }
  }

  function exportCsv() {
    const header = ["Name", "Email", "Mobile", "Status", "Joined", "Groups", "Tasks"];
    const rows = users.map((user) => [
      user.fullName,
      user.email,
      user.mobile,
      user.status,
      formatDate(user.createdAt),
      String(user.groupCount),
      String(user.taskCount),
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `taskflow-users-page-${page}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="User Management"
        description="Manage organization members, permissions and security settings."
        actions={
          <>
            <Button
              variant="outline"
              icon={<Download className="size-4" />}
              onClick={exportCsv}
              disabled={users.length === 0}
            >
              Export CSV
            </Button>
            <Button
              icon={<UserPlus className="size-4" />}
              onClick={() =>
                toast.info(
                  "Users register themselves from the sign-up page — no invitation needed.",
                )
              }
            >
              Invite User
            </Button>
          </>
        }
      />

      {isLoading || !totals ? (
        <StatSkeleton />
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total users"
            value={totals.all.toLocaleString()}
            icon={Users}
            tone="brand"
          />
          <StatCard
            label="Active"
            value={totals.active.toLocaleString()}
            icon={UserCheck}
            tone="success"
          />
          <StatCard
            label="Pending"
            value={totals.pending.toLocaleString()}
            icon={Clock}
            tone="warning"
          />
          <StatCard
            label="Disabled"
            value={totals.disabled.toLocaleString()}
            icon={Ban}
            tone="danger"
          />
        </section>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-ink-faint" />
          <input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search by name, email or mobile…"
            aria-label="Search users"
            className="h-10.5 w-full rounded-xl border border-line bg-surface pl-11 pr-3.5 text-sm text-ink placeholder:text-ink-faint focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 focus:outline-none"
          />
        </div>

        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          aria-label="Filter by status"
          className={SELECT}
        >
          <option value="ALL">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="PENDING">Pending</option>
          <option value="DISABLED">Disabled</option>
        </select>

        <select
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          aria-label="Sort users"
          className={SELECT}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name">Name A–Z</option>
        </select>

        <span className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-faint">
          <ListFilter className="size-3.5" />
          {data?.total ?? 0} result{data?.total === 1 ? "" : "s"}
        </span>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <RowSkeleton count={8} />
        ) : users.length === 0 ? (
          <EmptyState
            title="No users match your filters"
            description="Try a different search term or clear the status filter."
          />
        ) : (
          <>
            {/* Phone: stacked cards. A 7-column table is unusable at 390px. */}
            <ul className="divide-y divide-line lg:hidden">
              {users.map((user) => (
                <li key={user.id} className="flex items-start gap-3 p-4">
                  <Avatar user={user} size="lg" />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-[15px] font-semibold text-ink">
                        {user.fullName}
                      </p>
                      <UserStatusBadge status={user.status} />
                    </div>
                    <p className="mt-0.5 truncate text-[12.5px] text-ink-muted">
                      {user.email}
                    </p>
                    <p className="truncate text-[12.5px] text-ink-muted">
                      {user.mobile}
                    </p>
                    <p className="mt-1.5 text-[11.5px] text-ink-faint">
                      Joined {formatDate(user.createdAt)} · {user.groupCount}{" "}
                      group{user.groupCount === 1 ? "" : "s"} · {user.taskCount}{" "}
                      task{user.taskCount === 1 ? "" : "s"}
                    </p>

                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setToggling(user)}
                        className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-line bg-surface px-3.5 text-[12.5px] font-semibold text-ink-soft active:bg-surface-muted"
                      >
                        {user.status === "DISABLED" ? (
                          <>
                            <CheckCircle2 className="size-4" />
                            Enable
                          </>
                        ) : (
                          <>
                            <Ban className="size-4" />
                            Disable
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(user)}
                        className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 text-[12.5px] font-semibold text-rose-600 active:bg-rose-100"
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[840px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-line bg-surface-muted">
                    {[
                      "Name",
                      "Email address",
                      "Mobile",
                      "Joined date",
                      "Groups",
                      "Status",
                      "Actions",
                    ].map((heading) => (
                      <th
                        key={heading}
                        scope="col"
                        className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody
                  className={
                    isFetching ? "divide-y divide-line opacity-60" : "divide-y divide-line"
                  }
                >
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="transition-colors hover:bg-surface-muted"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar user={user} size="md" />
                          <div className="min-w-0">
                            <p className="truncate text-[14px] font-semibold text-ink">
                              {user.fullName}
                            </p>
                            {user.jobTitle && (
                              <p className="truncate text-[12px] text-ink-muted">
                                {user.jobTitle}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[13.5px] text-ink-soft">
                        {user.email}
                      </td>
                      <td className="px-5 py-4 text-[13.5px] text-ink-soft">
                        {user.mobile}
                      </td>
                      <td className="px-5 py-4 text-[13.5px] text-ink-soft">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-5 py-4 text-[13.5px] text-ink-soft">
                        {user.groupCount} · {user.taskCount} tasks
                      </td>
                      <td className="px-5 py-4">
                        <UserStatusBadge status={user.status} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setToggling(user)}
                            aria-label={
                              user.status === "DISABLED"
                                ? `Enable ${user.fullName}`
                                : `Disable ${user.fullName}`
                            }
                            title={
                              user.status === "DISABLED"
                                ? "Enable account"
                                : "Disable account"
                            }
                            className="flex size-9 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-brand-50 hover:text-brand-600"
                          >
                            {user.status === "DISABLED" ? (
                              <CheckCircle2 className="size-4.5" />
                            ) : (
                              <Ban className="size-4.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleting(user)}
                            aria-label={`Delete ${user.fullName}`}
                            title="Delete user"
                            className="flex size-9 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 className="size-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-line">
              <Pagination
                page={data!.page}
                totalPages={data!.totalPages}
                onChange={setPage}
                summary={`Showing ${
                  (data!.page - 1) * data!.pageSize + 1
                } to ${Math.min(
                  data!.page * data!.pageSize,
                  data!.total,
                )} of ${data!.total.toLocaleString()} users`}
              />
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(toggling)}
        onClose={() => setToggling(null)}
        onConfirm={confirmToggle}
        loading={updatingStatus}
        tone={toggling?.status === "DISABLED" ? "primary" : "danger"}
        title={
          toggling?.status === "DISABLED"
            ? "Re-enable this account?"
            : "Disable this account?"
        }
        message={
          toggling?.status === "DISABLED"
            ? `${toggling?.fullName} will be able to sign in and access their groups again.`
            : `${toggling?.fullName} will be signed out and blocked from signing in. Their tasks and group memberships are kept.`
        }
        confirmLabel={
          toggling?.status === "DISABLED" ? "Enable account" : "Disable account"
        }
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={deletingUser}
        title="Permanently delete this user?"
        message={`${deleting?.fullName ?? ""} will be removed along with the groups they own, their comments and their activity history. This cannot be undone.`}
        confirmLabel="Delete user"
      />
    </div>
  );
}
