import type { PointerState } from "../types";

const VELOCITY_WINDOW = 50; // ms window for velocity calculation

export interface VelocitySample {
  x: number;
  y: number;
  time: number;
}

export class PointerTracker {
  private samples: VelocitySample[] = [];
  private _state: PointerState = {
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    velocityX: 0,
    velocityY: 0,
    timestamp: 0,
  };

  get state(): PointerState {
    return this._state;
  }

  get deltaX(): number {
    return this._state.currentX - this._state.startX;
  }

  get deltaY(): number {
    return this._state.currentY - this._state.startY;
  }

  start(x: number, y: number): void {
    const now = performance.now();
    this._state = {
      startX: x,
      startY: y,
      currentX: x,
      currentY: y,
      velocityX: 0,
      velocityY: 0,
      timestamp: now,
    };
    this.samples = [{ x, y, time: now }];
  }

  move(x: number, y: number): void {
    const now = performance.now();

    this.samples.push({ x, y, time: now });
    // Keep only recent samples
    this.samples = this.samples.filter(
      (s) => now - s.time < VELOCITY_WINDOW * 2,
    );

    const { velocityX, velocityY } = this.computeVelocity(now);

    this._state = {
      ...this._state,
      currentX: x,
      currentY: y,
      velocityX,
      velocityY,
      timestamp: now,
    };
  }

  end(): PointerState {
    // Return final state with velocity
    return { ...this._state };
  }

  reset(): void {
    this.samples = [];
  }

  private computeVelocity(now: number): { velocityX: number; velocityY: number } {
    const recent = this.samples.filter(
      (s) => now - s.time < VELOCITY_WINDOW,
    );

    if (recent.length < 2) {
      return { velocityX: 0, velocityY: 0 };
    }

    const first = recent[0];
    const last = recent[recent.length - 1];
    const dt = last.time - first.time;

    if (dt === 0) return { velocityX: 0, velocityY: 0 };

    return {
      velocityX: (last.x - first.x) / dt,
      velocityY: (last.y - first.y) / dt,
    };
  }
}
