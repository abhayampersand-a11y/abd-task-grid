"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  ShieldOff,
  TrendingUp,
  UserCheck,
  Users,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatSkeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/dashboard/stat-card";
import { useAdminStatsQuery } from "@/store/api";

export function AdminOverview() {
  const { data, isLoading } = useAdminStatsQuery();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Platform Overview"
        description="A single view of everyone using TaskFlow Pro and how much work is flowing through it."
        actions={
          <Link href="/admin/users">
            <Button iconRight={<ArrowRight className="size-4" />}>
              Manage users
            </Button>
          </Link>
        }
      />

      {isLoading || !data ? (
        <>
          <StatSkeleton />
          <StatSkeleton />
        </>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total users"
              value={data.totalUsers.toLocaleString()}
              icon={Users}
              tone="brand"
              hint={`+${data.growthRate}% growth this month`}
            />
            <StatCard
              label="Active users"
              value={data.activeUsers.toLocaleString()}
              icon={UserCheck}
              tone="success"
              hint={`${data.joinedToday} joined today`}
            />
            <StatCard
              label="Disabled accounts"
              value={data.disabledUsers.toLocaleString()}
              icon={ShieldOff}
              tone="danger"
              hint="Blocked from signing in"
            />
            <StatCard
              label="New this month"
              value={data.newThisMonth.toLocaleString()}
              icon={TrendingUp}
              tone="warning"
              hint="Registered in the last 30 days"
            />
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Groups" value={data.totalGroups} icon={UsersRound} />
            <StatCard
              label="Tasks created"
              value={data.totalTasks.toLocaleString()}
              icon={ClipboardList}
            />
            <StatCard
              label="Tasks completed"
              value={data.completedTasks.toLocaleString()}
              icon={CheckCircle2}
              tone="success"
            />
            <StatCard
              label="Completion rate"
              value={`${data.completionRate}%`}
              icon={TrendingUp}
              tone="brand"
            />
          </section>

          <section className="relative overflow-hidden rounded-2xl bg-ink p-8 text-white">
            <div
              className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-brand-600/30 blur-3xl"
              aria-hidden
            />
            <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-white/60">
              Platform health
            </p>
            <h2 className="mt-3 max-w-2xl text-balance text-2xl font-bold tracking-tight sm:text-3xl">
              {data.completionRate}% of all assigned work has been completed
              across {data.totalGroups} groups.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70">
              As the sole administrator you can review every registered account,
              temporarily disable access, or permanently remove a user. Task
              assignment stays entirely in the hands of group members.
            </p>
            <Link href="/admin/users" className="mt-7 inline-block">
              <Button className="bg-white text-ink hover:bg-white/90">
                Open user management
              </Button>
            </Link>
          </section>
        </>
      )}
    </div>
  );
}
