"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CirclePlus, Plus } from "lucide-react";
import { Button, Fab } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { EmptyGroupsIllustration } from "@/components/ui/illustrations";
import { PageHeader } from "@/components/ui/page-header";
import { CardSkeleton } from "@/components/ui/skeleton";
import { useGroupsQuery } from "@/store/api";
import { CreateGroupModal } from "./create-group-modal";
import { GroupCard } from "./group-card";

export function GroupsView() {
  const router = useRouter();
  const { data, isLoading } = useGroupsQuery();
  const [createOpen, setCreateOpen] = useState(false);

  const groups = data?.groups ?? [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="My Groups"
        description="Manage your team environments and collaborative task boards."
        actions={
          <Button
            icon={<CirclePlus className="size-4.5" />}
            onClick={() => setCreateOpen(true)}
          >
            Create New Group
          </Button>
        }
      />

      {isLoading ? (
        <CardSkeleton count={6} />
      ) : groups.length === 0 ? (
        <EmptyState
          illustration={<EmptyGroupsIllustration className="h-48 w-auto" />}
          title="You are not part of any group yet"
          description="Collaborate with your team by joining an existing workspace or creating a brand new group to manage your projects."
          actions={
            <Button
              size="lg"
              icon={<Plus className="size-4.5" />}
              onClick={() => setCreateOpen(true)}
            >
              Create Group
            </Button>
          }
        />
      ) : (
        <>
          {/* Group grid */}
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}

            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-line-strong bg-surface/40 p-6 text-center transition-all hover:border-brand-300 hover:bg-brand-50/40"
            >
              <span className="flex size-14 items-center justify-center rounded-full bg-surface-muted text-ink-muted">
                <Plus className="size-6" />
              </span>
              <span className="text-[15px] font-semibold text-ink">
                Create Another Group
              </span>
              <span className="text-[13px] text-ink-muted">
                Organize your projects efficiently
              </span>
            </button>
          </section>
        </>
      )}

      <Fab
        onClick={() => setCreateOpen(true)}
        label="Create a new group"
        icon={<Plus className="size-7" />}
      />

      <CreateGroupModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(groupId) => router.push(`/groups/${groupId}`)}
      />
    </div>
  );
}
