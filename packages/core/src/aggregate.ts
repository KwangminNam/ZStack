import type { StackState, StackEvent, Activity } from "./types";

export const INITIAL_STATE: StackState = {
  activities: [],
  counter: 0,
  transition: null,
};

export function aggregate(state: StackState, event: StackEvent): StackState {
  switch (event.type) {
    case "INIT": {
      const activity: Activity = {
        id: event.id,
        name: event.activityName,
        params: event.params,
        transitionState: "enter-done",
        zIndex: 0,
        pushedBy: "none",
      };
      return {
        activities: [activity],
        counter: 1,
        transition: null,
      };
    }

    case "PUSH": {
      const top = getTopActivity(state);
      const newActivity: Activity = {
        id: event.id,
        name: event.activityName,
        params: event.params,
        transitionState: "enter-active",
        zIndex: state.counter,
        pushedBy: event.transition,
      };

      return {
        activities: [...state.activities, newActivity],
        counter: state.counter + 1,
        transition: {
          type: "push",
          transitionName: event.transition,
          enteringId: event.id,
          exitingId: top?.id ?? null,
        },
      };
    }

    case "POP": {
      const top = getTopActivity(state);
      if (!top || state.activities.length <= 1) return state;

      const belowTop = getBelowTopActivity(state);

      // Default: reverse with the same transition used to push
      const transitionName = event.transition ?? top.pushedBy;

      const activities = state.activities.map((a) => {
        if (a.id === top.id) {
          return { ...a, transitionState: "exit-active" as const };
        }
        return a;
      });

      return {
        ...state,
        activities,
        transition: {
          type: "pop",
          transitionName,
          enteringId: belowTop?.id ?? null,
          exitingId: top.id,
        },
      };
    }

    case "REPLACE": {
      const top = getTopActivity(state);
      const newActivity: Activity = {
        id: event.id,
        name: event.activityName,
        params: event.params,
        transitionState: "enter-active",
        zIndex: state.counter,
        pushedBy: event.transition,
      };

      const activities = state.activities.map((a) => {
        if (top && a.id === top.id) {
          return { ...a, transitionState: "exit-active" as const };
        }
        return a;
      });

      return {
        activities: [...activities, newActivity],
        counter: state.counter + 1,
        transition: {
          type: "replace",
          transitionName: event.transition,
          enteringId: event.id,
          exitingId: top?.id ?? null,
        },
      };
    }

    case "TRANSITION_COMPLETE": {
      const activities = state.activities
        .map((a) => {
          if (a.transitionState === "enter-active") {
            return { ...a, transitionState: "enter-done" as const };
          }
          if (a.transitionState === "exit-active") {
            return { ...a, transitionState: "exit-done" as const };
          }
          return a;
        })
        .filter((a) => a.transitionState !== "exit-done");

      return {
        ...state,
        activities,
        transition: null,
      };
    }
  }
}

function getTopActivity(state: StackState): Activity | undefined {
  const visible = state.activities.filter(
    (a) => a.transitionState !== "exit-done" && a.transitionState !== "exit-active",
  );
  return visible[visible.length - 1];
}

function getBelowTopActivity(state: StackState): Activity | undefined {
  const visible = state.activities.filter(
    (a) => a.transitionState !== "exit-done" && a.transitionState !== "exit-active",
  );
  return visible.length >= 2 ? visible[visible.length - 2] : undefined;
}
