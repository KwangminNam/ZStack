import React from "react";
import { AppScreen, AppBar, useNavigation, SharedElement } from "@z-stack/react";

const ITEMS = [
  { id: "1", title: "Mountain Lake", color: "#2196F3" },
  { id: "2", title: "Sunset Beach", color: "#FF9800" },
  { id: "3", title: "Forest Trail", color: "#4CAF50" },
  { id: "4", title: "City Skyline", color: "#9C27B0" },
  { id: "5", title: "Desert Dunes", color: "#FF5722" },
];

export function HomeScreen() {
  const { push } = useNavigation();

  return (
    <AppScreen>
      <AppBar title="Gallery" />
      <div style={{ padding: 16, overflowY: "auto", flex: 1 }}>
        <p style={{ color: "#666", marginBottom: 16, lineHeight: 1.5, fontSize: 14 }}>
          Tap an image to see the shared element transition.
          The image smoothly morphs from the list into the detail view.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() =>
                push("Detail", { id: item.id, title: item.title, color: item.color })
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: 12,
                border: "1px solid #e0e0e0",
                borderRadius: 12,
                background: "#fff",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <SharedElement
                id={`image-${item.id}`}
                style={{ borderRadius: 8, overflow: "hidden", flexShrink: 0 }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    backgroundColor: item.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 24,
                    fontWeight: 700,
                  }}
                >
                  {item.title.charAt(0)}
                </div>
              </SharedElement>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 13, color: "#999" }}>
                  Tap to view details
                </div>
              </div>
              <span style={{ color: "#ccc", fontSize: 20 }}>{"\u203A"}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => push("Settings", {}, "modal")}
          style={{
            marginTop: 24,
            padding: "16px 20px",
            border: "none",
            borderRadius: 12,
            background: "#007AFF",
            color: "#fff",
            cursor: "pointer",
            width: "100%",
            fontSize: 16,
            fontWeight: 500,
          }}
        >
          Open Settings (Modal)
        </button>

        {/* Scroll test */}
        <div style={{ marginTop: 32 }}>
          <h3 style={{ marginBottom: 12, fontWeight: 500, fontSize: 14, color: "#999" }}>
            Scroll Position Test
          </h3>
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid #f0f0f0",
                color: "#444",
                fontSize: 14,
              }}
            >
              Scroll item {i + 1}
            </div>
          ))}
        </div>
      </div>
    </AppScreen>
  );
}
