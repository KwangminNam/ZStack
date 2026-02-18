import { useContext } from "react";
import type { Activity } from "@z-stack/core";
import { ActivityContext } from "../internal/context";

export interface UseActivityReturn extends Activity {
  isTop: boolean;
}

export function useActivity(): UseActivityReturn {
  const ctx = useContext(ActivityContext);
  if (!ctx) {
    throw new Error("useActivity must be used within an ActivityContainer");
  }

  return {
    ...ctx.activity,
    isTop: ctx.isTop,
  };
}
