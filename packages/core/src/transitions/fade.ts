import type { TransitionPreset } from "../types";

/**
 * Simple crossfade transition.
 */
export const fadeTransition: TransitionPreset = {
  name: "fade",
  duration: 300,
  easing: "ease-in-out",
  keyframes: {
    entering: [{ opacity: "0" }, { opacity: "1" }],
    exitingBehind: [{ opacity: "1" }, { opacity: "0" }],
  },
  reverseKeyframes: {
    entering: [{ opacity: "0" }, { opacity: "1" }],
    exitingBehind: [{ opacity: "1" }, { opacity: "0" }],
  },
};
