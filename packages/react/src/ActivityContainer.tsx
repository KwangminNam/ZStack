import React, { useRef, useEffect, useContext } from "react";
import type { Activity } from "@z-stack/core";
import { ActivityContext, ZStackContext } from "./internal/context";

interface ActivityContainerProps {
  activity: Activity;
  isTop: boolean;
  children: React.ReactNode;
}

export function ActivityContainer({
  activity,
  isTop,
  children,
}: ActivityContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const ctx = useContext(ZStackContext);

  // Register element with the store's element resolver
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.dataset.zstackId = activity.id;
  }, [activity.id]);

  const isVisible =
    activity.transitionState !== "exit-done";

  const style: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: activity.zIndex,
    display: isVisible ? "block" : "none",
    overflow: "auto",
    willChange:
      activity.transitionState === "enter-active" ||
      activity.transitionState === "exit-active"
        ? "transform, opacity"
        : "auto",
    // Prevent text selection during gestures
    WebkitUserSelect: "none",
    userSelect: "none",
  };

  return (
    <ActivityContext.Provider value={{ activity, isTop }}>
      <div
        ref={ref}
        data-zstack-id={activity.id}
        data-zstack-state={activity.transitionState}
        style={style}
      >
        {children}
      </div>
    </ActivityContext.Provider>
  );
}
