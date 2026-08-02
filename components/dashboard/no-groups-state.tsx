"use client";

import { BellOff, Lightbulb, ShieldCheck, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingIslandIllustration } from "@/components/ui/illustrations";

/**
 * "Ready for a Team?" — the first-run screen when a user belongs to no group.
 * Illustration card + two stacked CTAs + reassurance tiles, per the mockup.
 */
export function NoGroupsState({
  onCreate,
  onBrowse,
}: {
  onCreate: () => void;
  onBrowse: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-lg animate-fade-up py-2 lg:py-8">
      {/* Illustration card with its overlapping status badge */}
      <div className="relative">
        <div className="overflow-hidden rounded-[28px] bg-gradient-to-b from-lilac-50 via-brand-50 to-aqua-50 px-6 pb-8 pt-10">
          <FloatingIslandIllustration className="mx-auto h-56 w-auto" />
          <p className="mt-4 text-center text-2xl font-bold tracking-tight text-ink">
            All Clear!
          </p>
          <p className="mt-1 text-center text-[14px] text-ink-muted">
            Looks like you&apos;re all caught up.
          </p>
        </div>

        <span className="absolute -bottom-5 left-5 flex size-14 items-center justify-center rounded-2xl bg-surface shadow-float">
          <BellOff className="size-6 text-brand-600" />
        </span>
      </div>

      <h1 className="mt-12 text-balance text-center text-[32px] font-bold leading-tight tracking-tight text-ink">
        Ready for a Team?
      </h1>
      <p className="mx-auto mt-3 max-w-md text-balance text-center text-[15px] leading-relaxed text-ink-muted">
        You are not part of any group yet. Start a new collaborative journey or
        join your teammates to get things moving!
      </p>

      <div className="mt-8 space-y-3">
        <Button
          size="lg"
          className="w-full"
          icon={<UserPlus className="size-5" />}
          onClick={onCreate}
        >
          Create Group
        </Button>
        <Button
          size="lg"
          variant="subtle"
          className="w-full"
          icon={<Users className="size-5" />}
          onClick={onBrowse}
        >
          Browse Groups
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3">
        <div className="rounded-tile bg-lilac-50 p-4">
          <span className="flex size-9 items-center justify-center rounded-full bg-lilac-500 text-white">
            <Lightbulb className="size-4.5" />
          </span>
          <p className="mt-3 text-[14px] font-bold text-lilac-700">Quick Tip</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
            Groups help you organize tasks with your team or department.
          </p>
        </div>

        <div className="rounded-tile bg-aqua-50 p-4">
          <span className="flex size-9 items-center justify-center rounded-full bg-aqua-500 text-white">
            <ShieldCheck className="size-4.5" />
          </span>
          <p className="mt-3 text-[14px] font-bold text-aqua-700">Private</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
            Tasks stay scoped to their group — nobody outside can see them.
          </p>
        </div>
      </div>
    </div>
  );
}
