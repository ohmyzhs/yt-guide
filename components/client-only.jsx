"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

export function ClientOnly({ children, fallback = null }) {
  const isClient = useSyncExternalStore(subscribe, () => true, () => false);
  return isClient ? children : fallback;
}
