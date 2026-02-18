import type { SwipeBackConfig, ActiveTransition } from "../types";
import { PointerTracker } from "./pointer-tracker";
import type { TransitionHandle } from "../transitions/engine";
import { runTransition } from "../transitions/engine";

const DEFAULT_CONFIG: Required<SwipeBackConfig> = {
  edgeWidth: 20,
  threshold: 0.35,
  velocityThreshold: 0.5,
};

export interface SwipeBackCallbacks {
  onSwipeStart(): void;
  onSwipeEnd(completed: boolean): void;
  getEnteringEl(): HTMLElement | null;
  getExitingEl(): HTMLElement | null;
  getTransition(): ActiveTransition | null;
  canSwipeBack(): boolean;
}

export class SwipeBackGesture {
  private config: Required<SwipeBackConfig>;
  private tracker = new PointerTracker();
  private handle: TransitionHandle | null = null;
  private active = false;
  private element: HTMLElement | null = null;
  private callbacks: SwipeBackCallbacks;

  constructor(callbacks: SwipeBackCallbacks, config?: SwipeBackConfig) {
    this.callbacks = callbacks;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  attach(element: HTMLElement): void {
    this.element = element;
    element.addEventListener("pointerdown", this.onPointerDown, {
      passive: false,
    });
  }

  detach(): void {
    if (this.element) {
      this.element.removeEventListener("pointerdown", this.onPointerDown);
      this.element = null;
    }
    this.cleanup();
  }

  private onPointerDown = (e: PointerEvent): void => {
    if (!this.callbacks.canSwipeBack()) return;

    // Only start from left edge
    if (e.clientX > this.config.edgeWidth) return;
    // Only primary pointer
    if (e.button !== 0) return;

    this.tracker.start(e.clientX, e.clientY);
    this.active = false;

    document.addEventListener("pointermove", this.onPointerMove, {
      passive: false,
    });
    document.addEventListener("pointerup", this.onPointerUp);
    document.addEventListener("pointercancel", this.onPointerUp);
  };

  private onPointerMove = (e: PointerEvent): void => {
    this.tracker.move(e.clientX, e.clientY);

    const dx = this.tracker.deltaX;
    const dy = this.tracker.deltaY;

    // Must be primarily horizontal
    if (!this.active && Math.abs(dx) < 10) return;
    if (!this.active && Math.abs(dy) > Math.abs(dx)) {
      this.cleanup();
      return;
    }

    if (!this.active) {
      this.active = true;
      this.callbacks.onSwipeStart();

      // Create a pop-type transition for gesture-driven animation
      const enteringEl = this.callbacks.getEnteringEl();
      const exitingEl = this.callbacks.getExitingEl();

      if (enteringEl && exitingEl) {
        this.handle = runTransition(
          {
            type: "pop",
            transitionName: "slide",
            enteringId: null,
            exitingId: null,
          },
          enteringEl,
          exitingEl,
        );
        this.handle.pause();
      }
    }

    if (this.handle && this.element) {
      const progress = Math.max(
        0,
        Math.min(1, dx / this.element.clientWidth),
      );
      this.handle.seek(progress);
    }

    e.preventDefault();
  };

  private onPointerUp = (): void => {
    if (!this.active) {
      this.cleanup();
      return;
    }

    const finalState = this.tracker.end();
    const progress = this.element
      ? this.tracker.deltaX / this.element.clientWidth
      : 0;
    const shouldComplete =
      progress > this.config.threshold ||
      finalState.velocityX > this.config.velocityThreshold;

    if (this.handle) {
      if (shouldComplete) {
        this.handle.play();
        this.handle.finished.then(() => {
          this.callbacks.onSwipeEnd(true);
        });
      } else {
        this.handle.reverse();
        this.handle.finished.then(() => {
          this.callbacks.onSwipeEnd(false);
        });
      }
    }

    this.active = false;
    this.removeDocumentListeners();
    this.tracker.reset();
  };

  private cleanup(): void {
    this.active = false;
    if (this.handle) {
      this.handle.cancel();
      this.handle = null;
    }
    this.removeDocumentListeners();
    this.tracker.reset();
  }

  private removeDocumentListeners(): void {
    document.removeEventListener("pointermove", this.onPointerMove);
    document.removeEventListener("pointerup", this.onPointerUp);
    document.removeEventListener("pointercancel", this.onPointerUp);
  }
}
