"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckSquare, Search, Users, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/badge";
import { useSearchQuery } from "@/store/api";
import { cn } from "@/lib/utils";

export function GlobalSearch({
  placeholder = "Search tasks or groups…",
  className,
}: {
  placeholder?: string;
  className?: string;
}) {
  const router = useRouter();
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(term.trim()), 250);
    return () => clearTimeout(timer);
  }, [term]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const { data, isFetching } = useSearchQuery(debounced, {
    skip: debounced.length < 2,
  });

  const hasResults =
    (data?.groups.length ?? 0) +
      (data?.tasks.length ?? 0) +
      (data?.members.length ?? 0) >
    0;

  function go(href: string) {
    setOpen(false);
    setTerm("");
    router.push(href);
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-ink-faint" />
      <input
        value={term}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setTerm(event.target.value);
          setOpen(true);
        }}
        placeholder={placeholder}
        aria-label="Global search"
        className="h-11 w-full rounded-full border border-line bg-surface-muted pl-11.5 pr-10 text-sm text-ink transition-all placeholder:text-ink-faint focus:border-brand-400 focus:bg-surface focus:ring-4 focus:ring-brand-500/10 focus:outline-none"
      />
      {term && (
        <button
          type="button"
          onClick={() => setTerm("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-ink-faint hover:bg-line/60"
        >
          <X className="size-3.5" />
        </button>
      )}

      {open && debounced.length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-line bg-surface shadow-float animate-scale-in">
          {isFetching && !data ? (
            <p className="px-5 py-6 text-center text-sm text-ink-muted">
              Searching…
            </p>
          ) : !hasResults ? (
            <p className="px-5 py-6 text-center text-sm text-ink-muted">
              No matches for “{debounced}”.
            </p>
          ) : (
            <div className="thin-scrollbar max-h-[420px] overflow-y-auto p-2">
              {data!.groups.length > 0 && (
                <Section label="Groups">
                  {data!.groups.map((group) => (
                    <ResultRow
                      key={group.id}
                      icon={<Users className="size-4 text-brand-600" />}
                      title={group.name}
                      subtitle={group.description ?? "Group"}
                      onClick={() => go(`/groups/${group.id}`)}
                    />
                  ))}
                </Section>
              )}

              {data!.tasks.length > 0 && (
                <Section label="Tasks">
                  {data!.tasks.map((task) => (
                    <ResultRow
                      key={task.id}
                      icon={<CheckSquare className="size-4 text-brand-600" />}
                      title={task.title}
                      subtitle={task.groupName}
                      trailing={<StatusBadge status={task.status} />}
                      onClick={() => go(`/tasks/${task.id}`)}
                    />
                  ))}
                </Section>
              )}

              {data!.members.length > 0 && (
                <Section label="Members">
                  {data!.members.map((member) => (
                    <ResultRow
                      key={member.id}
                      icon={<Avatar user={member} size="xs" />}
                      title={member.fullName}
                      subtitle={member.jobTitle ?? member.email}
                      onClick={() => go("/groups")}
                    />
                  ))}
                </Section>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-1 last:mb-0">
      <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
        {label}
      </p>
      {children}
    </div>
  );
}

function ResultRow({
  icon,
  title,
  subtitle,
  trailing,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  trailing?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-brand-50"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] font-medium text-ink">
          {title}
        </span>
        <span className="block truncate text-xs text-ink-muted">
          {subtitle}
        </span>
      </span>
      {trailing}
    </button>
  );
}
