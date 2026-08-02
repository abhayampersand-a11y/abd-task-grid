"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Users, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { EmptyInboxIllustration } from "@/components/ui/illustrations";
import { PageHeader } from "@/components/ui/page-header";
import { RowSkeleton } from "@/components/ui/skeleton";
import { cn, groupColor, relativeTime } from "@/lib/utils";
import type { InvitationAction } from "@/lib/validation";
import {
  toApiError,
  useInvitationsQuery,
  useRespondToInvitationMutation,
} from "@/store/api";

export function RequestsView() {
  const router = useRouter();
  const { data, isLoading } = useInvitationsQuery(undefined, {
    pollingInterval: 60_000,
  });
  const [respond] = useRespondToInvitationMutation();
  const [busy, setBusy] = useState<{
    id: string;
    action: InvitationAction;
  } | null>(null);

  const invitations = data?.invitations ?? [];

  async function answer(
    invitationId: string,
    action: InvitationAction,
    groupName: string,
    groupId: string,
  ) {
    setBusy({ id: invitationId, action });
    try {
      await respond({ invitationId, action }).unwrap();
      if (action === "ACCEPT") {
        toast.success(`You joined "${groupName}"`, {
          description: "The group and its tasks are now on your dashboard.",
          action: {
            label: "Open group",
            onClick: () => router.push(`/groups/${groupId}`),
          },
        });
      } else {
        toast.success("Request declined", {
          description: `The owner of "${groupName}" has been notified.`,
        });
      }
    } catch (error) {
      toast.error(toApiError(error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Requests"
        description="Group owners who invited you to join. Nothing is shared with you until you accept."
      />

      <div className="card overflow-hidden">
        {isLoading ? (
          <RowSkeleton count={3} />
        ) : invitations.length === 0 ? (
          <EmptyState
            illustration={<EmptyInboxIllustration className="h-32 w-auto" />}
            title="No pending requests"
            description="When somebody invites you to a group, the request lands here for you to accept or decline."
          />
        ) : (
          <ul className="divide-y divide-line">
            {invitations.map((invitation) => {
              const tint = groupColor(invitation.group.colorKey);
              const answering = busy?.id === invitation.id;

              return (
                <li
                  key={invitation.id}
                  className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center"
                >
                  <span
                    className={cn(
                      "flex size-12 shrink-0 items-center justify-center rounded-2xl",
                      tint.chip,
                    )}
                  >
                    <Users className="size-5.5" />
                  </span>

                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-[15px] font-semibold text-ink">
                      {invitation.group.name}
                    </p>
                    <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] text-ink-muted">
                      <Avatar user={invitation.invitedBy} size="xs" />
                      <span className="font-medium text-ink-soft">
                        {invitation.invitedBy.fullName}
                      </span>
                      created this group and asked you to join
                    </p>
                    {invitation.group.description && (
                      <p className="line-clamp-2 text-[12.5px] leading-relaxed text-ink-muted">
                        {invitation.group.description}
                      </p>
                    )}
                    <p className="text-[11.5px] text-ink-faint">
                      {invitation.group.memberCount} member
                      {invitation.group.memberCount === 1 ? "" : "s"} ·{" "}
                      {relativeTime(invitation.createdAt)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2.5">
                    <Button
                      variant="outline"
                      loading={answering && busy?.action === "DECLINE"}
                      disabled={answering}
                      icon={<X className="size-4" />}
                      onClick={() =>
                        answer(
                          invitation.id,
                          "DECLINE",
                          invitation.group.name,
                          invitation.group.id,
                        )
                      }
                    >
                      Decline
                    </Button>
                    <Button
                      loading={answering && busy?.action === "ACCEPT"}
                      disabled={answering}
                      icon={<Check className="size-4" />}
                      onClick={() =>
                        answer(
                          invitation.id,
                          "ACCEPT",
                          invitation.group.name,
                          invitation.group.id,
                        )
                      }
                    >
                      Accept
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
