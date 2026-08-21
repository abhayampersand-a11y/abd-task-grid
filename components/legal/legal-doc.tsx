import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Typography and layout primitives shared by /privacy and /terms.
 *
 * These exist instead of a `prose` reset because the project has no
 * `@tailwindcss/typography` dependency, and a legal page needs tighter control
 * over rhythm than a generic reset gives — numbered sections, anchored
 * headings, and data tables that have to stay readable on a phone, which is
 * where store reviewers open these as often as on a desktop.
 */

export interface LegalSection {
  id: string;
  title: string;
}

/* ── Page furniture ──────────────────────────────────────────────────────── */

export function LegalHero({
  eyebrow,
  title,
  summary,
  updated,
  effective,
}: {
  eyebrow: string;
  title: string;
  summary: string;
  updated: string;
  effective: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-gradient-to-b from-brand-50/70 via-surface to-surface">
      <div
        className="pointer-events-none absolute -right-40 -top-48 size-[520px] rounded-full bg-brand-200/25 blur-3xl"
        aria-hidden
      />
      <div className="mx-auto w-full max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
        <span className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-[12.5px] font-semibold text-brand-700">
          {eyebrow}
        </span>

        <h1 className="mt-6 text-balance text-3xl font-bold leading-[1.1] tracking-tight text-ink sm:text-[44px]">
          {title}
        </h1>

        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
          {summary}
        </p>

        <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-3">
          {[
            { label: "Last updated", value: updated },
            { label: "Effective", value: effective },
          ].map((row) => (
            <div key={row.label}>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
                {row.label}
              </dt>
              <dd className="mt-1 text-[13.5px] font-medium text-ink">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function LegalLayout({
  sections,
  children,
}: {
  sections: LegalSection[];
  children: ReactNode;
}) {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16 lg:py-20">
      <TableOfContents sections={sections} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function TableOfContents({ sections }: { sections: LegalSection[] }) {
  return (
    <nav aria-label="On this page" className="lg:sticky lg:top-24 lg:self-start">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
        On this page
      </h2>
      <ol className="mt-4 space-y-1 border-l border-line">
        {sections.map((section, index) => (
          <li key={section.id}>
            <a
              href={"#" + section.id}
              className="-ml-px flex gap-2.5 border-l-2 border-transparent py-1.5 pl-4 text-[13px] leading-snug text-ink-muted transition-colors hover:border-brand-500 hover:text-brand-700"
            >
              <span className="tabular-nums text-ink-faint">{index + 1}.</span>
              <span>{section.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* ── Block elements ──────────────────────────────────────────────────────── */

export function Section({
  id,
  index,
  title,
  children,
}: {
  id: string;
  index: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      // `scroll-mt-24` clears the 4rem sticky header when an anchor is followed.
      className="scroll-mt-24 border-t border-line pt-10 first:border-0 first:pt-0 [&+section]:mt-12"
    >
      <h2 className="flex gap-3 text-[22px] font-bold tracking-tight text-ink sm:text-2xl">
        <span className="tabular-nums text-brand-600">{index}.</span>
        <span className="text-balance">{title}</span>
      </h2>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

export function SubHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="pt-1 text-[15px] font-semibold tracking-tight text-ink">
      {children}
    </h3>
  );
}

export function P({ children }: { children: ReactNode }) {
  return <p className="text-[14.5px] leading-[1.75] text-ink-soft">{children}</p>;
}

export function List({
  items,
  ordered = false,
}: {
  items: ReactNode[];
  ordered?: boolean;
}) {
  if (ordered) {
    return (
      <ol className="list-decimal space-y-2.5 pl-5 text-[14.5px] leading-[1.75] text-ink-soft marker:font-semibold marker:text-brand-600">
        {items.map((item, index) => (
          <li key={index} className="pl-1.5">
            {item}
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ul className="space-y-2.5 text-[14.5px] leading-[1.75] text-ink-soft">
      {items.map((item, index) => (
        <li key={index} className="relative pl-6">
          <span
            className="absolute left-1 top-[0.7em] size-1.5 rounded-full bg-brand-400"
            aria-hidden
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function Term({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-ink">{children}</strong>;
}

export function Callout({
  title,
  children,
  tone = "brand",
}: {
  title: string;
  children: ReactNode;
  tone?: "brand" | "neutral";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-5",
        tone === "brand"
          ? "border-brand-200 bg-brand-50"
          : "border-line bg-surface-muted",
      )}
    >
      <p
        className={cn(
          "text-[13.5px] font-semibold",
          tone === "brand" ? "text-brand-700" : "text-ink",
        )}
      >
        {title}
      </p>
      <div className="mt-2 space-y-3 text-[14px] leading-[1.7] text-ink-soft">
        {children}
      </div>
    </div>
  );
}

/**
 * A data table whose wrapper scrolls instead of letting the columns collapse
 * into an unreadable stack on a narrow screen.
 */
export function DataTable({
  head,
  rows,
}: {
  head: string[];
  rows: ReactNode[][];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[34rem] border-collapse text-left">
        <thead>
          <tr className="bg-surface-muted">
            {head.map((cell) => (
              <th
                key={cell}
                scope="col"
                className="border-b border-line px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-faint"
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="align-top last:[&>td]:border-b-0">
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className={cn(
                    "border-b border-line px-4 py-3.5 text-[13.5px] leading-relaxed text-ink-soft",
                    cellIndex === 0 && "font-medium text-ink",
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ContactCard({
  lines,
}: {
  lines: { label: string; value: ReactNode }[];
}) {
  return (
    <dl className="card divide-y divide-line overflow-hidden">
      {lines.map((line) => (
        <div
          key={line.label}
          className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-baseline sm:gap-6"
        >
          <dt className="w-40 shrink-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
            {line.label}
          </dt>
          <dd className="text-[14px] leading-relaxed text-ink-soft">
            {line.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function MailLink({ address }: { address: string }) {
  return (
    <a
      href={"mailto:" + address}
      className="font-medium text-brand-600 underline decoration-brand-300 underline-offset-4 transition-colors hover:text-brand-700"
    >
      {address}
    </a>
  );
}

export function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-brand-600 underline decoration-brand-300 underline-offset-4 transition-colors hover:text-brand-700"
    >
      {children}
    </a>
  );
}
