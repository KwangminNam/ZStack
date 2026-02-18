import { useContext, useCallback } from "react";
import type { TransitionName } from "@z-stack/core";
import { ZStackContext } from "../internal/context";

export interface UseNavigationReturn {
  push(name: string, params?: Record<string, unknown>, transition?: TransitionName): void;
  pop(transition?: TransitionName): void;
  replace(name: string, params?: Record<string, unknown>, transition?: TransitionName): void;
}

export function useNavigation(): UseNavigationReturn {
  const ctx = useContext(ZStackContext);
  if (!ctx) {
    throw new Error("useNavigation must be used within a ZStackProvider");
  }

  const { store, sharedElementRegistry } = ctx;

  const push = useCallback(
    (name: string, params?: Record<string, unknown>, transition?: TransitionName) => {
      sharedElementRegistry.captureSnapshots();
      store.push(name, params, transition);
    },
    [store, sharedElementRegistry],
  );

  const pop = useCallback(
    (transition?: TransitionName) => {
      sharedElementRegistry.captureSnapshots();
      store.pop(transition);
    },
    [store, sharedElementRegistry],
  );

  const replace = useCallback(
    (name: string, params?: Record<string, unknown>, transition?: TransitionName) => {
      sharedElementRegistry.captureSnapshots();
      store.replace(name, params, transition);
    },
    [store, sharedElementRegistry],
  );

  return { push, pop, replace };
}
