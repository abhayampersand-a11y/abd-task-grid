"use client";

import { Check, Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme, type ThemePreference } from "./theme-provider";

const OPTIONS: {
  value: ThemePreference;
  label: string;
  hint: string;
  icon: typeof Sun;
}[] = [
  {
    value: "light",
    label: "Light",
    hint: "Always use the light theme.",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Dark",
    hint: "Always use the dark theme.",
    icon: Moon,
  },
  {
    value: "system",
    label: "System",
    hint: "Follow your device setting.",
    icon: Monitor,
  },
];

/** Miniature app preview so the choice is visible before it is applied. */
function Preview({ dark }: { dark: boolean }) {
  const canvas = dark ? "#0c0e15" : "#f6f7f9";
  const surface = dark ? "#151823" : "#ffffff";
  const line = dark ? "#262b3a" : "#e6e8ee";
  const bar = dark ? "#353b4e" : "#d5d8e2";

  return (
    <svg viewBox="0 0 120 76" className="h-16 w-auto" aria-hidden>
      <rect width="120" height="76" rx="8" fill={canvas} />
      <rect x="8" y="8" width="30" height="60" rx="5" fill={surface} stroke={line} />
      <rect x="13" y="14" width="20" height="6" rx="3" fill="#4f39f6" />
      <rect x="13" y="26" width="16" height="3.5" rx="1.75" fill={bar} />
      <rect x="13" y="34" width="13" height="3.5" rx="1.75" fill={bar} />
      <rect x="13" y="42" width="15" height="3.5" rx="1.75" fill={bar} />
      <rect x="44" y="8" width="68" height="16" rx="5" fill={surface} stroke={line} />
      <rect x="50" y="14" width="26" height="4" rx="2" fill={bar} />
      <rect x="44" y="30" width="68" height="16" rx="5" fill={surface} stroke={line} />
      <rect x="50" y="36" width="34" height="4" rx="2" fill={bar} />
      <rect x="44" y="52" width="68" height="16" rx="5" fill={surface} stroke={line} />
      <rect x="50" y="58" width="22" height="4" rx="2" fill={bar} />
    </svg>
  );
}

export function AppearanceSection() {
  const { preference, resolved, setPreference } = useTheme();

  return (
    <section className="card overflow-hidden">
      <header className="border-b border-line px-6 py-4">
        <h2 className="text-[15px] font-semibold text-ink">Appearance</h2>
        <p className="mt-1 text-[13px] text-ink-muted">
          Choose how TaskFlow Pro looks on this device. The setting is saved to
          this browser.
        </p>
      </header>

      <div className="space-y-3 p-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {OPTIONS.map((option) => {
            const active = preference === option.value;
            const previewDark =
              option.value === "dark" ||
              (option.value === "system" && resolved === "dark");

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setPreference(option.value)}
                aria-pressed={active}
                className={cn(
                  "group relative flex flex-col items-center gap-3 rounded-2xl border p-4 text-center transition-all",
                  active
                    ? "border-brand-400 bg-brand-50 ring-4 ring-brand-500/10"
                    : "border-line bg-surface hover:border-line-strong",
                )}
              >
                {active && (
                  <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-brand-600 text-white dark:bg-brand-500">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                )}

                <span className="overflow-hidden rounded-lg border border-line">
                  <Preview dark={previewDark} />
                </span>

                <span>
                  <span
                    className={cn(
                      "flex items-center justify-center gap-1.5 text-[14px] font-semibold",
                      active ? "text-brand-700" : "text-ink",
                    )}
                  >
                    <option.icon className="size-4" />
                    {option.label}
                  </span>
                  <span className="mt-0.5 block text-[12px] text-ink-muted">
                    {option.hint}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <p className="rounded-xl bg-surface-muted px-4 py-3 text-[12.5px] text-ink-muted">
          Currently showing the{" "}
          <span className="font-semibold text-ink">{resolved}</span> theme
          {preference === "system" && " (matched to your device)"}.
        </p>
      </div>
    </section>
  );
}
