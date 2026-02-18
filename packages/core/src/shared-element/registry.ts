export interface SnapshotData {
  rect: DOMRect;
  borderRadius: string;
}

export interface FLIPPair {
  key: string;
  sourceRect: DOMRect;
  sourceBorderRadius: string;
  sourceEl: HTMLElement | null;
  targetEl: HTMLElement;
  targetRect: DOMRect;
  targetBorderRadius: string;
}

/**
 * Calculates where an element WILL BE after its screen's animation finishes.
 *
 * During a push transition, the entering screen is mid-animation
 * (e.g. translate3d(80%, 0, 0)). getBoundingClientRect() returns the
 * current animated position, not the final one. This function compensates
 * by calculating the offset between the screen container's current position
 * and its parent (z-stack container), which is where the screen will end up.
 */
function measureFinalRect(el: HTMLElement): DOMRect {
  const container = el.closest("[data-zstack-id]") as HTMLElement | null;
  if (!container || !container.parentElement) {
    return el.getBoundingClientRect();
  }

  const parentRect = container.parentElement.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();

  // How far the container still needs to travel to reach its final position
  const offsetX = parentRect.left - containerRect.left;
  const offsetY = parentRect.top - containerRect.top;

  return new DOMRect(
    elRect.left + offsetX,
    elRect.top + offsetY,
    elRect.width,
    elRect.height,
  );
}

export class SharedElementRegistry {
  /** key → activityId → element */
  private elements = new Map<string, Map<string, HTMLElement>>();
  /** key → snapshot (captured before transition) */
  private snapshots = new Map<string, SnapshotData>();

  register(key: string, activityId: string, el: HTMLElement): void {
    if (!this.elements.has(key)) {
      this.elements.set(key, new Map());
    }
    this.elements.get(key)!.set(activityId, el);
  }

  unregister(key: string, activityId: string): void {
    const map = this.elements.get(key);
    if (map) {
      map.delete(activityId);
      if (map.size === 0) this.elements.delete(key);
    }
  }

  /**
   * Captures the bounding rect of all registered shared elements.
   * Call BEFORE push/pop/replace.
   */
  captureSnapshots(): void {
    this.snapshots.clear();
    for (const [key, activityMap] of this.elements) {
      for (const [, el] of activityMap) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          this.snapshots.set(key, {
            rect,
            borderRadius: getComputedStyle(el).borderRadius,
          });
        }
      }
    }
  }

  hasPendingSnapshots(): boolean {
    return this.snapshots.size > 0;
  }

  clearSnapshots(): void {
    this.snapshots.clear();
  }

  /**
   * Find matching pairs between snapshots and elements in the entering activity.
   * Only clears snapshots when pairs are actually found.
   */
  resolvePairs(enteringActivityId: string): FLIPPair[] {
    const pairs: FLIPPair[] = [];

    for (const [key, snapshot] of this.snapshots) {
      const activityMap = this.elements.get(key);
      if (!activityMap) continue;

      const targetEl = activityMap.get(enteringActivityId);
      if (!targetEl) continue;

      // Use measureFinalRect to compensate for in-progress page animation
      const targetRect = measureFinalRect(targetEl);
      if (targetRect.width === 0 || targetRect.height === 0) continue;

      // Find source element (for hiding during animation)
      let sourceEl: HTMLElement | null = null;
      for (const [actId, el] of activityMap) {
        if (actId !== enteringActivityId) {
          sourceEl = el;
          break;
        }
      }

      pairs.push({
        key,
        sourceRect: snapshot.rect,
        sourceBorderRadius: snapshot.borderRadius,
        sourceEl,
        targetEl,
        targetRect,
        targetBorderRadius: getComputedStyle(targetEl).borderRadius,
      });
    }

    // Only clear snapshots when we actually found pairs
    if (pairs.length > 0) {
      this.snapshots.clear();
    }

    return pairs;
  }
}
