# Tasks: React UI Rebuild with Vite + Tailwind + Zustand

**Input**: Design documents from `specs/003-react-ui-rebuild/`
**Prerequisites**: Specs 001-002 complete (data model, engine client, Electron shell)

---

## Phase 14: Vite + React + Tailwind + Zustand Setup

### Dependencies and Config
- [x] T301 [P] Install Vite, React 19, @vitejs/plugin-react, @types/react
- [x] T302 [P] Install Tailwind CSS 4, postcss, autoprefixer
- [x] T303 [P] Install Zustand 5, zustand/middleware persist/immer/devtools
- [x] T304 [P] Install lucide-react, sonner, clsx, tailwind-merge, @tanstack/react-virtual
- [x] T305 Update `packages/blue-app/package.json` — replace electron-only deps with Vite + React deps
- [x] T306 Create `vite.config.ts` — React plugin, root config, build output to `dist/renderer`
- [x] T307 Create `tailwind.config.ts` — dark theme colors matching Blue aesthetic
- [x] T308 Create `packages/blue-app/src/renderer/index.html` — Vite entry HTML
- [x] T309 Create `packages/blue-app/src/renderer/main.tsx` — React root with StrictMode
- [x] T310 Create `packages/blue-app/src/renderer/styles/index.css` — Tailwind directives + custom theme
- [x] T311 Update build script in `package.json` — use `vite build` instead of manual copy

### App Shell
- [x] T312 Create `App.tsx` — root component with IPC listeners hook
- [x] T313 Create `hooks/use-ipc-listeners.ts` — wires IPC events to Zustand stores
- [x] T314 Create `hooks/use-keyboard-shortcuts.ts` — Space=play, Escape=stop, Cmd+O=open, Cmd+S=save

---

## Phase 15: Zustand Stores + IPC Bridge

### Project Store
- [x] T315 [P] Create `stores/project-store.ts` — BlueData, filePath, isDirty, isLoading, actions
- [x] T316 Wire `loadProject()` action to `window.blueAPI.openFile()`
- [x] T317 Wire `saveProject()` action to `window.blueAPI.saveFile()`
- [x] T318 Wire `saveProjectAs()` action to `window.blueAPI.saveFileAs()`

### Playback Store
- [x] T319 [P] Create `stores/playback-store.ts` — isPlaying, status, message, actions
- [x] T320 Wire `togglePlay()` action to `window.blueAPI.togglePlay()`
- [x] T321 Wire `stop()` action to `window.blueAPI.stopPlayback()`

### UI Store
- [x] T322 [P] Create `stores/ui-store.ts` — activePanel, selectedLayer, zoom, actions

### Settings Store (Persisted)
- [x] T323 Create `stores/settings-store.ts` — enginePath, recentFiles, windowBounds
- [x] T324 Add `persist` middleware for recent files and window state
- [x] T325 Wire `addRecentFile()` / `removeRecentFile()` actions

### IPC Integration
- [x] T326 Update `use-ipc-listeners.ts` — connect all IPC events to store actions
- [x] T327 Update `use-keyboard-shortcuts.ts` — global keyboard handler

---

## Phase 16: UI Components

### Menu Bar
- [ ] T328 [P] Create `components/menu-bar/MenuBar.tsx` — File + Playback menus
- [ ] T329 Create `components/menu-bar/MenuItem.tsx` — reusable menu item component

### Welcome Screen
- [ ] T330 [P] Create `components/welcome/WelcomeScreen.tsx` — title, tagline, Open button
- [ ] T331 Create `components/welcome/RecentFilesList.tsx` — clickable recent files

### Project View
- [ ] T332 Create `components/project/ProjectView.tsx` — main project layout
- [ ] T333 Create `components/project/ProjectMetadata.tsx` — title, author, sr, ksmps, nchnls
- [ ] T334 Create `components/project/ScoreTimeline.tsx` — audio clips as colored blocks
- [ ] T335 Implement clip virtualization for large projects (@tanstack/react-virtual)

### Playback Controls
- [ ] T336 [P] Create `components/playback/PlaybackControls.tsx` — Play/Stop buttons
- [ ] T337 Create `components/playback/StatusIndicator.tsx` — playing/stopped/error indicator

### Notifications
- [ ] T338 [P] Create `components/notifications/ToastProvider.tsx` — Sonner integration
- [ ] T339 Wire toast notifications to IPC error/success events

### Integration
- [ ] T340 Connect MenuBar actions to Zustand stores
- [ ] T341 Connect WelcomeScreen to project store (shows when no project loaded)
- [ ] T342 Connect ProjectView to project store (shows when project loaded)
- [ ] T343 Connect PlaybackControls to playback store
- [ ] T344 Connect StatusIndicator to playback store
- [ ] T345 Connect RecentFilesList to settings store

---

## Phase 17: Polish and Testing

### Build and Dev Experience
- [ ] T346 Configure Vite HMR for Electron renderer
- [ ] T347 Configure production build output to `dist/renderer/`
- [ ] T348 Update Electron main process to load `dist/renderer/index.html` from Vite build

### Testing
- [ ] T349 [P] Test: Open .blue file → project metadata displays correctly
- [ ] T350 [P] Test: Play/Stop toggles state correctly
- [ ] T351 [P] Test: Save/Save As writes file correctly
- [ ] T352 [P] Test: Recent files persist across restarts
- [ ] T353 [P] Test: Keyboard shortcuts work (Space, Escape, Cmd+O, Cmd+S)
- [ ] T354 Integration test: Full open → play → stop → save flow

### Polish
- [ ] T355 Add loading spinner during file load
- [ ] T356 Add error boundary for renderer crashes
- [ ] T357 Responsive layout adjustments

---

## Phase Dependencies

- **Phase 14**: No dependencies on other phases. Can start immediately.
- **Phase 15**: Depends on Phase 14 (Vite + React setup).
- **Phase 16**: Depends on Phase 15 (stores + IPC bridge).
- **Phase 17**: Depends on Phase 16 (all components in place).
