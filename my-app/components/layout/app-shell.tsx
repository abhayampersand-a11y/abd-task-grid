"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AssignTaskModal } from "@/components/tasks/assign-task-modal";
import { useMeQuery, useSignOutMutation } from "@/store/api";
import { Sidebar } from "./sidebar";
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
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
        <p className="text-sm text-ink-muted">
          Your session has expired. Please sign in again.
        </p>
        <a
          href="/sign-in"
          className="text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          Go to sign in
        </a>
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
    <div className="min-h-screen bg-canvas">
      <Sidebar
        user={user}
        onNewTask={() => setTaskModalOpen(true)}
        onSignOut={handleSignOut}
      />

      <div className="lg:pl-[264px]">
        <Topbar user={user} onSignOut={handleSignOut} />
        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </main>
      </div>

      {user.role !== "ADMIN" && (
        <AssignTaskModal
          open={taskModalOpen}
          onClose={() => setTaskModalOpen(false)}
        />
      )}
    </div>
  );
}
