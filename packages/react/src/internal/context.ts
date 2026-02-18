import { createContext } from "react";
import type { Store, Activity, SharedElementRegistry } from "@z-stack/core";

export interface ActivityDefinition {
  name: string;
  component: React.ComponentType<Record<string, unknown>>;
}

export interface ZStackContextValue {
  store: Store;
  activityDefinitions: Map<string, ActivityDefinition>;
  sharedElementRegistry: SharedElementRegistry;
}

export const ZStackContext = createContext<ZStackContextValue | null>(null);

export interface ActivityContextValue {
  activity: Activity;
  isTop: boolean;
}

export const ActivityContext = createContext<ActivityContextValue | null>(null);
