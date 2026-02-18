import React from "react";
import {
  AppScreen,
  AppBar,
  useNavigation,
  useActivity,
  SharedElement,
} from "@z-stack/react";

export function DetailScreen() {
  const { push, pop } = useNavigation();
  const activity = useActivity();
  const { id, title, color } = activity.params as {
    id: string;
    title: string;
    color: string;
  };

  return (
    <AppScreen style={{ backgroundColor: "#f8f9fa" }}>
      <AppBar title={title || `Detail ${id}`} />
      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Hero image — shared element */}
        <SharedElement id={`image-${id}`} style={{ display: "block", width: "100%" }}>
          <div
            style={{
              width: "100%",
              height: 280,
              backgroundColor: color || "#2196F3",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 64,
              fontWeight: 700,
            }}
          >
            {(title || "?").charAt(0)}
          </div>
        </SharedElement>

        <div style={{ padding: 16 }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 20,
              marginBottom: 16,
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            <h2 style={{ marginBottom: 8 }}>{title}</h2>
            <p style={{ color: "#666", lineHeight: 1.6 }}>
              Notice how the image smoothly expanded from the list thumbnail
              into this hero area. When you go back (tap Back or swipe from the
              left edge), it shrinks back to its original position.
            </p>
          </div>

          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 20,
              marginBottom: 16,
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            <h3 style={{ marginBottom: 12, fontWeight: 500 }}>Try it</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={() =>
                  push("Detail", {
                    id: String(Number(id) + 10),
                    title: `Nested ${Number(id) + 10}`,
                    color: "#607D8B",
                  })
                }
                style={{
                  padding: "12px 16px",
                  border: "1px solid #e0e0e0",
                  borderRadius: 8,
                  background: "#fff",
                  cursor: "pointer",
                  fontSize: 15,
                }}
              >
                Push another Detail
              </button>
              <button
                onClick={() => pop()}
                style={{
                  padding: "12px 16px",
                  border: "none",
                  borderRadius: 8,
                  background: "#FF3B30",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 15,
                }}
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppScreen>
  );
}
