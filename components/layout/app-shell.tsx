"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AssignTaskModal } from "@/components/tasks/assign-task-modal";
import { Button } from "@/components/ui/button";
import { useMeQuery, useSignOutMutation } from "@/store/api";
import { MobileHeader } from "./mobile-header";
import { ShellContext } from "./shell-context";
import { Sidebar } from "./sidebar";
import { TabBar } from "./tab-bar";
import { Topbar } from "./topbar";

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data, isLoading, isError } = useMeQuery();
  const [signOut] = useSignOutMutation();
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <Loader2 className="size-6 animate-spin text-brand-600" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-canvas px-6 text-center">
        <p className="text-sm text-ink-muted">
          Your session has expired. Please sign in again.
        </p>
        <Button onClick={() => router.push("/sign-in")}>Go to sign in</Button>
      </div>
    );
  }

  const user = data.user;

  async function handleSignOut() {
    await signOut();
    toast.success("Signed out");
    router.push("/sign-in");
    router.refresh();
  }

  return (
    <ShellContext.Provider
      value={{ user, openTaskModal: () => setTaskModalOpen(true) }}
    >
      <div className="min-h-screen bg-canvas">
        {/* Desktop chrome — sidebar + full top bar */}
        <div className="hidden lg:block">
          <Sidebar
            user={user}
            onNewTask={() => setTaskModalOpen(true)}
            onSignOut={handleSignOut}
          />
        </div>

        <div className="lg:pl-[264px]">
          <div className="hidden lg:block">
            <Topbar user={user} onSignOut={handleSignOut} />
          </div>

          {/* Phone chrome — contextual header */}
          <MobileHeader user={user} />

          <main className="pb-tabbar mx-auto w-full max-w-[1400px] px-4 pt-4 sm:px-6 lg:px-8 lg:pt-8">
            {children}
          </main>
        </div>

        {/* Phone chrome — bottom tabs */}
        <TabBar user={user} />

        {user.role !== "ADMIN" && (
          <AssignTaskModal
            open={taskModalOpen}
            onClose={() => setTaskModalOpen(false)}
          />
        )}
      </div>
    </ShellContext.Provider>
  );
}
