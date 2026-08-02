"use client";

import { useEffect, useState } from "react";
import {
  AtSign,
  Check,
  Loader2,
  Search,
  UserPlus,
  UserRoundCheck,
  X,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UserSummary } from "@/lib/types";
import { useLookupUserQuery } from "@/store/api";

/** Deliberately strict: the box only answers to a complete address. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function MemberInviteSearch({
  invited,
  onInvite,
  onRemove,
  groupId,
  className,
}: {
  /** People queued for (or already holding) an invitation. */
  invited: UserSummary[];
  onInvite: (user: UserSummary) => void;
  onRemove: (userId: string) => void;
  /** Pass on an existing group so the lookup can flag members and invitees. */
  groupId?: string;
  className?: string;
}) {
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(term.trim().toLowerCase()), 300);
    return () => clearTimeout(timer);
  }, [term]);

  const isEmail = EMAIL.test(debounced);
  const { data, isFetching } = useLookupUserQuery(
    { email: debounced, groupId },
    { skip: !isEmail },
  );

  const match = isEmail ? (data?.user ?? null) : null;
  const queued = match ? invited.some((user) => user.id === match.id) : false;
  const state = queued ? "QUEUED" : (data?.state ?? null);

  const blocked: Record<string, string> = {
    QUEUED: "Already in your invite list.",
    SELF: "That is your own account.",
    MEMBER: "Already a member of this group.",
    INVITED: "Invitation already pending.",
  };

  function invite() {
    if (!match || state !== "AVAILABLE") return;
    onInvite(match);
    setTerm("");
    setDebounced("");
  }

  return (
    <div className={cn("flex min-h-0 flex-col gap-3", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-ink-faint" />
        <input
          type="email"
          inputMode="email"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              invite();
            }
          }}
          placeholder="teammate@company.com"
          aria-label="Invite by email address"
          className="h-11.5 w-full rounded-xl border border-line bg-surface-muted pl-11 pr-11 text-sm text-ink placeholder:text-ink-faint focus:border-brand-400 focus:bg-surface focus:ring-4 focus:ring-brand-500/10 focus:outline-none"
        />
        {isFetching && (
          <Loader2 className="absolute right-3.5 top-1/2 size-4.5 -translate-y-1/2 animate-spin text-ink-faint" />
        )}
      </div>

      {/* ── Lookup result ───────────────────────────────────────────────── */}
      <div className="min-h-20">
        {!debounced ? (
          <p className="flex items-start gap-2 rounded-xl bg-surface-muted px-3.5 py-3 text-[12.5px] leading-relaxed text-ink-muted">
            <AtSign className="mt-0.5 size-4 shrink-0 text-ink-faint" />
            Type the complete email address of a registered account. Matches are
            not listed — you can only invite an address you already know.
          </p>
        ) : !isEmail ? (
          <p className="px-1 py-3 text-[12.5px] text-ink-muted">
            Keep typing — enter the full email address.
          </p>
        ) : isFetching ? (
          <p className="px-1 py-3 text-[12.5px] text-ink-muted">
            Looking for “{debounced}”…
          </p>
        ) : !match ? (
          <p className="rounded-xl border border-dashed border-line px-3.5 py-3 text-[12.5px] leading-relaxed text-ink-muted">
            No signed-up account matches{" "}
            <span className="font-semibold text-ink-soft">{debounced}</span>.
            Check the spelling, or ask them to create an account first.
          </p>
        ) : (
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl border px-3.5 py-3",
              state === "AVAILABLE"
                ? "border-brand-200 bg-brand-50"
                : "border-line bg-surface-muted",
            )}
          >
            <Avatar user={match} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-ink">
                {match.fullName}
              </p>
              <p className="truncate text-[12.5px] text-ink-muted">
                {match.email}
                {match.jobTitle && ` · ${match.jobTitle}`}
              </p>
            </div>
            {state === "AVAILABLE" ? (
              <Button
                size="sm"
                onClick={invite}
                icon={<UserPlus className="size-4" />}
              >
                Invite
              </Button>
            ) : (
              <span className="flex shrink-0 items-center gap-1.5 text-[12px] font-medium text-ink-muted">
                <UserRoundCheck className="size-4" />
                {blocked[state ?? ""] ?? "Cannot be invited."}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Queued invitations ──────────────────────────────────────────── */}
      {invited.length > 0 && (
        <div className="space-y-2">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-faint">
            To be invited ({invited.length})
          </p>
          <ul className="thin-scrollbar max-h-56 space-y-1 overflow-y-auto pr-1">
            {invited.map((user) => (
              <li
                key={user.id}
                className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5"
              >
                <Avatar user={user} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-semibold text-ink">
                    {user.fullName}
                  </span>
                  <span className="block truncate text-[12px] text-ink-muted">
                    {user.email}
                  </span>
                </span>
                <Check className="size-4 shrink-0 text-emerald-600" />
                <button
                  type="button"
                  onClick={() => onRemove(user.id)}
                  aria-label={`Remove ${user.fullName}`}
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-rose-50 hover:text-rose-600"
                >
                  <X className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
