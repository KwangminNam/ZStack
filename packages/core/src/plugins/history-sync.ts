import type { Plugin, Store, StackEvent, StackState } from "../types";

/**
 * Synchronizes the browser history with the navigation stack.
 * When push happens, pushState is called. When browser back is pressed,
 * a POP event is dispatched to the store.
 */
export function createHistorySyncPlugin(): Plugin {
  let store: Store | null = null;
  let skipNextPop = false;

  function onPopState(): void {
    if (skipNextPop) {
      skipNextPop = false;
      return;
    }
    if (store) {
      store.pop();
    }
  }

  return {
    name: "history-sync",

    init(s: Store) {
      store = s;
      window.addEventListener("popstate", onPopState);

      // Set initial history state
      const state = store.getState();
      const top = state.activities[state.activities.length - 1];
      if (top) {
        history.replaceState(
          { zStackId: top.id, index: 0 },
          "",
        );
      }
    },

    onEvent(event: StackEvent, state: StackState) {
      if (event.type === "PUSH") {
        const top = state.activities[state.activities.length - 1];
        if (top) {
          history.pushState(
            { zStackId: top.id, index: state.activities.length - 1 },
            "",
          );
        }
      }

      if (event.type === "POP") {
        // The store dispatched a POP (not from popstate), so sync browser
        // We need to go back in browser history too
        skipNextPop = true;
        history.back();
      }

      if (event.type === "REPLACE") {
        const top = state.activities[state.activities.length - 1];
        if (top) {
          history.replaceState(
            { zStackId: top.id, index: state.activities.length - 1 },
            "",
          );
        }
      }
    },

    destroy() {
      window.removeEventListener("popstate", onPopState);
      store = null;
    },
  };
}
