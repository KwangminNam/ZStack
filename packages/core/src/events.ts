import type {
  InitEvent,
  PushEvent,
  PopEvent,
  ReplaceEvent,
  TransitionCompleteEvent,
  TransitionName,
} from "./types";
import { generateId } from "./utils/id";

export function createInitEvent(
  activityName: string,
  params: Record<string, unknown> = {},
): InitEvent {
  return { type: "INIT", activityName, params, id: generateId() };
}

export function createPushEvent(
  activityName: string,
  params: Record<string, unknown> = {},
  transition: TransitionName = "slide",
): PushEvent {
  return { type: "PUSH", activityName, params, id: generateId(), transition };
}

export function createPopEvent(
  transition?: TransitionName,
): PopEvent {
  return { type: "POP", transition };
}

export function createReplaceEvent(
  activityName: string,
  params: Record<string, unknown> = {},
  transition: TransitionName = "fade",
): ReplaceEvent {
  return { type: "REPLACE", activityName, params, id: generateId(), transition };
}

export function createTransitionCompleteEvent(): TransitionCompleteEvent {
  return { type: "TRANSITION_COMPLETE" };
}
