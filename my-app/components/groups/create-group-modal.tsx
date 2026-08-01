"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Globe, Info, Lock, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputField, TextareaField } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { fromApiFieldErrors, validate, type FieldErrors } from "@/lib/form";
import { createGroupSchema } from "@/lib/validation";
import { cn, GROUP_COLORS, groupColor } from "@/lib/utils";
import { toApiError, useCreateGroupMutation } from "@/store/api";
import { MemberPicker } from "./member-picker";

const COLOR_KEYS = Object.keys(GROUP_COLORS);

export function CreateGroupModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: (groupId: string) => void;
}) {
  const [createGroup, { isLoading }] = useCreateGroupMutation();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PRIVATE");
  const [colorKey, setColorKey] = useState("indigo");
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});

  function reset() {
    setName("");
    setDescription("");
    setVisibility("PRIVATE");
    setColorKey("indigo");
    setMemberIds([]);
    setErrors({});
  }

  function close() {
    reset();
    onClose();
  }

  async function submit() {
    const payload = { name, description, visibility, colorKey, memberIds };

    const result = validate(createGroupSchema, payload);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    try {
      const { group } = await createGroup(payload).unwrap();
      toast.success("Group created", {
        description: `"${group.name}" is ready. You are the owner.`,
      });
      onCreated?.(group.id);
      close();
    } catch (error) {
      const apiError = toApiError(error);
      setErrors(fromApiFieldErrors(apiError.fieldErrors));
      toast.error(apiError.message);
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Establish your team"
      description="Organize members and collaborate on specialized projects within a unified group space."
      width="xl"
      footer={
        <>
          <Button variant="outline" onClick={close} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            loading={isLoading}
            iconRight={<ArrowRight className="size-4" />}
          >
            Create Group
          </Button>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Identity ──────────────────────────────────────────────── */}
        <section className="space-y-5 rounded-2xl border border-line bg-surface-muted p-5">
          <header className="flex items-center gap-2.5">
            <Info className="size-4.5 text-brand-600" />
            <h3 className="text-[15px] font-semibold text-ink">Identity</h3>
          </header>

          <InputField
            label="Group Name"
            required
            placeholder="e.g. Design Systems"
            className="bg-surface"
            value={name}
            error={errors.name}
            onChange={(event) => {
              setName(event.target.value);
              setErrors((e) => ({ ...e, name: undefined }));
            }}
          />

          <TextareaField
            label="Description"
            placeholder="What is the primary objective of this group?"
            rows={4}
            className="bg-surface"
            value={description}
            error={errors.description}
            onChange={(event) => setDescription(event.target.value)}
          />

          <div className="space-y-2">
            <span className="text-[13px] font-medium text-ink-soft">
              Group Visibility
            </span>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { value: "PUBLIC", label: "Public", icon: Globe },
                  { value: "PRIVATE", label: "Private", icon: Lock },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setVisibility(option.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border px-4 py-4 transition-all",
                    visibility === option.value
                      ? "border-brand-500 bg-brand-50 text-brand-700 ring-4 ring-brand-500/10"
                      : "border-line bg-surface text-ink-muted hover:border-line-strong",
                  )}
                >
                  <option.icon className="size-4.5" />
                  <span className="text-[13px] font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[13px] font-medium text-ink-soft">
              Accent colour
            </span>
            <div className="flex flex-wrap gap-2">
              {COLOR_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setColorKey(key)}
                  aria-label={`Use ${key} accent`}
                  className={cn(
                    "size-9 rounded-xl transition-all",
                    groupColor(key).chip,
                    colorKey === key
                      ? "ring-2 ring-brand-500 ring-offset-2"
                      : "hover:scale-105",
                  )}
                >
                  <span
                    className={cn(
                      "mx-auto block size-2.5 rounded-full",
                      groupColor(key).dot,
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Members ───────────────────────────────────────────────── */}
        <section className="flex min-h-0 flex-col space-y-4 rounded-2xl border border-line bg-surface-muted p-5">
          <header className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <UserPlus className="size-4.5 text-brand-600" />
              <h3 className="text-[15px] font-semibold text-ink">Add Members</h3>
            </div>
            <span className="rounded-full bg-brand-600 px-2.5 py-1 text-[11px] font-bold text-white">
              {memberIds.length} Selected
            </span>
          </header>

          <MemberPicker
            selected={memberIds}
            onToggle={(userId) =>
              setMemberIds((current) =>
                current.includes(userId)
                  ? current.filter((id) => id !== userId)
                  : [...current, userId],
              )
            }
          />

          <p className="text-[12.5px] leading-relaxed text-ink-muted">
            You are added automatically as the group owner. Members can be
            invited or removed at any time from the group settings.
          </p>
        </section>
      </div>
    </Modal>
  );
}
