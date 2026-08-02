"use client";

import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

const CONTROL =
  "w-full rounded-xl border bg-surface-muted text-sm text-ink transition-all duration-200 " +
  "placeholder:text-ink-faint focus:bg-surface focus:border-brand-400 " +
  "focus:ring-4 focus:ring-brand-500/10 focus:outline-none disabled:opacity-60";

function Shell({
  label,
  hint,
  error,
  required,
  htmlFor,
  action,
  children,
}: {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  htmlFor: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      {(label || action) && (
        <div className="flex items-baseline justify-between gap-3">
          {label && (
            <label
              htmlFor={htmlFor}
              className="text-[13px] font-medium text-ink-soft"
            >
              {label}
              {required && <span className="ml-0.5 text-rose-500">*</span>}
            </label>
          )}
          {action}
        </div>
      )}
      {children}
      {error ? (
        <p className="text-xs font-medium text-rose-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export interface InputFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: ReactNode;
  trailing?: ReactNode;
  action?: ReactNode;
}

export function InputField({
  label,
  hint,
  error,
  icon,
  trailing,
  action,
  className,
  id,
  required,
  ...props
}: InputFieldProps) {
  const generated = useId();
  const fieldId = id ?? generated;

  return (
    <Shell
      label={label}
      hint={hint}
      error={error}
      required={required}
      htmlFor={fieldId}
      action={action}
    >
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint [&>svg]:size-4.5">
            {icon}
          </span>
        )}
        <input
          id={fieldId}
          required={required}
          aria-invalid={Boolean(error)}
          className={cn(
            CONTROL,
            "h-11.5 px-3.5",
            icon && "pl-11",
            trailing && "pr-11",
            error && "border-rose-300 bg-rose-50/40 focus:border-rose-400 focus:ring-rose-500/10",
            className,
          )}
          {...props}
        />
        {trailing && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2">
            {trailing}
          </span>
        )}
      </div>
    </Shell>
  );
}

export interface TextareaFieldProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function TextareaField({
  label,
  hint,
  error,
  className,
  id,
  required,
  rows = 4,
  ...props
}: TextareaFieldProps) {
  const generated = useId();
  const fieldId = id ?? generated;

  return (
    <Shell
      label={label}
      hint={hint}
      error={error}
      required={required}
      htmlFor={fieldId}
    >
      <textarea
        id={fieldId}
        rows={rows}
        required={required}
        aria-invalid={Boolean(error)}
        className={cn(
          CONTROL,
          "resize-none px-3.5 py-3 leading-relaxed",
          error && "border-rose-300 bg-rose-50/40",
          className,
        )}
        {...props}
      />
    </Shell>
  );
}

export interface SelectFieldProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function SelectField({
  label,
  hint,
  error,
  className,
  id,
  required,
  children,
  ...props
}: SelectFieldProps) {
  const generated = useId();
  const fieldId = id ?? generated;

  return (
    <Shell
      label={label}
      hint={hint}
      error={error}
      required={required}
      htmlFor={fieldId}
    >
      <select
        id={fieldId}
        required={required}
        aria-invalid={Boolean(error)}
        className={cn(
          CONTROL,
          "h-11.5 cursor-pointer appearance-none bg-[length:16px] bg-[right_0.9rem_center] bg-no-repeat px-3.5 pr-10",
          "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke-width=%222%22 stroke=%22%23767c92%22><path stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22m19.5 8.25-7.5 7.5-7.5-7.5%22/></svg>')]",
          error && "border-rose-300",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </Shell>
  );
}

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
}

export function Checkbox({ label, className, id, ...props }: CheckboxProps) {
  const generated = useId();
  const fieldId = id ?? generated;

  return (
    <div className="flex items-start gap-2.5">
      <input
        id={fieldId}
        type="checkbox"
        className={cn(
          "mt-0.5 size-4.5 shrink-0 cursor-pointer appearance-none rounded-[5px] border border-line-strong bg-surface",
          "transition-all duration-150 checked:border-brand-600 checked:bg-brand-600 dark:checked:border-brand-500 dark:checked:bg-brand-500",
          "checked:bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22white%22 stroke-width=%223%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><polyline points=%2220 6 9 17 4 12%22/></svg>')]",
          "checked:bg-[length:13px] checked:bg-center checked:bg-no-repeat",
          "hover:border-brand-400 focus-visible:ring-4 focus-visible:ring-brand-500/15",
          className,
        )}
        {...props}
      />
      {label && (
        <label
          htmlFor={fieldId}
          className="cursor-pointer text-sm leading-5 text-ink-soft"
        >
          {label}
        </label>
      )}
    </div>
  );
}
