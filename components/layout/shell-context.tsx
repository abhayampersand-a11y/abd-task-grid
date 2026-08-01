"use client";

import { createContext, useContext } from "react";
import type { CurrentUser } from "@/lib/types";

interface ShellValue {
  user: CurrentUser;
  /** Opens the shared "assign a task" sheet from anywhere inside the shell. */
  openTaskModal: () => void;
}

export const ShellContext = createContext<ShellValue | null>(null);

export function useShell() {
  const value = useContext(ShellContext);
  if (!value) {
    throw new Error("useShell must be used inside the signed-in AppShell.");
  }
  return value;
}
