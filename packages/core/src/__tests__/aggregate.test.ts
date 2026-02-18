import { describe, it, expect } from "vitest";
import { aggregate, INITIAL_STATE } from "../aggregate";
import type {
  InitEvent,
  PushEvent,
  PopEvent,
  ReplaceEvent,
  TransitionCompleteEvent,
} from "../types";

function init(name = "Home", id = "1"): InitEvent {
  return { type: "INIT", activityName: name, params: {}, id };
}

function push(
  name: string,
  id: string,
  transition: "slide" | "fade" | "modal" | "none" = "slide",
): PushEvent {
  return { type: "PUSH", activityName: name, params: {}, id, transition };
}

function pop(
  transition?: "slide" | "fade" | "modal" | "none",
): PopEvent {
  return { type: "POP", transition };
}

function replace(
  name: string,
  id: string,
  transition: "slide" | "fade" | "modal" | "none" = "fade",
): ReplaceEvent {
  return { type: "REPLACE", activityName: name, params: {}, id, transition };
}

function complete(): TransitionCompleteEvent {
  return { type: "TRANSITION_COMPLETE" };
}

describe("aggregate", () => {
  it("INIT creates a single activity with enter-done", () => {
    const state = aggregate(INITIAL_STATE, init("Home", "1"));
    expect(state.activities).toHaveLength(1);
    expect(state.activities[0]).toMatchObject({
      id: "1",
      name: "Home",
      transitionState: "enter-done",
      zIndex: 0,
    });
    expect(state.transition).toBeNull();
  });

  it("PUSH adds an enter-active activity on top, keeps existing activities", () => {
    let state = aggregate(INITIAL_STATE, init("Home", "1"));
    state = aggregate(state, push("Detail", "2"));

    expect(state.activities).toHaveLength(2);
    // Home stays enter-done (not exit-active - it stays in the stack)
    expect(state.activities[0]).toMatchObject({
      id: "1",
      name: "Home",
      transitionState: "enter-done",
    });
    expect(state.activities[1]).toMatchObject({
      id: "2",
      name: "Detail",
      transitionState: "enter-active",
    });
    expect(state.transition).toMatchObject({
      type: "push",
      enteringId: "2",
      exitingId: "1",
    });
  });

  it("PUSH + TRANSITION_COMPLETE keeps previous screens in stack", () => {
    let state = aggregate(INITIAL_STATE, init("Home", "1"));
    state = aggregate(state, push("Detail", "2"));
    state = aggregate(state, complete());

    // Both screens remain in the stack
    expect(state.activities).toHaveLength(2);
    expect(state.activities[0]).toMatchObject({
      id: "1",
      name: "Home",
      transitionState: "enter-done",
    });
    expect(state.activities[1]).toMatchObject({
      id: "2",
      name: "Detail",
      transitionState: "enter-done",
    });
    expect(state.transition).toBeNull();
  });

  it("POP marks top as exit-active", () => {
    let state = aggregate(INITIAL_STATE, init("Home", "1"));
    state = aggregate(state, push("Detail", "2"));
    state = aggregate(state, complete());

    state = aggregate(state, pop());

    expect(state.activities).toHaveLength(2);
    // Detail is being popped
    expect(state.activities[1]).toMatchObject({
      id: "2",
      transitionState: "exit-active",
    });
    // Home stays enter-done
    expect(state.activities[0]).toMatchObject({
      id: "1",
      transitionState: "enter-done",
    });
    expect(state.transition).toMatchObject({
      type: "pop",
      enteringId: "1",
      exitingId: "2",
    });
  });

  it("POP + TRANSITION_COMPLETE removes the popped screen", () => {
    let state = aggregate(INITIAL_STATE, init("Home", "1"));
    state = aggregate(state, push("Detail", "2"));
    state = aggregate(state, complete());
    state = aggregate(state, pop());
    state = aggregate(state, complete());

    expect(state.activities).toHaveLength(1);
    expect(state.activities[0]).toMatchObject({
      id: "1",
      name: "Home",
      transitionState: "enter-done",
    });
  });

  it("deep stack: push 3, pop back to first", () => {
    let state = aggregate(INITIAL_STATE, init("A", "1"));
    state = aggregate(state, push("B", "2"));
    state = aggregate(state, complete());
    state = aggregate(state, push("C", "3"));
    state = aggregate(state, complete());

    expect(state.activities).toHaveLength(3);

    // Pop C
    state = aggregate(state, pop());
    state = aggregate(state, complete());
    expect(state.activities).toHaveLength(2);
    expect(state.activities[1].name).toBe("B");

    // Pop B
    state = aggregate(state, pop());
    state = aggregate(state, complete());
    expect(state.activities).toHaveLength(1);
    expect(state.activities[0].name).toBe("A");
  });

  it("REPLACE marks old top as exit-active, adds new enter-active", () => {
    let state = aggregate(INITIAL_STATE, init("Home", "1"));
    state = aggregate(state, replace("Settings", "2"));

    expect(state.activities).toHaveLength(2);
    expect(state.activities[0].transitionState).toBe("exit-active");
    expect(state.activities[1]).toMatchObject({
      id: "2",
      name: "Settings",
      transitionState: "enter-active",
    });
  });

  it("REPLACE + TRANSITION_COMPLETE removes old screen", () => {
    let state = aggregate(INITIAL_STATE, init("Home", "1"));
    state = aggregate(state, replace("Settings", "2"));
    state = aggregate(state, complete());

    expect(state.activities).toHaveLength(1);
    expect(state.activities[0]).toMatchObject({
      id: "2",
      name: "Settings",
      transitionState: "enter-done",
    });
  });

  it("POP is no-op with single activity", () => {
    let state = aggregate(INITIAL_STATE, init("Home", "1"));
    const popped = aggregate(state, pop());
    expect(popped).toBe(state);
  });

  it("POP is no-op on empty state", () => {
    const popped = aggregate(INITIAL_STATE, pop());
    expect(popped).toBe(INITIAL_STATE);
  });

  it("POP uses the transition the activity was pushed with", () => {
    let state = aggregate(INITIAL_STATE, init("Home", "1"));
    state = aggregate(state, push("Settings", "2", "modal"));
    state = aggregate(state, complete());

    // Pop without explicit transition → should use "modal" (the pushedBy value)
    state = aggregate(state, pop());
    expect(state.transition).toMatchObject({
      type: "pop",
      transitionName: "modal",
    });
  });

  it("POP can override transition explicitly", () => {
    let state = aggregate(INITIAL_STATE, init("Home", "1"));
    state = aggregate(state, push("Settings", "2", "modal"));
    state = aggregate(state, complete());

    state = aggregate(state, pop("fade"));
    expect(state.transition).toMatchObject({
      type: "pop",
      transitionName: "fade",
    });
  });

  it("preserves params through push", () => {
    let state = aggregate(INITIAL_STATE, init("Home", "1"));
    const event: PushEvent = {
      type: "PUSH",
      activityName: "Detail",
      params: { id: "123", title: "Hello" },
      id: "2",
      transition: "slide",
    };
    state = aggregate(state, event);
    expect(state.activities[1].params).toEqual({ id: "123", title: "Hello" });
  });
});
