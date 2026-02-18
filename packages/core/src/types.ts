// ─── Activity ────────────────────────────────────────────────

export type TransitionState =
  | "enter-active"
  | "enter-done"
  | "exit-active"
  | "exit-done";

export interface Activity {
  id: string;
  name: string;
  params: Record<string, unknown>;
  transitionState: TransitionState;
  zIndex: number;
  /** Which transition was used to push this activity (for matching pop) */
  pushedBy: TransitionName;
}

// ─── Stack State ─────────────────────────────────────────────

export interface StackState {
  activities: Activity[];
  /** The global monotonic counter for z-index assignment */
  counter: number;
  /** Currently running transition (null when idle) */
  transition: ActiveTransition | null;
}

export interface ActiveTransition {
  type: "push" | "pop" | "replace";
  transitionName: TransitionName;
  enteringId: string | null;
  exitingId: string | null;
}

// ─── Events ──────────────────────────────────────────────────

export type StackEvent =
  | InitEvent
  | PushEvent
  | PopEvent
  | ReplaceEvent
  | TransitionCompleteEvent;

export interface InitEvent {
  type: "INIT";
  activityName: string;
  params: Record<string, unknown>;
  id: string;
}

export interface PushEvent {
  type: "PUSH";
  activityName: string;
  params: Record<string, unknown>;
  id: string;
  transition: TransitionName;
}

export interface PopEvent {
  type: "POP";
  /** If undefined, uses the transition the top activity was pushed with */
  transition?: TransitionName;
}

export interface ReplaceEvent {
  type: "REPLACE";
  activityName: string;
  params: Record<string, unknown>;
  id: string;
  transition: TransitionName;
}

export interface TransitionCompleteEvent {
  type: "TRANSITION_COMPLETE";
}

// ─── Transitions ─────────────────────────────────────────────

export type TransitionName = "slide" | "fade" | "modal" | "none";

export interface TransitionKeyframes {
  entering: Keyframe[];
  exitingBehind: Keyframe[];
}

export interface TransitionPreset {
  name: TransitionName;
  duration: number;
  easing: string;
  keyframes: TransitionKeyframes;
  reverseKeyframes: TransitionKeyframes;
}

// ─── Store ───────────────────────────────────────────────────

export interface StoreConfig {
  transitionDuration?: number;
  defaultTransition?: TransitionName;
  plugins?: Plugin[];
}

export type Listener = (state: StackState) => void;

export interface Store {
  getState(): StackState;
  subscribe(listener: Listener): () => void;
  dispatch(event: StackEvent): void;
  push(name: string, params?: Record<string, unknown>, transition?: TransitionName): void;
  pop(transition?: TransitionName): void;
  replace(name: string, params?: Record<string, unknown>, transition?: TransitionName): void;
  /** @internal Used by React bindings to provide element lookup */
  _setElementResolver(resolver: (id: string) => HTMLElement | null): void;
  /** @internal Access plugins for cleanup */
  _getPlugins(): Plugin[];
}

// ─── Plugins ─────────────────────────────────────────────────

export interface Plugin {
  name: string;
  init?(store: Store): void;
  onEvent?(event: StackEvent, state: StackState): void;
  destroy?(): void;
}

// ─── Gesture ─────────────────────────────────────────────────

export interface PointerState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  velocityX: number;
  velocityY: number;
  timestamp: number;
}

export interface SwipeBackConfig {
  edgeWidth?: number;
  threshold?: number;
  velocityThreshold?: number;
}
