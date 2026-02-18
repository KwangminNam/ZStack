# WIP

# ZStack

Native-feeling stack navigation for web and webview apps. Built with Web Animations API for 60fps transitions, iOS-style swipe-back gestures, and shared element (hero) animations.


## Features

- **Stack-based navigation** — push, pop, replace with full activity lifecycle
- **4 built-in transitions** — slide (iOS Cupertino), fade, modal (bottom sheet), none
- **Swipe-back gesture** — iOS edge-swipe to pop with real-time animation scrubbing
- **Shared element transitions** — FLIP-based hero animations between screens
- **Browser history sync** — optional plugin for back/forward button support
- **DOM preservation** — previous screens stay mounted (scroll position, form state preserved)
- **Headless-friendly** — core logic via hooks, UI components are optional
- **TypeScript** — full type safety with exported declarations
- **Zero dependencies** — core package has no runtime dependencies

## Packages

| Package | Description |
|---------|-------------|
| `@z-stack/core` | Framework-agnostic state management, transitions, gestures, plugins |
| `@z-stack/react` | React bindings — provider, hooks, convenience components |
| `demo` | Vite + React demo app with 3 screens |

## Quick Start

### Installation

```bash
npm install @z-stack/core @z-stack/react
# or
pnpm add @z-stack/core @z-stack/react
```

### Basic Usage

```tsx
import { ZStackProvider } from "@z-stack/react";

function App() {
  return (
    <ZStackProvider
      activities={[
        { name: "Home", component: HomeScreen },
        { name: "Detail", component: DetailScreen },
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
```

### Screen Components

```tsx
import { useNavigation, useActivity } from "@z-stack/react";

function HomeScreen() {
  const { push } = useNavigation();

  return (
    <div>
      <h1>Home</h1>
      <button onClick={() => push("Detail", { id: "123" })}>
        Go to Detail
      </button>
      <button onClick={() => push("Settings", {}, "modal")}>
        Open Modal
      </button>
    </div>
  );
}

function DetailScreen() {
  const { pop } = useNavigation();
  const activity = useActivity();
  const { id } = activity.params as { id: string };

  return (
    <div>
      <h1>Detail {id}</h1>
      <button onClick={() => pop()}>Go Back</button>
    </div>
  );
}
```

### Shared Element Transitions

Wrap matching elements with `SharedElement` using the same `id` across screens:

```tsx
import { SharedElement, useNavigation } from "@z-stack/react";

// List screen
function ListScreen() {
  const { push } = useNavigation();

  return (
    <button onClick={() => push("Detail", { id: "1" })}>
      <SharedElement id="image-1">
        <img src="/photo.jpg" style={{ width: 80, height: 80 }} />
      </SharedElement>
    </button>
  );
}

// Detail screen
function DetailScreen() {
  const { params } = useActivity();

  return (
    <SharedElement id={`image-${params.id}`}>
      <img src="/photo.jpg" style={{ width: "100%", height: 300 }} />
    </SharedElement>
  );
}
```

The image smoothly morphs from the thumbnail size/position to the hero size/position using the FLIP technique.

## API Reference

### `<ZStackProvider>`

Root provider that creates the navigation stack.

| Prop | Type | Description |
|------|------|-------------|
| `activities` | `ActivityDefinition[]` | Screen definitions (`{ name, component }`) |
| `initialActivity` | `{ name, params? }` | First screen to display |
| `config.transitionDuration` | `number` | Animation duration in ms (default: `350`) |
| `config.defaultTransition` | `TransitionName` | Default transition type (default: `"slide"`) |
| `config.historySync` | `boolean` | Sync with browser history (default: `false`) |
| `config.swipeBack` | `boolean` | Enable iOS swipe-back gesture (default: `true`) |

### Hooks

#### `useNavigation()`

```ts
const { push, pop, replace } = useNavigation();

push("Detail", { id: "123" });           // slide (default)
push("Settings", {}, "modal");           // modal transition
pop();                                    // auto-matches push transition
pop("fade");                              // explicit transition override
replace("Home");                          // replace top screen
```

#### `useActivity()`

```ts
const activity = useActivity();

activity.id;              // unique activity ID
activity.name;            // screen name (e.g., "Detail")
activity.params;          // route params
activity.transitionState; // "enter-active" | "enter-done" | "exit-active" | "exit-done"
activity.isTop;           // is this the topmost screen?
```

#### `useStack()`

```ts
const state = useStack();

state.activities;   // all activities in the stack
state.transition;   // current active transition or null
```

#### `useTransition()`

```ts
const transition = useTransition();
// { type: "push", transitionName: "slide", enteringId, exitingId } or null
```

### `<SharedElement>`

```tsx
<SharedElement id="unique-key" style={{ borderRadius: 8 }}>
  <img src="/photo.jpg" />
</SharedElement>
```

| Prop | Type | Description |
|------|------|-------------|
| `id` | `string` | Matching key across screens |
| `style` | `CSSProperties` | Style for the wrapper element |
| `children` | `ReactNode` | Content to animate |

### Convenience Components

`AppScreen` and `AppBar` are **optional** pre-styled components. You can use your own UI — the navigation logic lives entirely in hooks.

```tsx
import { AppScreen, AppBar } from "@z-stack/react";

function MyScreen() {
  return (
    <AppScreen style={{ backgroundColor: "#f5f5f5" }}>
      <AppBar title="My Page" />
      <div>Content here</div>
    </AppScreen>
  );
}
```

### Transitions

| Name | Description | Use Case |
|------|-------------|----------|
| `"slide"` | iOS Cupertino horizontal slide | Default navigation |
| `"fade"` | Cross-fade | Unrelated content changes |
| `"modal"` | Bottom sheet with backdrop dim | Modals, bottom sheets |
| `"none"` | Instant switch | No animation needed |

## Architecture

```
Event (PUSH/POP/REPLACE)
  → aggregate(prevState, event) → nextState     (pure function)
  → store notifies listeners                     (reactive)
  → React re-renders via useSyncExternalStore    (concurrent-safe)
  → TransitionEngine animates via Web Animations API
  → TRANSITION_COMPLETE event → cleanup
```

**Why Web Animations API over CSS Transitions?**
- `animation.currentTime` enables gesture scrubbing (finger-following)
- `pause()` / `reverse()` / `finish()` for interactive control
- `animation.finished` Promise for clean completion handling

**Why keep previous screens in DOM?**
- Preserves scroll position and form state (native app behavior)
- Enables parallax effects (behind screen moves slightly)
- Required for swipe-back gesture preview

## Development

```bash
# Install dependencies
pnpm install

# Build core and react packages
pnpm build

# Run demo app
pnpm dev

# Run tests
pnpm test
```

## Project Structure

```
packages/
├── core/                   # @z-stack/core
│   └── src/
│       ├── types.ts        # All type definitions
│       ├── aggregate.ts    # Pure state reducer
│       ├── events.ts       # Event factory functions
│       ├── store.ts        # Reactive store
│       ├── transitions/    # slide, fade, modal, none + engine
│       ├── gestures/       # Swipe-back + pointer tracker
│       ├── plugins/        # History sync plugin
│       ├── shared-element/ # FLIP registry + animation
│       └── __tests__/      # Unit tests
├── react/                  # @z-stack/react
│   └── src/
│       ├── ZStackProvider  # Root provider
│       ├── hooks/          # useNavigation, useActivity, useStack, useTransition
│       ├── SharedElement   # Hero animation component
│       └── AppScreen/Bar   # Optional UI components
└── demo/                   # Vite + React demo
    └── src/screens/        # Home, Detail, Settings
```

## License

MIT
