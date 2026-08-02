"use client";

import { Toaster } from "sonner";
import { useTheme } from "./theme-provider";

/** Sonner needs the resolved theme explicitly — it doesn't read our class. */
export function ThemedToaster() {
  const { resolved } = useTheme();

  return (
    <Toaster
      position="top-right"
      theme={resolved}
      richColors
      closeButton
      toastOptions={{
        style: {
          borderRadius: "12px",
          fontSize: "13.5px",
        },
      }}
    />
  );
}
