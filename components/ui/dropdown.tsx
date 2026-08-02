"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

/**
 * Anchored popover on desktop; a bottom action sheet below `sm`, where a
 * small floating menu is awkward to hit with a thumb. Same children, same
 * handlers — only the presentation differs.
 */
export function Dropdown({
  trigger,
  children,
  align = "end",
  className,
  panelClassName,
  /** Heading shown only in the mobile action sheet. */
  sheetTitle,
}: {
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode;
  children: (props: { close: () => void }) => ReactNode;
  align?: "start" | "end";
  className?: string;
  panelClassName?: string;
  sheetTitle?: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPhone, setIsPhone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 639px)");
    const sync = () => setIsPhone(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Lock the page while the sheet is up.
  useEffect(() => {
    if (!open || !isPhone) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open, isPhone]);

  const close = () => setOpen(false);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {trigger({ open, toggle: () => setOpen((value) => !value) })}

      {open && isPhone && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-50 flex items-end sm:hidden">
              <div
                className="absolute inset-0 bg-ink/35 backdrop-blur-[2px]"
                onClick={close}
                aria-hidden
              />
              <div
                role="menu"
                className="relative max-h-[80dvh] w-full overflow-y-auto scroll-contain rounded-t-3xl bg-surface p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-overlay animate-sheet-up"
              >
                <span
                  className="mx-auto mb-1 mt-1.5 block h-1 w-10 rounded-full bg-line-strong"
                  aria-hidden
                />
                {sheetTitle && (
                  <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                    {sheetTitle}
                  </p>
                )}
                {children({ close })}
              </div>
            </div>,
            document.body,
          )
        : open && (
            <div
              role="menu"
              className={cn(
                "absolute z-40 mt-2 min-w-52 overflow-hidden rounded-xl border border-line bg-surface p-1.5 shadow-float animate-scale-in",
                align === "end" ? "right-0" : "left-0",
                panelClassName,
              )}
            >
              {children({ close })}
            </div>
          )}
    </div>
  );
}

export function DropdownItem({
  children,
  onClick,
  icon,
  tone = "default",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  icon?: ReactNode;
  tone?: "default" | "danger";
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        // 44px tall on touch, tighter on desktop.
        "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-[15px] font-medium transition-colors sm:gap-2.5 sm:py-2 sm:text-sm",
        "disabled:pointer-events-none disabled:opacity-50",
        tone === "danger"
          ? "text-rose-600 active:bg-rose-50 hover:bg-rose-50"
          : "text-ink-soft active:bg-brand-50 hover:bg-brand-50 hover:text-brand-700",
      )}
    >
      {icon && <span className="[&>svg]:size-4.5 sm:[&>svg]:size-4">{icon}</span>}
      {children}
    </button>
  );
}

export function DropdownSeparator() {
  return <div className="my-1.5 h-px bg-line" />;
}

export function DropdownLabel({ children }: { children: ReactNode }) {
  return (
    <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
      {children}
    </p>
  );
}
