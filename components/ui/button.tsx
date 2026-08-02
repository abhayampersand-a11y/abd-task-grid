"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "danger"
  | "subtle"
  | "aqua";
type Size = "sm" | "md" | "lg" | "icon";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white shadow-pop hover:bg-brand-700 active:bg-brand-800",
  secondary: "bg-ink text-white hover:bg-ink/90 active:bg-ink shadow-soft",
  outline:
    "border border-line-strong bg-surface text-ink hover:border-brand-300 hover:bg-brand-50/60",
  ghost: "text-ink-soft hover:bg-brand-50 hover:text-brand-700",
  subtle: "bg-brand-100 text-brand-700 hover:bg-brand-200",
  aqua: "bg-aqua-500 text-white hover:bg-aqua-600 shadow-soft",
  danger:
    "border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:border-rose-300",
};

/** Controls are pill-shaped throughout the candy theme. */
const SIZES: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px] gap-1.5 rounded-full",
  md: "h-11 px-5 text-sm gap-2 rounded-full",
  lg: "h-14 px-7 text-[15px] gap-2.5 rounded-full",
  icon: "size-11 justify-center rounded-full",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconRight,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-all duration-200",
        "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-55 disabled:active:scale-100",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : icon}
      {children}
      {!loading && iconRight}
    </button>
  );
}

/** Floating action button — bottom-right on mobile, above the tab bar. */
export function Fab({
  onClick,
  label,
  icon,
  className,
}: {
  onClick: () => void;
  label: string;
  icon: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "fixed right-5 z-30 flex size-15 items-center justify-center rounded-full",
        "bg-brand-600 text-white shadow-pop transition-transform active:scale-95",
        "bottom-[calc(5.5rem+env(safe-area-inset-bottom))] lg:bottom-8 lg:hidden",
        className,
      )}
    >
      {icon}
    </button>
  );
}
