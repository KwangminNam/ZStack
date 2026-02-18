import type { TransitionPreset } from "../types";

/**
 * Instant transition with no animation.
 */
export const noneTransition: TransitionPreset = {
  name: "none",
  duration: 0,
  easing: "linear",
  keyframes: {
    entering: [{ opacity: "1" }, { opacity: "1" }],
    exitingBehind: [{ opacity: "1" }, { opacity: "1" }],
  },
  reverseKeyframes: {
    entering: [{ opacity: "1" }, { opacity: "1" }],
    exitingBehind: [{ opacity: "1" }, { opacity: "1" }],
  },
};
