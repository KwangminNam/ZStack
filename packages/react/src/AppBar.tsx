import React from "react";
import { useNavigation } from "./hooks/useNavigation";
import { useStack } from "./hooks/useStack";

interface AppBarProps {
  title: string;
  backLabel?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * iOS-style navigation bar with back button.
 */
export function AppBar({ title, backLabel = "Back", children, style }: AppBarProps) {
  const { pop } = useNavigation();
  const state = useStack();
  const canGoBack = state.activities.length > 1;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: 56,
        padding: "0 16px",
        borderBottom: "1px solid #e0e0e0",
        backgroundColor: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        flexShrink: 0,
        ...style,
      }}
    >
      {canGoBack && (
        <button
          onClick={() => pop()}
          style={{
            background: "none",
            border: "none",
            color: "#007AFF",
            fontSize: 17,
            cursor: "pointer",
            padding: "8px 0",
            marginRight: 8,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span style={{ fontSize: 20 }}>{"\u2039"}</span>
          {backLabel}
        </button>
      )}
      <span
        style={{
          flex: 1,
          textAlign: canGoBack ? "center" : "left",
          fontWeight: 600,
          fontSize: 17,
          marginRight: canGoBack ? 60 : 0,
        }}
      >
        {title}
      </span>
      {children}
    </div>
  );
}
