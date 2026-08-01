import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-canvas px-5 py-12">
      <div
        className="pointer-events-none absolute -left-40 -top-40 size-[520px] rounded-full bg-brand-100/40 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-48 -right-40 size-[520px] rounded-full bg-brand-100/30 blur-3xl"
        aria-hidden
      />
      <div className="relative w-full">{children}</div>
    </div>
  );
}
