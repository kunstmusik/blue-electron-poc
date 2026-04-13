# Implementation Plan: React UI Rebuild with Vite + Tailwind + Zustand

**Branch**: `003-react-ui-rebuild` | **Date**: 2026-04-12 | **Spec**: [spec.md](./spec.md)
**Prerequisite**: Specs 001-002 complete (data model, engine client, Electron shell)

## Summary

Replace the current stub Electron renderer (`packages/blue-app/src/renderer/`) with a full React application built with Vite, React 19, Tailwind CSS, and Zustand. The Electron main process and preload script remain unchanged — only the renderer is rebuilt.

## Technical Context

**Bundler**: Vite 6 (native ESM, fast HMR)
**UI Framework**: React 19 + TypeScript (strict mode)
**Styling**: Tailwind CSS 4 + custom dark theme
**State Management**: Zustand 5 with persist/immer/devtools middleware
**Icons**: Lucide React
**Notifications**: Sonner
**Virtualization**: @tanstack/react-virtual (for large timelines)
**Utilities**: clsx + tailwind-merge

**Target Platform**: macOS first, then Windows/Linux
**Performance Goals**: Launch < 2s, load 5MB file < 1s, 60fps during playback

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Data-First, UI-Separated** | ✅ | React is purely a UI layer. All business logic remains in `@blue/data`. |
| **II. Backwards-Compatible Serialization** | ✅ | No changes to serialization — `@blue/data` is unchanged. |
| **III. JVM Dependencies Preserved** | ✅ | No changes to JVM-dependent types. |
| **IV. Engine as External Process** | ✅ | Engine bridge (main process) is unchanged. Zustand calls IPC. |
| **V. Test-First for Serialization** | ✅ | No serialization changes. React components tested with vitest + testing-library. |

## Project Structure

```
packages/blue-app/
├── src/
│   ├── main/                    # Electron main process (UNCHANGED)
│   │   ├── main.ts
│   │   └── engine-bridge.ts
│   ├── preload/                 # Preload script (UNCHANGED)
│   │   └── preload.ts
│   └── renderer/                # ← REBUILT: React + Vite app
│       ├── index.html           # Vite entry HTML
│       ├── main.tsx             # React root
│       ├── App.tsx              # Root component (routing, providers)
│       ├── styles/
│       │   └── index.css        # Tailwind directives + custom theme
│       ├── stores/
│       │   ├── project-store.ts     # BlueData, file path, dirty state
│       │   ├── playback-store.ts    # Playing/stopped, status
│       │   ├── ui-store.ts          # Panels, selection, zoom
│       │   └── settings-store.ts    # Engine path, recent files (persisted)
│       ├── hooks/
│       │   ├── use-ipc-listeners.ts   # IPC → Zustand bridge
│       │   └── use-keyboard-shortcuts.ts
│       ├── components/
│       │   ├── menu-bar/
│       │   │   ├── MenuBar.tsx
│       │   │   └── MenuItem.tsx
│       │   ├── welcome/
│       │   │   ├── WelcomeScreen.tsx
│       │   │   └── RecentFilesList.tsx
│       │   ├── project/
│       │   │   ├── ProjectView.tsx
│       │   │   ├── ProjectMetadata.tsx
│       │   │   └── ScoreTimeline.tsx
│       │   ├── playback/
│       │   │   ├── PlaybackControls.tsx
│       │   │   └── StatusIndicator.tsx
│       │   └── notifications/
│       │       └── ToastProvider.tsx
│       └── utils/
│           └── format-time.ts
├── vite.config.ts             # Vite config (React plugin, Electron integration)
├── tailwind.config.ts         # Tailwind config + dark theme
├── postcss.config.js
├── package.json               # Updated: Vite, React, Tailwind, Zustand deps
└── tsconfig.json              # Updated for Vite + React
```

### Zustand Store Architecture

```
useProjectStore()
├── data: BlueData | null
├── filePath: string | null
├── isDirty: boolean
├── isLoading: boolean
├── actions
│   ├── loadProject(filePath) → calls IPC open-file
│   ├── saveProject() → calls IPC save-file
│   ├── saveProjectAs() → calls IPC save-file-as
│   └── markClean()

usePlaybackStore()
├── isPlaying: boolean
├── status: 'idle' | 'playing' | 'error'
├── message: string
├── actions
│   ├── togglePlay() → calls IPC toggle-play
│   ├── stop() → calls IPC stop-playback
│   └── setStatus(status, message)

useUIStore()
├── activePanel: 'welcome' | 'project'
├── selectedLayer: string | null
├── zoom: number
├── actions
│   ├── setActivePanel(panel)
│   ├── selectLayer(id)
│   └── setZoom(level)

useSettingsStore() + persist middleware
├── enginePath: string
├── recentFiles: string[]
├── windowBounds: { x, y, w, h }
├── actions
│   ├── addRecentFile(path)
│   ├── removeRecentFile(path)
│   └── setEnginePath(path)
```

### IPC → Zustand Bridge

```tsx
// hooks/use-ipc-listeners.ts
export function useIPCListeners() {
  const setProject = useProjectStore(s => s.setProject);
  const setPlaybackStatus = usePlaybackStore(s => s.setStatus);

  useEffect(() => {
    window.blueAPI.onProjectLoaded((info) => setProject(info));
    window.blueAPI.onPlaybackStatus((status) => setPlaybackStatus(status));
    // ... etc
  }, [setProject, setPlaybackStatus]);
}

// App.tsx
function App() {
  useIPCListeners();
  return <Router />;
}
```

## Phase Dependencies

```
Phase 14 (Vite + React + Tailwind + Zustand setup)
  └─ Depends on: existing blue-app package structure

Phase 15 (Zustand Stores + IPC Bridge)
  └─ Depends on: Phase 14, existing preload API

Phase 16 (UI Components)
  └─ Depends on: Phase 15
```

## Complexity Tracking

> All patterns follow established React + Zustand conventions.
> No complex state management — Zustand's simplicity is the right fit for this scope.
> Vite replaces the manual file-copy build step with proper HMR and production builds.
