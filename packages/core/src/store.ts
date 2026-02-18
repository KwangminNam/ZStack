import type {
  StackState,
  StackEvent,
  Store,
  StoreConfig,
  Listener,
  TransitionName,
  Plugin,
} from "./types";
import { aggregate, INITIAL_STATE } from "./aggregate";
import {
  createInitEvent,
  createPushEvent,
  createPopEvent,
  createReplaceEvent,
  createTransitionCompleteEvent,
} from "./events";
import { runTransition, type TransitionHandle } from "./transitions/engine";

export interface CreateStoreOptions extends StoreConfig {
  initialActivity: {
    name: string;
    params?: Record<string, unknown>;
  };
}

export function createStore(options: CreateStoreOptions): Store {
  const {
    transitionDuration,
    defaultTransition = "slide",
    plugins = [],
    initialActivity,
  } = options;

  let state: StackState = INITIAL_STATE;
  const listeners = new Set<Listener>();
  let currentHandle: TransitionHandle | null = null;

  // Resolve elements for transitions (set by React bindings)
  let elementResolver: ((id: string) => HTMLElement | null) | null = null;

  function dispatch(event: StackEvent): void {
    const prevState = state;
    state = aggregate(state, event);

    // Notify plugins
    for (const plugin of plugins) {
      plugin.onEvent?.(event, state);
    }

    // Notify listeners
    for (const listener of listeners) {
      listener(state);
    }

    // Handle transitions for PUSH/POP/REPLACE
    if (
      state.transition &&
      (event.type === "PUSH" ||
        event.type === "POP" ||
        event.type === "REPLACE")
    ) {
      runCurrentTransition();
    }
  }

  function runCurrentTransition(): void {
    const transition = state.transition;
    if (!transition) return;

    // Cancel any in-flight transition
    if (currentHandle) {
      currentHandle.cancel();
      currentHandle = null;
    }

    const enteringEl = transition.enteringId
      ? elementResolver?.(transition.enteringId) ?? null
      : null;
    const exitingEl = transition.exitingId
      ? elementResolver?.(transition.exitingId) ?? null
      : null;

    if (!enteringEl && !exitingEl) {
      // No DOM elements available yet (e.g. SSR or first render).
      // Immediately complete.
      dispatch(createTransitionCompleteEvent());
      return;
    }

    currentHandle = runTransition(
      transition,
      enteringEl,
      exitingEl,
      transitionDuration,
    );

    currentHandle.finished.then(() => {
      currentHandle = null;
      dispatch(createTransitionCompleteEvent());
    });
  }

  // Initialize with the first activity
  const initEvent = createInitEvent(
    initialActivity.name,
    initialActivity.params ?? {},
  );
  state = aggregate(state, initEvent);
  for (const plugin of plugins) {
    plugin.onEvent?.(initEvent, state);
  }

  const store: Store = {
    getState() {
      return state;
    },

    subscribe(listener: Listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    dispatch,

    push(
      name: string,
      params: Record<string, unknown> = {},
      transition?: TransitionName,
    ) {
      if (state.transition) return; // Ignore if transition in progress
      dispatch(createPushEvent(name, params, transition ?? defaultTransition));
    },

    pop(transition?: TransitionName) {
      if (state.transition) return;
      dispatch(createPopEvent(transition));
    },

    replace(
      name: string,
      params: Record<string, unknown> = {},
      transition?: TransitionName,
    ) {
      if (state.transition) return;
      dispatch(
        createReplaceEvent(name, params, transition ?? defaultTransition),
      );
    },

    _setElementResolver(resolver) {
      elementResolver = resolver;
    },

    _getPlugins() {
      return plugins;
    },
  };

  // Initialize plugins
  for (const plugin of plugins) {
    plugin.init?.(store);
  }

  return store;
}
