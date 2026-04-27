# Quickstart: Output Window

**Feature**: 025-output-window
**Date**: 2026-04-27

## Prerequisites

- Project builds with `pnpm run build` (or `pnpm run dev` for development)
- Existing workbench with dockview panels is functional

## Key Files to Create/Modify

### New Files
1. `packages/blue-app/src/renderer/stores/output-store.ts` — Zustand store for output tabs/lines
2. `packages/blue-app/src/renderer/components/workbench/panels/output/OutputPanel.tsx` — Tabbed virtualized output panel
3. `packages/blue-app/src/shared/io-provider.ts` — IOProvider/InputOutput/OutputWriter TypeScript interfaces

### Modified Files
4. `packages/blue-app/src/main/main.ts` — Wire engine stdout/stderr to IPC; add "Output" to Window menu
5. `packages/blue-app/src/main/engine-bridge.ts` — Add output callback for stdout/stderr forwarding
6. `packages/blue-app/src/preload/preload.ts` — Add `onEngineOutput` / `onEngineOutputSelect` listeners
7. `packages/blue-app/src/renderer/hooks/use-ipc-listeners.ts` — Wire IPC events to output store
8. `packages/blue-app/src/renderer/types/global.d.ts` — Add new API type declarations
9. `packages/blue-app/src/shared/workbench-menu.ts` — Register OutputTopComponent panel
10. `packages/blue-app/src/renderer/components/workbench/DockviewPanel.tsx` — Add OutputTopComponent render branch

## Implementation Order

1. Define IOProvider types (`io-provider.ts`)
2. Create output Zustand store (`output-store.ts`)
3. Create OutputPanel component (`OutputPanel.tsx`)
4. Register panel in workbench (`workbench-menu.ts`, `DockviewPanel.tsx`)
5. Wire IPC (preload, global.d.ts, use-ipc-listeners)
6. Extend EngineBridge with output callbacks (`engine-bridge.ts`)
7. Wire main.ts: engine output → IPC + Window menu entry
8. Add tests (`output-store.test.ts`)

## Testing

```bash
pnpm run test        # Run all tests
pnpm run lint        # Check code style
pnpm run dev         # Start dev server and verify Output panel appears
```

Manual verification:
1. Start dev server
2. Open a project with Csound instruments
3. Check Window menu has "Output" entry
4. Start playback → Output panel shows Csound messages
5. Stop playback → Output remains visible
