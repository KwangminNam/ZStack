import { useContext, useSyncExternalStore } from "react";
import type { ActiveTransition } from "@z-stack/core";
import { ZStackContext } from "../internal/context";

export function useTransition(): ActiveTransition | null {
  const ctx = useContext(ZStackContext);
  if (!ctx) {
    throw new Error("useTransition must be used within a ZStackProvider");
  }

  const { store } = ctx;

  const state = useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState,
  );

  return state.transition;
}
