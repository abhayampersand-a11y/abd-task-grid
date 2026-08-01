"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useDirectoryQuery } from "@/store/api";

export function MemberPicker({
  selected,
  onToggle,
  /** Members already in the group — shown as locked rows. */
  excludeIds = [],
  className,
}: {
  selected: string[];
  onToggle: (userId: string) => void;
  excludeIds?: string[];
  className?: string;
}) {
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(term.trim()), 250);
    return () => clearTimeout(timer);
  }, [term]);

  const { data, isLoading } = useDirectoryQuery(debounced || undefined);
  const users = (data?.users ?? []).filter(
    (user) => !excludeIds.includes(user.id),
  );

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-ink-faint" />
        <input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Search by name, email, or role…"
          aria-label="Search members"
          className="h-11.5 w-full rounded-xl border border-line bg-surface-muted pl-11 pr-3.5 text-sm text-ink placeholder:text-ink-faint focus:border-brand-400 focus:bg-surface focus:ring-4 focus:ring-brand-500/10 focus:outline-none"
        />
      </div>

      <div className="thin-scrollbar mt-3 max-h-72 min-h-40 flex-1 space-y-1 overflow-y-auto pr-1">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 px-2 py-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))
        ) : users.length === 0 ? (
          <p className="px-3 py-10 text-center text-sm text-ink-muted">
            {debounced
              ? `No members match “${debounced}”.`
              : "No other members are registered yet."}
          </p>
        ) : (
          users.map((user) => {
            const checked = selected.includes(user.id);
            return (
              <label
                key={user.id}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors",
                  checked
                    ? "border-brand-200 bg-brand-50"
                    : "border-transparent hover:bg-surface-muted",
                )}
              >
                <Avatar user={user} size="md" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold text-ink">
                    {user.fullName}
                  </span>
                  <span className="block truncate text-[12.5px] text-ink-muted">
                    {user.email}
                    {user.jobTitle && ` · ${user.jobTitle}`}
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(user.id)}
                  className="size-5 shrink-0 cursor-pointer appearance-none rounded-md border border-line-strong bg-surface transition-all checked:border-brand-600 checked:bg-brand-600 checked:bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22white%22 stroke-width=%223%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><polyline points=%2220 6 9 17 4 12%22/></svg>')] checked:bg-[length:14px] checked:bg-center checked:bg-no-repeat"
                />
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}
