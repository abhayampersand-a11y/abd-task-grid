"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Paperclip, Plus, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { InputField, SelectField, TextareaField } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { fromApiFieldErrors, validate, type FieldErrors } from "@/lib/form";
import { createTaskSchema } from "@/lib/validation";
import { PRIORITY_ORDER, PRIORITY_META, STATUS_META } from "@/lib/utils";
import {
  toApiError,
  useCreateTaskMutation,
  useGroupMembersQuery,
  useGroupsQuery,
} from "@/store/api";

const EMPTY = {
  title: "",
  description: "",
  assigneeId: "",
  priority: "MEDIUM" as const,
  status: "TODO" as const,
  dueDate: "",
};

export function AssignTaskModal({
  open,
  onClose,
  groupId: fixedGroupId,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  /** When opened from inside a group, the group is locked. */
  groupId?: string;
  onCreated?: () => void;
}) {
  const { data: groupsData } = useGroupsQuery(undefined, { skip: !open });
  const [createTask, { isLoading }] = useCreateTaskMutation();

  const [chosenGroupId, setChosenGroupId] = useState("");
  const [values, setValues] = useState(EMPTY);
  const [checklist, setChecklist] = useState<string[]>([]);
  const [checklistDraft, setChecklistDraft] = useState("");
  const [attachments, setAttachments] = useState<
    { name: string; url: string; sizeBytes: number; mimeType: string }[]
  >([]);
  const [errors, setErrors] = useState<FieldErrors>({});

  const groups = groupsData?.groups ?? [];

  // Derived rather than synced through an effect: a locked group wins, then
  // the user's pick, then the first group so the form is usable immediately.
  const groupId = fixedGroupId ?? (chosenGroupId || groups[0]?.id) ?? "";

  const { data: membersData } = useGroupMembersQuery(groupId, {
    skip: !open || !groupId,
  });
  const members = membersData?.members ?? [];

  function reset() {
    setValues(EMPTY);
    setChecklist([]);
    setChecklistDraft("");
    setAttachments([]);
    setErrors({});
    setChosenGroupId("");
  }

  function close() {
    reset();
    onClose();
  }

  function addChecklistItem() {
    const label = checklistDraft.trim();
    if (!label || checklist.length >= 20) return;
    setChecklist((items) => [...items, label]);
    setChecklistDraft("");
  }

  function onFilesPicked(fileList: FileList | null) {
    if (!fileList) return;
    // Files are recorded as metadata only — wire up your storage provider to
    // upload the blob and swap `url` for the returned location.
    const picked = Array.from(fileList)
      .slice(0, 10 - attachments.length)
      .map((file) => ({
        name: file.name,
        url: "#",
        sizeBytes: file.size,
        mimeType: file.type || "application/octet-stream",
      }));
    setAttachments((current) => [...current, ...picked]);
  }

  async function submit() {
    const payload = {
      ...values,
      groupId,
      dueDate: values.dueDate || null,
      checklist,
      attachments,
    };

    const result = validate(createTaskSchema, payload);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    try {
      await createTask(payload).unwrap();
      toast.success("Task assigned", {
        description: `"${values.title}" is on its way.`,
      });
      onCreated?.();
      close();
    } catch (error) {
      const apiError = toApiError(error);
      setErrors(fromApiFieldErrors(apiError.fieldErrors));
      toast.error(apiError.message);
    }
  }

  const noGroups = groups.length === 0 && !fixedGroupId;

  return (
    <Modal
      open={open}
      onClose={close}
      title="Assign a new task"
      description="Give it a clear title, an owner and a deadline."
      width="lg"
      footer={
        <>
          <Button variant="outline" onClick={close} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={submit} loading={isLoading} disabled={noGroups}>
            Create Task
          </Button>
        </>
      }
    >
      {noGroups ? (
        <p className="py-6 text-center text-sm text-ink-muted">
          You need to be part of a group before you can assign tasks.
        </p>
      ) : (
        <div className="space-y-5">
          {!fixedGroupId && (
            <SelectField
              label="Group"
              value={groupId}
              error={errors.groupId}
              onChange={(event) => {
                setChosenGroupId(event.target.value);
                setValues((v) => ({ ...v, assigneeId: "" }));
              }}
            >
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </SelectField>
          )}

          <InputField
            label="Task title"
            required
            placeholder="e.g. Finalize V2 design system tokens"
            value={values.title}
            error={errors.title}
            onChange={(event) => {
              setValues((v) => ({ ...v, title: event.target.value }));
              setErrors((e) => ({ ...e, title: undefined }));
            }}
          />

          <TextareaField
            label="Description"
            placeholder="What does done look like?"
            rows={4}
            value={values.description}
            error={errors.description}
            onChange={(event) =>
              setValues((v) => ({ ...v, description: event.target.value }))
            }
          />

          {/* Assignee — only members of the selected group */}
          <div className="space-y-1.5">
            <span className="text-[13px] font-medium text-ink-soft">
              Assign to <span className="text-rose-500">*</span>
            </span>
            <div className="thin-scrollbar max-h-52 space-y-1 overflow-y-auto rounded-xl border border-line bg-surface-muted p-1.5">
              {members.length === 0 ? (
                <p className="px-3 py-4 text-center text-[13px] text-ink-muted">
                  Loading group members…
                </p>
              ) : (
                members.map((member) => {
                  const selected = values.assigneeId === member.user.id;
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => {
                        setValues((v) => ({ ...v, assigneeId: member.user.id }));
                        setErrors((e) => ({ ...e, assigneeId: undefined }));
                      }}
                      className={
                        selected
                          ? "flex w-full items-center gap-3 rounded-lg border border-brand-300 bg-brand-50 px-3 py-2.5 text-left"
                          : "flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-left transition-colors hover:bg-surface"
                      }
                    >
                      <Avatar user={member.user} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-medium text-ink">
                          {member.user.fullName}
                        </span>
                        <span className="block truncate text-xs text-ink-muted">
                          {member.user.jobTitle ?? member.user.email}
                        </span>
                      </span>
                      {selected && (
                        <span className="text-[11px] font-bold uppercase tracking-wide text-brand-600">
                          Selected
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
            {errors.assigneeId && (
              <p className="text-xs font-medium text-rose-600">
                {errors.assigneeId}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <SelectField
              label="Priority"
              value={values.priority}
              onChange={(event) =>
                setValues((v) => ({
                  ...v,
                  priority: event.target.value as typeof v.priority,
                }))
              }
            >
              {PRIORITY_ORDER.map((priority) => (
                <option key={priority} value={priority}>
                  {PRIORITY_META[priority].label}
                </option>
              ))}
            </SelectField>

            <SelectField
              label="Status"
              value={values.status}
              onChange={(event) =>
                setValues((v) => ({
                  ...v,
                  status: event.target.value as typeof v.status,
                }))
              }
            >
              {(["BACKLOG", "TODO", "IN_PROGRESS"] as const).map((status) => (
                <option key={status} value={status}>
                  {STATUS_META[status].label}
                </option>
              ))}
            </SelectField>

            <InputField
              label="Due date"
              type="date"
              value={values.dueDate}
              error={errors.dueDate}
              onChange={(event) =>
                setValues((v) => ({ ...v, dueDate: event.target.value }))
              }
            />
          </div>

          {/* Checklist */}
          <div className="space-y-2">
            <span className="text-[13px] font-medium text-ink-soft">
              Checklist{" "}
              <span className="font-normal text-ink-faint">(optional)</span>
            </span>

            {checklist.length > 0 && (
              <ul className="space-y-1.5">
                {checklist.map((label, index) => (
                  <li
                    key={`${label}-${index}`}
                    className="flex items-center gap-2.5 rounded-lg border border-line bg-surface-muted px-3 py-2"
                  >
                    <span className="size-4 shrink-0 rounded border border-line-strong bg-surface" />
                    <span className="min-w-0 flex-1 truncate text-[13.5px] text-ink-soft">
                      {label}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setChecklist((items) =>
                          items.filter((_, i) => i !== index),
                        )
                      }
                      aria-label={`Remove ${label}`}
                      className="text-ink-faint hover:text-rose-600"
                    >
                      <X className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex gap-2">
              <input
                value={checklistDraft}
                onChange={(event) => setChecklistDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addChecklistItem();
                  }
                }}
                placeholder="Add a step and press Enter"
                className="h-11 flex-1 rounded-xl border border-line bg-surface-muted px-3.5 text-sm text-ink placeholder:text-ink-faint focus:border-brand-400 focus:bg-surface focus:ring-4 focus:ring-brand-500/10 focus:outline-none"
              />
              <Button
                variant="outline"
                onClick={addChecklistItem}
                icon={<Plus className="size-4" />}
              >
                Add
              </Button>
            </div>
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <span className="text-[13px] font-medium text-ink-soft">
              Attachments{" "}
              <span className="font-normal text-ink-faint">(optional)</span>
            </span>

            {attachments.length > 0 && (
              <ul className="space-y-1.5">
                {attachments.map((file, index) => (
                  <li
                    key={`${file.name}-${index}`}
                    className="flex items-center gap-2.5 rounded-lg border border-line bg-surface-muted px-3 py-2"
                  >
                    <Paperclip className="size-3.5 shrink-0 text-ink-faint" />
                    <span className="min-w-0 flex-1 truncate text-[13.5px] text-ink-soft">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setAttachments((files) =>
                          files.filter((_, i) => i !== index),
                        )
                      }
                      aria-label={`Remove ${file.name}`}
                      className="text-ink-faint hover:text-rose-600"
                    >
                      <X className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong bg-surface-muted px-4 py-4 text-[13px] font-medium text-ink-muted transition-colors hover:border-brand-300 hover:bg-brand-50/40 hover:text-brand-700">
              <Paperclip className="size-4" />
              Attach files
              <input
                type="file"
                multiple
                className="sr-only"
                onChange={(event) => onFilesPicked(event.target.files)}
              />
            </label>
          </div>
        </div>
      )}
    </Modal>
  );
}
