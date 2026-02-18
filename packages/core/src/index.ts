// Types
export type {
  Activity,
  TransitionState,
  StackState,
  ActiveTransition,
  StackEvent,
  InitEvent,
  PushEvent,
  PopEvent,
  ReplaceEvent,
  TransitionCompleteEvent,
  TransitionName,
  TransitionKeyframes,
  TransitionPreset,
  Store,
  StoreConfig,
  Listener,
  Plugin,
  PointerState,
  SwipeBackConfig,
} from "./types";

// Aggregate (pure functions)
export { aggregate, INITIAL_STATE } from "./aggregate";

// Events
export {
  createInitEvent,
  createPushEvent,
  createPopEvent,
  createReplaceEvent,
  createTransitionCompleteEvent,
} from "./events";

// Store
export { createStore } from "./store";
export type { CreateStoreOptions } from "./store";

// Transitions
export { getPreset, runTransition } from "./transitions/engine";
export type { TransitionHandle } from "./transitions/engine";
export { slideTransition } from "./transitions/slide";
export { fadeTransition } from "./transitions/fade";
export { modalTransition } from "./transitions/modal";
export { noneTransition } from "./transitions/none";

// Gestures
export { PointerTracker } from "./gestures/pointer-tracker";
export { SwipeBackGesture } from "./gestures/swipe-back";
export type { SwipeBackCallbacks } from "./gestures/swipe-back";

// Plugins
export { createHistorySyncPlugin } from "./plugins/history-sync";

// Shared Element Transitions
export { SharedElementRegistry } from "./shared-element/registry";
export type { SnapshotData, FLIPPair } from "./shared-element/registry";
export { runFLIP } from "./shared-element/flip";
export type { FLIPHandle } from "./shared-element/flip";

// Utils
export { generateId } from "./utils/id";
