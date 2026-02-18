import React, { useContext, useSyncExternalStore } from "react";
import { ZStackContext } from "./internal/context";
import { ActivityContainer } from "./ActivityContainer";

export function ScreenRenderer() {
  const ctx = useContext(ZStackContext);
  if (!ctx) {
    throw new Error("ScreenRenderer must be used within a ZStackProvider");
  }

  const { store, activityDefinitions } = ctx;

  const state = useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState,
  );

  const topIndex = state.activities.length - 1;

  return (
    <>
      {state.activities.map((activity, index) => {
        const def = activityDefinitions.get(activity.name);
        if (!def) {
          console.warn(
            `[z-stack] No component registered for activity "${activity.name}"`,
          );
          return null;
        }

        const Component = def.component;
        const isTop =
          index === topIndex &&
          activity.transitionState !== "exit-active" &&
          activity.transitionState !== "exit-done";

        return (
          <ActivityContainer
            key={activity.id}
            activity={activity}
            isTop={isTop}
          >
            <Component {...activity.params} />
          </ActivityContainer>
        );
      })}
    </>
  );
}
