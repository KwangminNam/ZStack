import { useContext, useSyncExternalStore } from "react";
import type { StackState } from "@z-stack/core";
import { ZStackContext } from "../internal/context";

export function useStack(): StackState {
  const ctx = useContext(ZStackContext);
  if (!ctx) {
    throw new Error("useStack must be used within a ZStackProvider");
  }

  const { store } = ctx;

  return useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState,
  );
}
