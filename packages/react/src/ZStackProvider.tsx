import React, { useEffect, useMemo, useRef } from "react";
import {
  createStore,
  createHistorySyncPlugin,
  SwipeBackGesture,
  SharedElementRegistry,
  runFLIP,
  type TransitionName,
  type FLIPHandle,
} from "@z-stack/core";
import {
  ZStackContext,
  type ActivityDefinition,
  type ZStackContextValue,
} from "./internal/context";
import { ScreenRenderer } from "./ScreenRenderer";

interface ZStackProviderProps {
  activities: ActivityDefinition[];
  initialActivity: {
    name: string;
    params?: Record<string, unknown>;
  };
  config?: {
    transitionDuration?: number;
    defaultTransition?: TransitionName;
    historySync?: boolean;
    swipeBack?: boolean;
  };
}

export function ZStackProvider({
  activities,
  initialActivity,
  config = {},
}: ZStackProviderProps) {
  const {
    transitionDuration = 350,
    defaultTransition,
    historySync = false,
    swipeBack = true,
  } = config;

  const containerRef = useRef<HTMLDivElement>(null);
  const flipHandleRef = useRef<FLIPHandle | null>(null);

  // Create shared element registry once
  const registryRef = useRef<SharedElementRegistry | null>(null);
  if (!registryRef.current) {
    registryRef.current = new SharedElementRegistry();
  }
  const registry = registryRef.current;

  // Create store once
  const storeRef = useRef<ReturnType<typeof createStore> | null>(null);
  if (!storeRef.current) {
    const plugins = [];
    if (historySync && typeof window !== "undefined") {
      plugins.push(createHistorySyncPlugin());
    }

    storeRef.current = createStore({
      transitionDuration,
      defaultTransition,
      plugins,
      initialActivity,
    }) as ReturnType<typeof createStore>;
  }

  const store = storeRef.current;

  // Build definitions map
  const activityDefinitions = useMemo(() => {
    const map = new Map<string, ActivityDefinition>();
    for (const def of activities) {
      map.set(def.name, def);
    }
    return map;
  }, [activities]);

  // Set up element resolver
  useEffect(() => {
    store._setElementResolver((id: string) => {
      const container = containerRef.current;
      if (!container) return null;
      return container.querySelector(
        `[data-zstack-id="${id}"]`,
      ) as HTMLElement | null;
    });
  }, [store]);

  // ── FLIP orchestration ────────────────────────────────────
  // Subscribe to store: when a transition starts and we have pending
  // shared element snapshots, resolve FLIP pairs and animate.
  //
  // Timing: useSyncExternalStore listeners fire first (synchronous React
  // render + useLayoutEffect → SharedElement registers), THEN this
  // useEffect subscription fires. So the DOM and registry are ready.
  useEffect(() => {
    return store.subscribe((state) => {
      if (!state.transition || !registry.hasPendingSnapshots()) return;

      const enteringId = state.transition.enteringId;
      if (!enteringId) {
        registry.clearSnapshots();
        return;
      }

      // Try resolving synchronously (DOM should be committed by now)
      let pairs = registry.resolvePairs(enteringId);

      if (pairs.length > 0) {
        flipHandleRef.current?.cancel();
        flipHandleRef.current = runFLIP(
          pairs,
          transitionDuration,
          "cubic-bezier(0.4, 0, 0.2, 1)",
        );
        return;
      }

      // Fallback: new screen hasn't mounted yet (push case).
      // Wait for React to render, then resolve. measureFinalRect in
      // the registry compensates for the in-progress page animation.
      requestAnimationFrame(() => {
        if (!registry.hasPendingSnapshots()) return;
        pairs = registry.resolvePairs(enteringId);
        if (pairs.length === 0) {
          registry.clearSnapshots();
          return;
        }

        flipHandleRef.current?.cancel();
        flipHandleRef.current = runFLIP(
          pairs,
          transitionDuration,
          "cubic-bezier(0.4, 0, 0.2, 1)",
        );
      });
    });
  }, [store, registry, transitionDuration]);

  // ── Swipe back gesture ────────────────────────────────────
  useEffect(() => {
    if (!swipeBack) return;
    const container = containerRef.current;
    if (!container) return;

    const gesture = new SwipeBackGesture({
      canSwipeBack() {
        const state = store.getState();
        return state.activities.length > 1 && state.transition === null;
      },
      onSwipeStart() {
        // Capture shared element snapshots for potential pop
        registry.captureSnapshots();
      },
      onSwipeEnd(completed) {
        if (completed) {
          store.pop();
        } else {
          registry.clearSnapshots();
        }
      },
      getEnteringEl() {
        const state = store.getState();
        const visible = state.activities.filter(
          (a) =>
            a.transitionState !== "exit-done" &&
            a.transitionState !== "exit-active",
        );
        const below = visible[visible.length - 2];
        if (!below) return null;
        return container.querySelector(
          `[data-zstack-id="${below.id}"]`,
        ) as HTMLElement | null;
      },
      getExitingEl() {
        const state = store.getState();
        const visible = state.activities.filter(
          (a) =>
            a.transitionState !== "exit-done" &&
            a.transitionState !== "exit-active",
        );
        const top = visible[visible.length - 1];
        if (!top) return null;
        return container.querySelector(
          `[data-zstack-id="${top.id}"]`,
        ) as HTMLElement | null;
      },
      getTransition() {
        return store.getState().transition;
      },
    });

    gesture.attach(container);

    return () => {
      gesture.detach();
    };
  }, [store, swipeBack, registry]);

  // Cleanup plugins on unmount
  useEffect(() => {
    return () => {
      flipHandleRef.current?.cancel();
      const plugins = store._getPlugins();
      for (const plugin of plugins) {
        plugin.destroy?.();
      }
    };
  }, [store]);

  const contextValue: ZStackContextValue = useMemo(
    () => ({
      store,
      activityDefinitions,
      sharedElementRegistry: registry,
    }),
    [store, activityDefinitions, registry],
  );

  return (
    <ZStackContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <ScreenRenderer />
      </div>
    </ZStackContext.Provider>
  );
}
