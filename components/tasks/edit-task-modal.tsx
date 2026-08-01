"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { InputField, SelectField, TextareaField } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { fromApiFieldErrors, type FieldErrors } from "@/lib/form";
import {
  PRIORITY_META,
  PRIORITY_ORDER,
  STATUS_META,
  STATUS_ORDER,
  toDateInputValue,
} from "@/lib/utils";
import type { TaskSummary } from "@/lib/types";
import {
  toApiError,
  useGroupMembersQuery,
  useUpdateTaskMutation,
} from "@/store/api";

export function EditTaskModal({
  task,
  groupId,
  open,
  onClose,
}: {
  task: TaskSummary;
  groupId: string;
  open: boolean;
  onClose: () => void;
}) {
  const [updateTask, { isLoading }] = useUpdateTaskMutation();
  const { data: membersData } = useGroupMembersQuery(groupId, { skip: !open });

  const [values, setValues] = useState({
    title: task.title,
    description: task.description ?? "",
    assigneeId: task.assignee?.id ?? "",
    priority: task.priority,
    status: task.status,
    dueDate: toDateInputValue(task.dueDate),
    progress: task.progress,
  });
  const [errors, setErrors] = useState<FieldErrors>({});

  const members = membersData?.members ?? [];

  async function submit() {
    try {
      await updateTask({
        taskId: task.id,
        title: values.title,
        description: values.description || null,
        assigneeId: values.assigneeId || null,
        priority: values.priority,
        status: values.status,
        dueDate: values.dueDate || null,
        progress: values.progress,
      }).unwrap();

      toast.success("Task updated");
      onClose();
    } catch (error) {
      const apiError = toApiError(error);
      setErrors(fromApiFieldErrors(apiError.fieldErrors));
      toast.error(apiError.message);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit task"
      description="Change the scope, owner or deadline of this task."
      width="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={submit} loading={isLoading}>
            Save changes
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <InputField
          label="Task title"
          value={values.title}
          error={errors.title}
          onChange={(event) =>
            setValues((v) => ({ ...v, title: event.target.value }))
          }
        />

        <TextareaField
          label="Description"
          rows={4}
          value={values.description}
          error={errors.description}
          onChange={(event) =>
            setValues((v) => ({ ...v, description: event.target.value }))
          }
        />

        <SelectField
          label="Assign to"
          value={values.assigneeId}
          error={errors.assigneeId}
          onChange={(event) =>
            setValues((v) => ({ ...v, assigneeId: event.target.value }))
          }
        >
          <option value="">Unassigned</option>
          {members.map((member) => (
            <option key={member.id} value={member.user.id}>
              {member.user.fullName}
            </option>
          ))}
        </SelectField>

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
            {STATUS_ORDER.map((status) => (
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

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-ink-soft">
              Progress
            </span>
            <span className="text-[13px] font-semibold text-brand-600">
              {values.progress}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={values.progress}
            onChange={(event) =>
              setValues((v) => ({ ...v, progress: Number(event.target.value) }))
            }
            className="w-full accent-brand-600"
          />
        </div>
      </div>
    </Modal>
  );
}
