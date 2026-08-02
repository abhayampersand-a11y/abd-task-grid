"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Sparkles, UserPlus, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { EmptyGroupsIllustration } from "@/components/ui/illustrations";
import { RowSkeleton, StatSkeleton } from "@/components/ui/skeleton";
import { CreateGroupModal } from "@/components/groups/create-group-modal";
import { TaskBoard } from "@/components/tasks/task-board";
import type { UserSummary } from "@/lib/types";
import { useDashboardQuery } from "@/store/api";

export function DashboardView() {
  const router = useRouter();
  const { data, isLoading } = useDashboardQuery();
  const [createOpen, setCreateOpen] = useState(false);

  // People the viewer actually shares a group with — drives the
  // "Assigned To"/"Assigned By" filters.
  const people = useMemo<UserSummary[]>(() => {
    const seen = new Map<string, UserSummary>();
    for (const group of data?.groups ?? []) {
      for (const member of group.members) seen.set(member.id, member);
    }
    return [...seen.values()].sort((a, b) =>
      a.fullName.localeCompare(b.fullName),
    );
  }, [data]);

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-56 animate-shimmer rounded-lg bg-line/70" />
        <StatSkeleton count={5} />
        <div className="card overflow-hidden">
          <RowSkeleton count={6} />
        </div>
      </div>
    );
  }

  // ── Condition 1: not part of any group ────────────────────────────────
  if (data.groups.length === 0) {
    return (
      <>
        <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center">
          <EmptyState
            illustration={<EmptyGroupsIllustration className="h-52 w-auto" />}
            title="You are not part of any group yet"
            description="Collaborate with your team by joining an existing workspace or creating a brand new group to manage your projects."
            actions={
              <>
                <Button
                  size="lg"
                  icon={<UserPlus className="size-4.5" />}
                  onClick={() => setCreateOpen(true)}
                >
                  Create Group
                </Button>
                <Link href="/groups">
                  <Button size="lg" variant="outline" className="w-full">
                    Browse Groups
                  </Button>
                </Link>
              </>
            }
            footnote={
              <>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="size-3.5" />
                  Secure workspaces
                </span>
                <span className="inline-flex items-center gap-2">
                  <Zap className="size-3.5" />
                  Real-time sync
                </span>
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="size-3.5" />
                  Activity insights
                </span>
              </>
            }
          />
        </div>

        <CreateGroupModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreated={(groupId) => router.push(`/groups/${groupId}`)}
        />
      </>
    );
  }

  // ── Condition 2: has groups ───────────────────────────────────────────
  return <TaskBoard people={people} />;
}
