import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo, LogoMark } from "@/components/ui/logo";

/**
 * Chrome for the legal pages.
 *
 * This is a nested route group so it wraps `/privacy` and `/terms` without
 * touching `(marketing)/page.tsx`, which carries its own marketing header and
 * footer. URLs are unaffected: `(legal)` contributes no path segment.
 */

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="sticky top-0 z-40 border-b border-line bg-surface/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
          <Link href="/" className="shrink-0">
            <Logo showMark />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {LEGAL_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3.5 py-2 text-[13.5px] font-medium text-ink-muted transition-colors hover:bg-brand-50 hover:text-brand-700"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link href="/">
            <Button variant="ghost" size="sm" icon={<ArrowLeft className="size-4" />}>
              Back to site
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-line bg-surface-muted">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-2.5">
            <LogoMark className="size-8" />
            <Logo />
          </div>

          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {[{ label: "Home", href: "/" }, ...LEGAL_LINKS].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[13.5px] text-ink-muted transition-colors hover:text-brand-700"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="border-t border-line">
          <div className="mx-auto w-full max-w-7xl px-5 py-5 text-[12.5px] text-ink-faint sm:px-8">
            <p>
              © {new Date().getFullYear()} ABD Tech. Taskgrid on Google Play and
              TaskFlow Pro on the web are the same service.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
