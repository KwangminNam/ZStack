import React from "react";

interface AppScreenProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * Wrapper component for screen content.
 * Provides a full-screen container with proper styling.
 */
export function AppScreen({ children, style }: AppScreenProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        backgroundColor: "#ffffff",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
