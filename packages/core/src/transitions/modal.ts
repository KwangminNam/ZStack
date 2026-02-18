import type { TransitionPreset } from "../types";

/**
 * Bottom sheet / modal style transition.
 * Entering screen slides up from the bottom.
 * Behind screen scales down slightly with a dim overlay effect.
 */
export const modalTransition: TransitionPreset = {
  name: "modal",
  duration: 400,
  easing: "cubic-bezier(0.2, 0.9, 0.3, 1)",
  keyframes: {
    entering: [
      {
        transform: "translate3d(0, 100%, 0)",
        borderRadius: "12px 12px 0 0",
      },
      {
        transform: "translate3d(0, 0, 0)",
        borderRadius: "12px 12px 0 0",
      },
    ],
    exitingBehind: [
      {
        transform: "scale(1)",
        borderRadius: "0",
        filter: "brightness(1)",
      },
      {
        transform: "scale(0.94)",
        borderRadius: "12px",
        filter: "brightness(0.8)",
      },
    ],
  },
  reverseKeyframes: {
    entering: [
      {
        transform: "scale(0.94)",
        borderRadius: "12px",
        filter: "brightness(0.8)",
      },
      {
        transform: "scale(1)",
        borderRadius: "0",
        filter: "brightness(1)",
      },
    ],
    exitingBehind: [
      {
        transform: "translate3d(0, 0, 0)",
        borderRadius: "12px 12px 0 0",
      },
      {
        transform: "translate3d(0, 100%, 0)",
        borderRadius: "12px 12px 0 0",
      },
    ],
  },
};
