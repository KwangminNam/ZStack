import React, { useRef, useLayoutEffect, useContext } from "react";
import { ZStackContext, ActivityContext } from "./internal/context";

interface SharedElementProps {
  id: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * Wraps an element to participate in shared element transitions.
 *
 * When two screens both have a `<SharedElement id="same-key">`,
 * pushing/popping between them triggers a FLIP animation that
 * smoothly morphs the element from its source position to target.
 *
 * Works best with images but supports any content.
 */
export function SharedElement({ id, children, style }: SharedElementProps) {
  const ref = useRef<HTMLDivElement>(null);
  const zCtx = useContext(ZStackContext);
  const actCtx = useContext(ActivityContext);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !zCtx || !actCtx) return;

    const { sharedElementRegistry } = zCtx;
    const activityId = actCtx.activity.id;

    sharedElementRegistry.register(id, activityId, el);

    return () => {
      sharedElementRegistry.unregister(id, activityId);
    };
  }, [id, zCtx, actCtx]);

  return (
    <div
      ref={ref}
      data-shared-element={id}
      style={{ display: "inline-block", ...style }}
    >
      {children}
    </div>
  );
}
