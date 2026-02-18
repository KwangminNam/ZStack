import React from "react";
import { ZStackProvider } from "@z-stack/react";
import { HomeScreen } from "./screens/Home";
import { DetailScreen } from "./screens/Detail";
import { SettingsScreen } from "./screens/Settings";

export function App() {
  return (
    <ZStackProvider
      activities={[
        { name: "Home", component: HomeScreen},
        { name: "Detail", component: DetailScreen },
        { name: "Settings", component: SettingsScreen },
      ]}
      initialActivity={{ name: "Home" }}
      config={{
        transitionDuration: 350,
        historySync: true,
        swipeBack: true,
      }}
    />
  );
}
