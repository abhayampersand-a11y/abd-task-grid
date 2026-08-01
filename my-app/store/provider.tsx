"use client";

import { useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { makeStore } from "./index";

export function StoreProvider({ children }: { children: ReactNode }) {
  // Lazy initialiser: one store per mount, never shared across SSR requests.
  const [store] = useState(makeStore);

  return <Provider store={store}>{children}</Provider>;
}
