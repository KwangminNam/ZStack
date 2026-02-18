import type { FLIPPair } from "./registry";

export interface FLIPHandle {
  finished: Promise<void>;
  cancel(): void;
}

/**
 * Executes FLIP (First-Last-Invert-Play) animations for shared element pairs.
 *
 * Creates a "ghost" clone for each pair, positioned over the page,
 * and animates it from the source rect to the target rect.
 */
export function runFLIP(
  pairs: FLIPPair[],
  duration: number,
  easing: string,
): FLIPHandle {
  const animations: Animation[] = [];
  const ghosts: HTMLElement[] = [];
  const restores: (() => void)[] = [];

  for (const pair of pairs) {
    // ── Hide source and target IMMEDIATELY (before any paint) ──
    if (pair.sourceEl) {
      const orig = pair.sourceEl.style.visibility;
      pair.sourceEl.style.visibility = "hidden";
      restores.push(() => {
        pair.sourceEl!.style.visibility = orig;
      });
    }
    {
      const orig = pair.targetEl.style.visibility;
      pair.targetEl.style.visibility = "hidden";
      restores.push(() => {
        pair.targetEl.style.visibility = orig;
      });
    }

    // ── Create ghost ──────────────────────────────────
    const ghost = document.createElement("div");

    // Set initial position via inline style so the ghost is NEVER at (0,0)
    ghost.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      z-index: 10000;
      pointer-events: none;
      overflow: hidden;
      will-change: transform, width, height, border-radius;
      transform: translate(${pair.sourceRect.left}px, ${pair.sourceRect.top}px);
      width: ${pair.sourceRect.width}px;
      height: ${pair.sourceRect.height}px;
      border-radius: ${pair.sourceBorderRadius || "0px"};
    `;

    // Clone content from the visible source (or target as fallback)
    const donor = pair.sourceEl || pair.targetEl;
    const clone = donor.cloneNode(true) as HTMLElement;

    // Make the clone + all descendants stretch to fill the ghost
    clone.style.width = "100%";
    clone.style.height = "100%";
    clone.style.visibility = "visible";
    clone.style.position = "relative";
    clone.style.margin = "0";
    clone.style.overflow = "hidden";

    // Force all direct children to fill the clone
    for (const child of Array.from(clone.children)) {
      const el = child as HTMLElement;
      el.style.width = "100%";
      el.style.height = "100%";
      el.style.margin = "0";
    }

    // Ensure images fill properly with cover
    const images = clone.querySelectorAll("img");
    images.forEach((img) => {
      (img as HTMLElement).style.width = "100%";
      (img as HTMLElement).style.height = "100%";
      (img as HTMLElement).style.objectFit = "cover";
      (img as HTMLElement).style.display = "block";
    });
    if (clone.tagName === "IMG") {
      clone.style.objectFit = "cover";
      clone.style.display = "block";
    }

    ghost.appendChild(clone);
    document.body.appendChild(ghost);
    ghosts.push(ghost);

    // ── Animate ghost from source → target ────────────
    const anim = ghost.animate(
      [
        {
          transform: `translate(${pair.sourceRect.left}px, ${pair.sourceRect.top}px)`,
          width: `${pair.sourceRect.width}px`,
          height: `${pair.sourceRect.height}px`,
          borderRadius: pair.sourceBorderRadius || "0px",
        },
        {
          transform: `translate(${pair.targetRect.left}px, ${pair.targetRect.top}px)`,
          width: `${pair.targetRect.width}px`,
          height: `${pair.targetRect.height}px`,
          borderRadius: pair.targetBorderRadius || "0px",
        },
      ],
      {
        duration,
        easing,
        fill: "forwards",
      },
    );

    animations.push(anim);
  }

  function cleanup() {
    for (const ghost of ghosts) ghost.remove();
    for (const restore of restores) restore();
  }

  const finished = Promise.all(
    animations.map((a) => a.finished),
  ).then(() => {
    cleanup();
  });

  return {
    finished,
    cancel() {
      for (const anim of animations) anim.cancel();
      cleanup();
    },
  };
}
