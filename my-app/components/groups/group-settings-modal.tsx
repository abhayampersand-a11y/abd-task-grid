"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Crown, Trash2, UserMinus, UserPlus } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InputField, TextareaField } from "@/components/ui/field";
import { ConfirmDialog, Modal } from "@/components/ui/modal";
import { Tabs } from "@/components/ui/tabs";
import type { GroupDetail } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import {
  toApiError,
  useAddGroupMembersMutation,
  useDeleteGroupMutation,
  useRemoveGroupMemberMutation,
  useUpdateGroupMutation,
} from "@/store/api";
import { MemberPicker } from "./member-picker";

type Pane = "details" | "members" | "danger";

export function GroupSettingsModal({
  open,
  onClose,
  group,
}: {
  open: boolean;
  onClose: () => void;
  group: GroupDetail;
}) {
  const router = useRouter();
  const isOwner = group.myRole === "OWNER";

  const [pane, setPane] = useState<Pane>("details");
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description ?? "");
  const [newMemberIds, setNewMemberIds] = useState<string[]>([]);
  const [removing, setRemoving] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [updateGroup, { isLoading: saving }] = useUpdateGroupMutation();
  const [addMembers, { isLoading: adding }] = useAddGroupMembersMutation();
  const [removeMember, { isLoading: removingMember }] =
    useRemoveGroupMemberMutation();
  const [deleteGroup, { isLoading: deleting }] = useDeleteGroupMutation();

  const existingIds = group.allMembers.map((member) => member.user.id);

  async function saveDetails() {
    try {
      await updateGroup({ groupId: group.id, name, description }).unwrap();
      toast.success("Group updated");
    } catch (error) {
      toast.error(toApiError(error).message);
    }
  }

  async function inviteMembers() {
    if (newMemberIds.length === 0) return;
    try {
      const { added } = await addMembers({
        groupId: group.id,
        memberIds: newMemberIds,
      }).unwrap();
      toast.success(`${added} member${added === 1 ? "" : "s"} added`);
      setNewMemberIds([]);
    } catch (error) {
      toast.error(toApiError(error).message);
    }
  }

  async function confirmRemove() {
    if (!removing) return;
    try {
      await removeMember({ groupId: group.id, userId: removing }).unwrap();
      toast.success("Member removed");
      setRemoving(null);
    } catch (error) {
      toast.error(toApiError(error).message);
    }
  }

  async function confirmDeleteGroup() {
    try {
      await deleteGroup(group.id).unwrap();
      toast.success("Group deleted");
      setConfirmDelete(false);
      onClose();
      router.push("/groups");
    } catch (error) {
      toast.error(toApiError(error).message);
    }
  }

  const panes: { value: Pane; label: string }[] = [
    { value: "details", label: "Details" },
    { value: "members", label: "Members" },
    ...(isOwner ? [{ value: "danger" as const, label: "Danger zone" }] : []),
  ];

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Group settings"
        description={`Created ${formatDate(group.createdAt)} by ${group.createdBy.fullName}`}
        width="lg"
        footer={
          pane === "details" && isOwner ? (
            <>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={saveDetails} loading={saving}>
                Save changes
              </Button>
            </>
          ) : pane === "members" && isOwner ? (
            <>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button
                onClick={inviteMembers}
                loading={adding}
                disabled={newMemberIds.length === 0}
                icon={<UserPlus className="size-4" />}
              >
                Add {newMemberIds.length || ""} member
                {newMemberIds.length === 1 ? "" : "s"}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )
        }
      >
        <Tabs items={panes} value={pane} onChange={setPane} className="mb-5" />

        {pane === "details" && (
          <div className="space-y-5">
            <InputField
              label="Group name"
              value={name}
              disabled={!isOwner}
              onChange={(event) => setName(event.target.value)}
            />
            <TextareaField
              label="Description"
              rows={4}
              value={description}
              disabled={!isOwner}
              onChange={(event) => setDescription(event.target.value)}
            />
            {!isOwner && (
              <p className="rounded-xl bg-surface-muted px-4 py-3 text-[13px] text-ink-muted">
                Only the group owner can change these settings.
              </p>
            )}
          </div>
        )}

        {pane === "members" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-[13px] font-semibold uppercase tracking-wide text-ink-faint">
                Current members ({group.allMembers.length})
              </h3>
              <ul className="mt-3 divide-y divide-line rounded-xl border border-line">
                {group.allMembers.map((member) => (
                  <li
                    key={member.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <Avatar user={member.user} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold text-ink">
                        {member.user.fullName}
                      </p>
                      <p className="truncate text-[12.5px] text-ink-muted">
                        {member.user.email}
                      </p>
                    </div>
                    {member.role === "OWNER" ? (
                      <Badge
                        className="bg-amber-50 text-amber-700"
                        dot="bg-amber-500"
                      >
                        <Crown className="size-3" />
                        Owner
                      </Badge>
                    ) : (
                      isOwner && (
                        <button
                          type="button"
                          onClick={() => setRemoving(member.user.id)}
                          aria-label={`Remove ${member.user.fullName}`}
                          className="flex size-9 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-rose-50 hover:text-rose-600"
                        >
                          <UserMinus className="size-4" />
                        </button>
                      )
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {isOwner && (
              <div>
                <h3 className="text-[13px] font-semibold uppercase tracking-wide text-ink-faint">
                  Add more members
                </h3>
                <div className="mt-3">
                  <MemberPicker
                    selected={newMemberIds}
                    excludeIds={existingIds}
                    onToggle={(userId) =>
                      setNewMemberIds((current) =>
                        current.includes(userId)
                          ? current.filter((id) => id !== userId)
                          : [...current, userId],
                      )
                    }
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {pane === "danger" && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-5">
            <h3 className="text-[15px] font-semibold text-rose-700">
              Delete this group
            </h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
              Every task, comment, attachment and activity record in{" "}
              <span className="font-semibold">{group.name}</span> will be
              permanently removed. This cannot be undone.
            </p>
            <Button
              variant="danger"
              className="mt-4"
              icon={<Trash2 className="size-4" />}
              onClick={() => setConfirmDelete(true)}
            >
              Delete group
            </Button>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        onConfirm={confirmRemove}
        loading={removingMember}
        title="Remove this member?"
        message="They will immediately lose access to this group's tasks. Tasks already assigned to them stay in place."
        confirmLabel="Remove member"
      />

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={confirmDeleteGroup}
        loading={deleting}
        title={`Delete "${group.name}"?`}
        message="This permanently deletes the group and everything inside it. This action cannot be undone."
        confirmLabel="Delete group"
      />
    </>
  );
}
