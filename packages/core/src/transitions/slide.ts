import type { TransitionPreset } from "../types";

/**
 * iOS Cupertino-style horizontal slide with parallax on the behind screen.
 * Entering screen slides in from right (100% → 0%).
 * Behind screen slides slightly left (0% → -30%) for parallax effect.
 */
export const slideTransition: TransitionPreset = {
  name: "slide",
  duration: 350,
  easing: "cubic-bezier(0.2, 0.9, 0.3, 1)",
  keyframes: {
    entering: [
      {
        transform: "translate3d(100%, 0, 0)",
        boxShadow: "-4px 0 16px rgba(0,0,0,0)",
      },
      {
        transform: "translate3d(0, 0, 0)",
        boxShadow: "-4px 0 16px rgba(0,0,0,0.15)",
      },
    ],
    exitingBehind: [
      { transform: "translate3d(0, 0, 0)", opacity: "1" },
      { transform: "translate3d(-30%, 0, 0)", opacity: "0.9" },
    ],
  },
  reverseKeyframes: {
    entering: [
      { transform: "translate3d(0, 0, 0)", opacity: "1" },
      { transform: "translate3d(0, 0, 0)", opacity: "1" },
    ],
    exitingBehind: [
      {
        transform: "translate3d(0, 0, 0)",
        boxShadow: "-4px 0 16px rgba(0,0,0,0.15)",
      },
      {
        transform: "translate3d(100%, 0, 0)",
        boxShadow: "-4px 0 16px rgba(0,0,0,0)",
      },
    ],
  },
};
