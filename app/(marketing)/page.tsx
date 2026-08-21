import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  Cpu,
  Layers,
  LogIn,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroPreview } from "@/components/ui/illustrations";
import { Logo, LogoMark } from "@/components/ui/logo";

const NAV = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Benefits", href: "#benefits" },
];

/**
 * Facts about the product, not usage numbers. Anything here has to be checkable
 * against the app itself: a store reviewer reads this page next to the Terms,
 * which disclaim uptime warranties and say the service is free — an invented
 * "99.9% uptime" or user count contradicts both.
 */
const STATS = [
  { value: "Free", label: "Every feature, no card" },
  { value: "5", label: "Workflow statuses" },
  { value: "2", label: "Apps, one account" },
  { value: "0", label: "Ads or trackers" },
];

const STEPS = [
  {
    icon: UserPlus,
    title: "Create your account",
    body: "Sign up with your name, email and mobile number. No credit card, no sales call.",
  },
  {
    icon: Users,
    title: "Build a group",
    body: "Name the group, pick teammates from the directory, and you are the owner by default.",
  },
  {
    icon: Workflow,
    title: "Assign the work",
    body: "Create a task, choose an assignee from the group, set priority, deadline and a checklist.",
  },
  {
    icon: BarChart3,
    title: "Track to completion",
    body: "Watch progress, comment in context, and let the activity timeline record every change.",
  },
];

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: "Access that stays tight",
    body: "Tasks are scoped to the group they live in. If you are not a member, the data does not exist for you.",
  },
  {
    icon: CalendarCheck,
    title: "Deadlines you cannot miss",
    body: "Overdue, due-today and due-this-week counters sit on the dashboard, not buried in a report.",
  },
  {
    icon: MessagesSquare,
    title: "Context in one place",
    body: "Description, attachments, checklist, comments and a full activity timeline on a single screen.",
  },
  {
    icon: Cpu,
    title: "Built to stay fast",
    body: "Server-validated APIs with cached client state, so lists stay instant as your workspace grows.",
  },
];

/**
 * Every entry here goes somewhere. The previous footer listed a changelog, an
 * API doc, a careers page, a status page and a live chat, none of which exist —
 * dead text in a footer reads as an abandoned product, and a store reviewer
 * following one of them finds nothing.
 */
const FOOTER_COLUMNS: { title: string; links: { label: string; href: string }[] }[] =
  [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "How it works", href: "#how-it-works" },
        { label: "Benefits", href: "#benefits" },
      ],
    },
    {
      title: "Account",
      links: [
        { label: "Sign up", href: "/sign-up" },
        { label: "Sign in", href: "/sign-in" },
        { label: "Delete your account", href: "/privacy#delete-account" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Contact", href: "mailto:abdtech.apps@gmail.com" },
      ],
    },
  ];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      {/* ── Navigation ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-line bg-surface/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
          <Link href="/" className="shrink-0">
            <Logo showMark />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-lg px-3.5 py-2 text-[13.5px] font-medium text-ink-muted transition-colors hover:bg-brand-50 hover:text-brand-700"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero ──────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-line bg-gradient-to-b from-brand-50/70 via-surface to-surface">
          <div
            className="pointer-events-none absolute -right-40 -top-40 size-[560px] rounded-full bg-brand-200/25 blur-3xl"
            aria-hidden
          />
          <div className="mx-auto grid w-full max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:py-24">
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-[12.5px] font-semibold text-brand-700">
                <Sparkles className="size-3.5" />
                Free for every team
              </span>

              <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[56px]">
                Streamline your team&apos;s productivity with{" "}
                <span className="text-brand-600">group-based</span> task
                management.
              </h1>

              <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-ink-muted">
                Break down silos and accelerate workflows. TaskFlow Pro provides
                the granular control and high-speed collaboration tools that
                high-performance teams demand.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/sign-up">
                  <Button size="lg" className="w-full sm:w-auto" iconRight={<ArrowRight className="size-4" />}>
                    Start for Free
                  </Button>
                </Link>
                <Link href="/sign-in">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto"
                    icon={<LogIn className="size-4.5" />}
                  >
                    Sign In
                  </Button>
                </Link>
              </div>

              {/* Was a "Trusted by" logo wall of companies that have never used
                  this. These are the sign-in providers and platforms the app
                  actually supports, which is the same shape of reassurance and
                  happens to be true. */}
              <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                  Works with
                </span>
                {["Android", "Web", "Google", "Microsoft", "LinkedIn"].map(
                  (item) => (
                    <span
                      key={item}
                      className="text-[15px] font-semibold text-ink-faint"
                    >
                      {item}
                    </span>
                  ),
                )}
              </div>
            </div>

            <div className="relative animate-fade-up">
              <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-float">
                <HeroPreview className="h-auto w-full" />
              </div>

              <div className="absolute -bottom-5 -left-4 hidden items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 shadow-float sm:flex">
                <span className="flex size-9 items-center justify-center rounded-full bg-brand-50">
                  <CheckCircle2 className="size-4.5 text-brand-600" />
                </span>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">
                    Task completed
                  </p>
                  <p className="text-[13px] font-semibold text-ink">
                    Design System V1
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ──────────────────────────────────────────────── */}
        <section id="features" className="border-b border-line py-20 sm:py-24">
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-balance text-3xl font-bold tracking-tight text-ink sm:text-[38px]">
                Built for enterprise performance
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
                Every feature is designed to eliminate friction and focus your
                energy on what matters: shipping high-quality results together.
              </p>
            </div>

            <div className="mt-14 grid gap-5 lg:grid-cols-3">
              <article className="card card-interactive flex flex-col gap-4 overflow-hidden p-7 lg:col-span-2">
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Users className="size-5" />
                </span>
                <h3 className="text-xl font-semibold tracking-tight text-ink">
                  Deep collaboration
                </h3>
                <p className="max-w-lg text-sm leading-relaxed text-ink-muted">
                  Threaded comments, shared attachments and a live activity
                  timeline keep the whole group in sync — no matter where they
                  are working from.
                </p>
                <div className="mt-2 space-y-2.5 rounded-xl border border-line bg-surface-muted p-4">
                  {[
                    { name: "Sarah Jenkins", text: "Shadow tokens are in Figma" },
                    { name: "David Chen", text: "Applied levels 0–2 on the grid" },
                    { name: "Alex Rivera", text: "Keep transitions at 200ms" },
                  ].map((row) => (
                    <div key={row.name} className="flex items-center gap-3">
                      <span className="size-7 shrink-0 rounded-full bg-brand-100" />
                      <p className="truncate text-[13px] text-ink-soft">
                        <span className="font-semibold text-ink">
                          {row.name}
                        </span>{" "}
                        {row.text}
                      </p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="card card-interactive flex flex-col gap-4 bg-brand-600 p-7 text-white dark:bg-brand-500">
                <span className="flex size-11 items-center justify-center rounded-xl bg-white/15">
                  <ShieldCheck className="size-5" />
                </span>
                <h3 className="text-xl font-semibold tracking-tight">
                  Total admin control
                </h3>
                <p className="text-sm leading-relaxed text-white/80">
                  Manage membership, visibility and account status with granular
                  controls at the group level.
                </p>
                <div className="mt-auto space-y-2 pt-4">
                  {/* Each row names a control the app really has, with a value
                      the app really uses — `visibility` is PUBLIC or PRIVATE,
                      and the trail is the activity timeline, not an audit log
                      product we do not ship. */}
                  {[
                    ["Member status", "ACTIVE"],
                    ["Group visibility", "PRIVATE"],
                    ["Activity trail", "ON"],
                  ].map(([label, tag]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between rounded-lg bg-white/10 px-3.5 py-2.5"
                    >
                      <span className="text-[13px] font-medium">{label}</span>
                      <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold tracking-wide">
                        {tag}
                      </span>
                    </div>
                  ))}
                </div>
              </article>

              <article className="card card-interactive flex flex-col gap-4 bg-ink p-7 text-white dark:bg-surface-muted">
                <span className="flex size-11 items-center justify-center rounded-xl bg-white/10">
                  <BarChart3 className="size-5" />
                </span>
                <h3 className="text-xl font-semibold tracking-tight">
                  Precision tracking
                </h3>
                <p className="text-sm leading-relaxed text-white/70">
                  Progress metrics, completion rates and overdue counters
                  available in a single click.
                </p>
                <div className="mt-auto flex h-24 items-end gap-2 pt-4">
                  {[38, 62, 88, 54, 74, 96].map((height, index) => (
                    <span
                      key={index}
                      className="flex-1 rounded-t-md bg-brand-400/70"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </article>

              <article className="card card-interactive flex flex-col gap-4 p-7 lg:col-span-2">
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Layers className="size-5" />
                </span>
                <h3 className="text-xl font-semibold tracking-tight text-ink">
                  Structured workflows
                </h3>
                <p className="max-w-lg text-sm leading-relaxed text-ink-muted">
                  Five clear statuses, four priority levels and per-task
                  checklists that drive the progress bar automatically as work
                  gets ticked off.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    "Backlog",
                    "To Do",
                    "In Progress",
                    "In Review",
                    "Completed",
                  ].map((status, index) => (
                    <span
                      key={status}
                      className={
                        index === 2
                          ? "rounded-full bg-brand-600 px-3.5 py-1.5 text-[12.5px] font-semibold text-white dark:bg-brand-500"
                          : "rounded-full bg-surface-muted px-3.5 py-1.5 text-[12.5px] font-medium text-ink-soft ring-1 ring-line"
                      }
                    >
                      {status}
                    </span>
                  ))}
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* ── How it works ──────────────────────────────────────────── */}
        <section
          id="how-it-works"
          className="border-b border-line bg-surface-muted py-20 sm:py-24"
        >
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-balance text-3xl font-bold tracking-tight text-ink sm:text-[38px]">
                From sign-up to shipped in four steps
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
                No onboarding project. No consultant. Your first group can be
                live in under two minutes.
              </p>
            </div>

            <ol className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, index) => (
                <li key={step.title} className="card relative p-6">
                  <span className="absolute right-5 top-5 text-[42px] font-bold leading-none text-brand-50">
                    {index + 1}
                  </span>
                  <span className="relative flex size-11 items-center justify-center rounded-xl bg-brand-600 text-white dark:bg-brand-500">
                    <step.icon className="size-5" />
                  </span>
                  <h3 className="relative mt-5 text-[15px] font-semibold text-ink">
                    {step.title}
                  </h3>
                  <p className="relative mt-2 text-[13.5px] leading-relaxed text-ink-muted">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Stats ─────────────────────────────────────────────────── */}
        <section className="border-b border-line py-14">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-8 px-5 sm:px-8 lg:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold tracking-tight text-brand-600 sm:text-[40px]">
                  {stat.value}
                </p>
                <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Benefits ──────────────────────────────────────────────── */}
        <section id="benefits" className="py-20 sm:py-24">
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-balance text-3xl font-bold tracking-tight text-ink sm:text-[38px]">
                Why teams stay
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
                The details that turn a task list into a system your team
                actually trusts.
              </p>
            </div>

            <div className="mt-14 grid gap-5 sm:grid-cols-2">
              {BENEFITS.map((benefit) => (
                <article
                  key={benefit.title}
                  className="card card-interactive flex gap-4 p-6"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <benefit.icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-[15px] font-semibold text-ink">
                      {benefit.title}
                    </h3>
                    <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-muted">
                      {benefit.body}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────── */}
        <section className="pb-20 sm:pb-24">
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-ink px-6 py-16 text-center sm:px-12 dark:bg-surface-muted">
              <div
                className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-brand-600/25 blur-3xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -bottom-24 -right-24 size-72 rounded-full bg-brand-500/20 blur-3xl"
                aria-hidden
              />

              <h2 className="relative mx-auto max-w-2xl text-balance text-3xl font-bold tracking-tight text-white sm:text-[40px] sm:leading-tight">
                Ready to transform your team&apos;s workflow?
              </h2>
              <p className="relative mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/70">
                Create an account, build your first group and assign a task —
                the whole thing takes about two minutes.
              </p>

              <div className="relative mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/sign-up">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get Started for Free
                  </Button>
                </Link>
                <Link href="/sign-in">
                  <Button
                    size="lg"
                    className="w-full border border-white/15 bg-white/10 text-white hover:bg-white/15 sm:w-auto"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>

              {/* Claims here have to match the Terms: the service is free,
                  with no trial that expires and nothing to cancel. */}
              <div className="relative mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[12.5px] text-white/60">
                {["Every feature free", "No credit card", "No subscription"].map(
                  (item) => (
                    <span key={item} className="inline-flex items-center gap-2">
                      <CheckCircle2 className="size-3.5" />
                      {item}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-line bg-surface-muted">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-2.5">
              <LogoMark />
              <Logo />
            </div>
            <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-ink-muted">
              The high-performance platform for teams that value speed, clarity
              and control.
            </p>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {/* In-page anchors and the mailto go through a plain <a>;
                        `next/link` is for routes it can prefetch. */}
                    {link.href.startsWith("/") ? (
                      <Link
                        href={link.href}
                        className="text-[13.5px] text-ink-muted transition-colors hover:text-brand-700"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-[13.5px] text-ink-muted transition-colors hover:text-brand-700"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-line">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-5 py-5 text-[12.5px] text-ink-faint sm:flex-row sm:items-center sm:justify-between sm:px-8">
            {/* No "Inc." — there is no incorporated entity behind this, and the
                Privacy Policy names the individual operator. No "Cookie
                Settings" either: the only cookies set are the session and the
                theme, both strictly necessary, so there is nothing to settle. */}
            <p>
              © {new Date().getFullYear()} ABD Tech. TaskFlow Pro on the web,
              Taskgrid on Google Play — one account, one service.
            </p>
            <p>English (US)</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
