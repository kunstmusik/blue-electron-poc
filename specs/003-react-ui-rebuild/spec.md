# Feature Specification: React UI Rebuild with Vite + Tailwind + Zustand

**Feature Branch**: `003-react-ui-rebuild`
**Created**: 2026-04-12
**Status**: Draft
**Input**: Replace the current stub Electron renderer (vanilla JS/CSS) with a full React application using Vite, Tailwind CSS, and Zustand.

## Background

The current Electron app (`packages/blue-app`) has a basic HTML/JS renderer that loads but has non-functional buttons (Open, Play, etc.). The IPC bridge works at the Electron level but the renderer is too limited for the full Blue experience.

This feature rebuilds the entire UI as a modern React application with:
- **Vite** — fast HMR, modern bundling, native ESM
- **React 19** — component-based UI with hooks
- **Tailwind CSS** — utility-first styling, dark theme
- **Zustand** — lightweight state management with selective subscriptions
- **TypeScript** — full type safety across all layers

### Why Zustand?

Zustand is the right choice for this project because:

| Feature | Why It Matters |
|---------|---------------|
| **No provider boilerplate** | The store is a hook — no `<Provider>` wrapping needed, cleaner component tree |
| **Selective subscriptions** | `useStore(state => state.foo)` only re-renders when `foo` changes — critical for score UI with many objects |
| **Small (~1KB)** | Minimal bundle overhead |
| **TypeScript-first** | Full type inference without codegen |
| **Middleware ecosystem** | `persist` (save recent files, UI state), `immer` (complex mutations), `devtools` (Redux DevTools) |
| **Simplicity** | The entire store is one file — easy to understand and maintain |

**What Zustand handles well:**
- Project data (loaded `BlueData`, file path, dirty state)
- Playback state (playing/stopped, engine status, current time)
- UI state (open panels, selected objects, zoom level)
- Recent files list
- Settings/preferences

**What Zustand doesn't need (and we won't add):**
- **React Router** — single-page app, no routing needed
- **TanStack Query** — no server/fetch data, everything is local
- **Redux** — overkill for this scope

**Additional libraries worth considering:**
| Library | Purpose | Recommendation |
|---------|---------|---------------|
| `lucide-react` | Icon library | ✅ Clean, tree-shakeable, matches dark theme |
| `sonner` | Toast notifications | ✅ For save/load/playback messages |
| `clsx` + `tailwind-merge` | Conditional classNames | ✅ Standard Tailwind pattern |
| `@tanstack/react-virtual` | Virtualized score timeline | ✅ For large projects (1000+ clips) |
| `zustand/middleware/immer` | Immutable-like mutations | ✅ Optional, for complex state |
| `zustand/middleware/persist` | Persist recent files, UI prefs | ✅ |

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Open and View a .blue Project (Priority: P1)

A user launches the app, clicks "Open Project" (or uses Cmd+O), selects a `.blue` file from their filesystem, and sees the project's full structure displayed: project metadata (title, author, sample rate), score layers (audio clips on a timeline, pattern grids, polyobject hierarchy), instrument list, and mixer channels. The UI updates reactively as the project loads.

**Why this priority:** This is the primary entry point. Without working file open and display, the app has no value.

**Independent Test**: Can be fully tested by launching the app, opening a `.blue` file, and verifying all project data is displayed correctly in the React UI.

**Acceptance Scenarios**:
1. **Given** the app is running, **When** the user clicks Open or presses Cmd+O, **Then** a native file dialog appears filtered to `.blue` files
2. **Given** a `.blue` file is selected, **When** it loads, **Then** the project title appears in the header, metadata in a details panel, and score layers are displayed
3. **Given** a file with audio clips, **When** loaded, **Then** clips are shown on a timeline with their names, colors, and positions
4. **Given** a loading error, **When** the file is invalid, **Then** a toast notification shows the error message

---

### User Story 2 — Play and Stop Audio Playback (Priority: P1)

A user with a loaded project clicks the Play button (or presses Space). The app generates a CSD from the project data, starts the blue-engine process, and begins audio playback. The UI shows a playing indicator with elapsed time. The user clicks Stop (or presses Escape) to halt playback.

**Why this priority:** Playback is the core function of the app. Without working playback, the data model and UI are just a viewer.

**Independent Test**: Load a simple `.blue` file, press Play, verify audio output, press Stop to halt.

**Acceptance Scenarios**:
1. **Given** a project is loaded, **When** the user clicks Play, **Then** the CSD is generated, the engine starts, and a playing indicator appears
2. **Given** the engine is playing, **When** the user clicks Stop, **Then** playback ceases and the engine process is cleanly terminated
3. **Given** no project is loaded, **When** the user clicks Play, **Then** nothing happens (button is disabled)
4. **Given** the engine crashes during playback, **When** it exits unexpectedly, **Then** the UI shows an error toast and resets to stopped state

---

### User Story 3 — Save and Save As (Priority: P2)

A user edits a project (future: modifies clips, patterns, etc.) and saves it. If the file was opened from disk, Save writes back to the same path. If it's a new project or the user chooses Save As, a file dialog prompts for a location.

**Why this priority:** Data integrity — users need to save their work. Required before any editing features can be useful.

**Independent Test**: Open a `.blue` file, make no changes, press Save, verify the file is written correctly and can be reloaded.

**Acceptance Scenarios**:
1. **Given** a project loaded from disk, **When** the user clicks Save, **Then** the file is written and a success toast appears
2. **Given** a project loaded from disk, **When** the user clicks Save As, **Then** a save dialog appears and the file is written to the chosen path
3. **Given** a save error (permissions, disk full), **When** save fails, **Then** an error toast shows the problem

---

### User Story 4 — Recent Files and Window State (Priority: P3)

The app remembers recently opened `.blue` files and displays them in a menu or welcome screen. Clicking a recent file opens it directly. The app also restores the last window size and position.

**Why this priority:** Quality of life — power users open the same files repeatedly. Reduces friction from launch to playback.

**Independent Test**: Open 3 different `.blue` files, restart the app, verify they appear in the recent files list, click one to open.

**Acceptance Scenarios**:
1. **Given** the user has opened files in previous sessions, **When** the app starts, **Then** recent files are displayed on the welcome screen
2. **Given** a recent file is clicked, **When** the file exists, **Then** it loads directly without a file dialog
3. **Given** a recent file has been moved or deleted, **When** clicked, **Then** an error is shown and it's removed from the list

---

### Edge Cases

- **What happens when a `.blue` file is 50MB+?** — The UI should show a loading spinner during parse and not freeze. Zustand's selective subscriptions ensure the UI remains responsive.
- **What happens when the blue-engine is not installed?** — The Play button shows an error toast with instructions to install blue-engine and set the engine path in preferences.
- **What happens when a project has 1000+ audio clips?** — The score timeline uses virtualized rendering (`@tanstack/react-virtual`) so only visible clips are in the DOM.
- **What happens when the app is force-quit during playback?** — The engine process is orphaned but will be cleaned up by the OS. On next launch, the engine bridge detects no running instance.

## Requirements *(mandatory)*

### Functional Requirements

#### Project Setup
- **FR-301**: The `@blue/app` package MUST be rebuilt using Vite as the bundler for the renderer process
- **FR-302**: The renderer MUST use React 19 with TypeScript
- **FR-303**: The renderer MUST use Tailwind CSS with a dark theme matching Blue's existing aesthetic
- **FR-304**: The renderer MUST use Zustand for all application state management
- **FR-305**: Zustand stores MUST use `persist` middleware for recent files and UI preferences
- **FR-306**: The Electron main process MUST remain unchanged (IPC handlers, engine bridge)
- **FR-307**: The preload script MUST remain unchanged (context bridge)

#### UI Components
- **FR-308**: A `MenuBar` component with File (Open, Save, Save As, Recent Files, Quit) and Playback (Play, Stop) menus
- **FR-309**: A `WelcomeScreen` component shown when no project is loaded, with Open Project button and recent files list
- **FR-310**: A `ProjectView` component showing project metadata, score layers, and playback controls
- **FR-311**: A `ProjectMetadata` component displaying title, author, sample rate, ksmps, nchnls, version
- **FR-312**: A `ScoreTimeline` component displaying audio clips as colored blocks on a timeline
- **FR-313**: A `PlaybackControls` component with Play/Stop buttons and status indicator
- **FR-314**: A `ToastProvider` component for notification messages (save success, load errors, playback status)

#### Zustand Stores
- **FR-315**: A `useProjectStore` store managing: current `BlueData` (or null), file path, dirty state, loading state
- **FR-316**: A `usePlaybackStore` store managing: playing/stopped status, status message, error state
- **FR-317**: A `useUIStore` store managing: open panels, selected objects, zoom level, theme preferences
- **FR-318**: A `useSettingsStore` store managing: engine path, recent files list (persisted), window state (persisted)

#### IPC Integration
- **FR-319**: All Electron IPC calls MUST be wrapped in Zustand store actions (not called directly from components)
- **FR-320**: IPC event listeners MUST be set up in a root React component or custom hook, not in individual components
- **FR-321**: The Zustand stores MUST derive their state from IPC responses, not from direct Electron API calls

### Key Entities *(include if feature involves data)*

- **ProjectState** (Zustand store): `{ data: BlueData | null, filePath: string | null, isDirty: boolean, isLoading: boolean }`
- **PlaybackState** (Zustand store): `{ isPlaying: boolean, status: 'idle' | 'playing' | 'error', message: string }`
- **UIState** (Zustand store): `{ activePanel: 'welcome' | 'project', selectedLayer: string | null, zoom: number }`
- **SettingsState** (Zustand store, persisted): `{ enginePath: string, recentFiles: string[], windowBounds: { x, y, w, h } }`

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-301**: App launches in under 2 seconds (cold start)
- **SC-302**: Opening a 5MB `.blue` file displays the project view in under 1 second
- **SC-303**: The UI maintains 60fps during playback status updates
- **SC-304**: A project with 1000+ audio clips renders the timeline without jank (using virtualization)
- **SC-305**: All existing `@blue/data` tests (115) continue to pass
- **SC-306**: The Electron main process and preload scripts are unchanged from spec 002
- **SC-307**: The React app has 90%+ TypeScript strict mode compliance (no `any` types in stores or components)

## Assumptions

- The `@blue/data` package is already complete and functional (115 tests passing)
- The Electron main process (`packages/blue-app/src/main/`) and preload script work correctly
- The blue-engine C++ executable is available on the developer's system for testing
- Tailwind CSS dark theme will use a custom color palette matching Blue's existing dark aesthetic (#1a1a2e, #16213e, #0f3460, #e94560)
- No changes to `@blue/engine-client` are needed — it will be used as-is from Zustand actions
- The current stub app (`dist/renderer/index.html`) will be completely replaced by the Vite-built React app
