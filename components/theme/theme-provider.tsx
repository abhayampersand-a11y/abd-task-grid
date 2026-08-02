"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "taskflow-theme";

/**
 * Runs before first paint so the page never flashes the wrong theme.
 * Kept as a string because it is injected via `dangerouslySetInnerHTML` into
 * the document head, ahead of React hydration.
 */
export const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('${THEME_STORAGE_KEY}');
    var pref = stored === 'light' || stored === 'dark' || stored === 'system'
      ? stored
      : 'system';
    var dark = pref === 'dark' ||
      (pref === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  } catch (e) {}
})();
`;

/* ---------------------------------------------------------------------------
   localStorage + matchMedia are external stores, so the theme is read through
   `useSyncExternalStore` rather than mirrored into state inside an effect.
   The snapshot is a plain string ("dark:dark") so repeated reads stay
   referentially stable and don't loop.
--------------------------------------------------------------------------- */

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const query = window.matchMedia("(prefers-color-scheme: dark)");

  query.addEventListener("change", onChange);
  // Keeps other tabs in step.
  window.addEventListener("storage", onChange);

  return () => {
    listeners.delete(onChange);
    query.removeEventListener("change", onChange);
    window.removeEventListener("storage", onChange);
  };
}

function readPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // Private mode / storage disabled — fall through to the default.
  }
  return "system";
}

function getSnapshot(): string {
  const preference = readPreference();
  const resolved: ResolvedTheme =
    preference === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : preference;
  return `${preference}:${resolved}`;
}

/** The server can't know the device preference; the init script fixes it up. */
const SERVER_SNAPSHOT = "system:light";
const getServerSnapshot = () => SERVER_SNAPSHOT;

interface ThemeValue {
  /** What the user chose. */
  preference: ThemePreference;
  /** What that resolves to right now. */
  resolved: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeValue | null>(null);

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error("useTheme must be used inside ThemeProvider.");
  }
  return value;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const [preference, resolved] = snapshot.split(":") as [
    ThemePreference,
    ResolvedTheme,
  ];

  // Pushing the class onto <html> is updating an external system from state —
  // which is what effects are actually for.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", resolved === "dark");
    root.style.colorScheme = resolved;
  }, [resolved]);

  const setPreference = useCallback((next: ThemePreference) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Non-persistent is better than broken.
    }
    emit();
  }, []);

  const value = useMemo(
    () => ({ preference, resolved, setPreference }),
    [preference, resolved, setPreference],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
