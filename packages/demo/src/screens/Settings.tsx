import React, { useState } from "react";
import { AppScreen, AppBar, useNavigation } from "@z-stack/react";

export function SettingsScreen() {
  const { pop, replace } = useNavigation();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  return (
    <AppScreen
      style={{
        backgroundColor: darkMode ? "#1c1c1e" : "#f2f2f7",
        color: darkMode ? "#fff" : "#000",
      }}
    >
      <AppBar
        title="Settings"
        style={
          darkMode
            ? {
                backgroundColor: "rgba(28,28,30,0.95)",
                borderColor: "#333",
                color: "#fff",
              }
            : undefined
        }
      />
      <div style={{ padding: 16, flex: 1, overflowY: "auto" }}>
        <div
          style={{
            background: darkMode ? "#2c2c2e" : "#fff",
            borderRadius: 12,
            overflow: "hidden",
            marginBottom: 24,
          }}
        >
          <SettingRow
            label="Dark Mode"
            dark={darkMode}
            right={
              <Toggle
                value={darkMode}
                onChange={setDarkMode}
              />
            }
          />
          <SettingRow
            label="Notifications"
            dark={darkMode}
            right={
              <Toggle
                value={notifications}
                onChange={setNotifications}
              />
            }
          />
          <SettingRow
            label="Version"
            dark={darkMode}
            right={
              <span style={{ color: "#999" }}>0.1.0</span>
            }
          />
        </div>

        <button
          onClick={() => pop()}
          style={{
            padding: "14px 20px",
            border: "none",
            borderRadius: 12,
            background: "#FF3B30",
            color: "#fff",
            cursor: "pointer",
            width: "100%",
            fontSize: 16,
            fontWeight: 500,
          }}
        >
          Close
        </button>
      </div>
    </AppScreen>
  );
}

function SettingRow({
  label,
  right,
  dark,
}: {
  label: string;
  right: React.ReactNode;
  dark: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "14px 16px",
        borderBottom: `1px solid ${dark ? "#3a3a3c" : "#e5e5ea"}`,
      }}
    >
      <span style={{ fontSize: 16 }}>{label}</span>
      {right}
    </div>
  );
}

function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 51,
        height: 31,
        borderRadius: 16,
        backgroundColor: value ? "#34C759" : "#e5e5ea",
        position: "relative",
        cursor: "pointer",
        transition: "background-color 0.2s",
      }}
    >
      <div
        style={{
          width: 27,
          height: 27,
          borderRadius: 14,
          backgroundColor: "#fff",
          position: "absolute",
          top: 2,
          left: value ? 22 : 2,
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      />
    </div>
  );
}
