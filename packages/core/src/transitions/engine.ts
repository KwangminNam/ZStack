import type { TransitionName, TransitionPreset, ActiveTransition } from "../types";
import { slideTransition } from "./slide";
import { fadeTransition } from "./fade";
import { modalTransition } from "./modal";
import { noneTransition } from "./none";

const presets: Record<TransitionName, TransitionPreset> = {
  slide: slideTransition,
  fade: fadeTransition,
  modal: modalTransition,
  none: noneTransition,
};

export function getPreset(name: TransitionName): TransitionPreset {
  return presets[name];
}

export interface TransitionHandle {
  /** Promise that resolves when the animation finishes */
  finished: Promise<void>;
  /** Seek to a progress value 0..1 (for gesture-driven transitions) */
  seek(progress: number): void;
  /** Pause the animation */
  pause(): void;
  /** Resume playback */
  play(): void;
  /** Reverse the animation (used when gesture cancels) */
  reverse(): void;
  /** Cancel and clean up */
  cancel(): void;
}

/** Collect all CSS property names touched by a set of keyframes */
function getAnimatedProperties(keyframes: Keyframe[]): string[] {
  const props = new Set<string>();
  for (const kf of keyframes) {
    for (const key of Object.keys(kf)) {
      if (key === "offset" || key === "easing" || key === "composite") continue;
      props.add(key);
    }
  }
  return Array.from(props);
}

/** Remove specific inline style properties from an element */
function clearInlineProperties(el: HTMLElement, props: string[]): void {
  for (const prop of props) {
    el.style.removeProperty(
      // Convert camelCase to kebab-case (e.g. borderRadius → border-radius)
      prop.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`),
    );
  }
}

/**
 * Runs a transition using the Web Animations API.
 */
export function runTransition(
  transition: ActiveTransition,
  enteringEl: HTMLElement | null,
  exitingEl: HTMLElement | null,
  durationOverride?: number,
): TransitionHandle {
  const preset = presets[transition.transitionName];
  const isPop = transition.type === "pop";
  const keyframes = isPop ? preset.reverseKeyframes : preset.keyframes;
  const duration = durationOverride ?? preset.duration;

  const options: KeyframeAnimationOptions = {
    duration,
    easing: preset.easing,
    fill: "forwards",
  };

  const animations: Animation[] = [];

  // Track which elements got which properties animated
  const enteringProps = keyframes.entering.length > 0
    ? getAnimatedProperties(keyframes.entering)
    : [];
  const exitingProps = keyframes.exitingBehind.length > 0
    ? getAnimatedProperties(keyframes.exitingBehind)
    : [];

  if (enteringEl && keyframes.entering.length > 0) {
    const anim = enteringEl.animate(keyframes.entering, options);
    animations.push(anim);
  }

  if (exitingEl && keyframes.exitingBehind.length > 0) {
    const anim = exitingEl.animate(keyframes.exitingBehind, options);
    animations.push(anim);
  }

  const finished = Promise.all(
    animations.map((a) => a.finished),
  ).then(() => {
    // Cancel animations (no commitStyles — we clean up inline styles instead)
    for (const anim of animations) {
      anim.cancel();
    }
    // Clear any residual inline styles from previous commitStyles or animation artifacts
    if (enteringEl) clearInlineProperties(enteringEl, enteringProps);
    if (exitingEl) clearInlineProperties(exitingEl, exitingProps);
  });

  return {
    finished,
    seek(progress: number) {
      for (const anim of animations) {
        anim.pause();
        anim.currentTime = progress * duration;
      }
    },
    pause() {
      for (const anim of animations) {
        anim.pause();
      }
    },
    play() {
      for (const anim of animations) {
        anim.play();
      }
    },
    reverse() {
      for (const anim of animations) {
        anim.reverse();
      }
    },
    cancel() {
      for (const anim of animations) {
        anim.cancel();
      }
      if (enteringEl) clearInlineProperties(enteringEl, enteringProps);
      if (exitingEl) clearInlineProperties(exitingEl, exitingProps);
    },
  };
}
