# Project Status — blue-electron

**Date**: 2026-04-18
**Branch**: `004-bsb-instruments`

## Current Active Work — Engine State And Playback Lifecycle

The current staged work in this repository moves playback completion and stop handling off the old duration-derived fallback and onto authoritative engine state.

### Current Status

- `@blue/engine-client` now exposes both `GET_ENGINE_STATE` polling and `engine.state` pub/sub subscriptions.
- `blue-app` now treats pub/sub terminal state as the primary playback exit path and uses polling only as reconciliation if an event is missed.
- the renderer playback model now includes an explicit `stopping` state, so stop is no longer optimistically rendered as complete before the engine reports its terminal state.
- the `engine.state` subscriber no longer uses a receive timeout; quiet playback gaps are normal for a sparse state-change stream, and the background subscription loop now handles shutdown and listener errors without triggering unhandled promise rejections.
- `research/003-engine-protocol.md` now documents the control socket, pub/sub socket, `GET_ENGINE_STATE`, and the JSON lifecycle snapshot schema.

### Active Files

| Area | Files | Purpose |
|---|---|---|
| Electron playback orchestration | `packages/blue-app/src/main/engine-bridge.ts`, `packages/blue-app/src/main/main.ts` | start blue-engine with control + pub ports, consume engine state events, and reconcile playback shutdown |
| Renderer playback UX | `packages/blue-app/src/renderer/stores/playback-store.ts`, `packages/blue-app/src/renderer/components/menu-bar/MenuBar.tsx`, `packages/blue-app/src/renderer/components/playback/PlaybackControls.tsx`, `packages/blue-app/src/renderer/hooks/use-keyboard-shortcuts.ts`, `packages/blue-app/src/renderer/hooks/use-ipc-listeners.ts`, `packages/blue-app/src/renderer/types/global.d.ts` | reflect `starting`/`stopping`/`stopped` transitions accurately |
| Engine protocol client | `packages/blue-engine-client/src/protocol.ts`, `packages/blue-engine-client/src/engine-client.ts`, `packages/blue-engine-client/src/index.ts` | add polling, pub/sub, state snapshot decoding, and safer subscription lifecycle handling |
| Regression coverage | `packages/blue-engine-client/tests/engine-client.test.ts`, `packages/blue-engine-client/tests/protocol.test.ts`, `packages/blue-app/src/renderer/tests/app.test.ts` | cover state polling, pub/sub dispatch, listener isolation, and renderer stop-state behavior |
| Protocol notes | `research/003-engine-protocol.md` | record the current cross-repo engine contract |

### Verification

- `cd packages/blue-engine-client && pnpm test && pnpm build`
- `cd packages/blue-app && pnpm test && pnpm build`
- live smoke test against a matching `blue-engine` binary verified pub/sub delivery of `ready -> running -> stopped(completed)` for a multi-second score with no polling assist

### Coordination Note

This repository work expects a matching `blue-engine` binary that supports both `GET_ENGINE_STATE` on the control socket and `engine.state` on the pub/sub socket. The Electron-side logic here is correct only when paired with that updated engine protocol.

## Spec 011 — Closed

Feature `011-window-system-research` is complete under the Spec Kit flow. The spec, plan, research, data model, quickstart, tasks, and checklist are all present under `specs/011-window-system-research/`.

**Recommendation**: dockview v5.x (preferred), rc-dock v3.3.2 (fallback).

## Committed Baseline

This branch still includes the initial dockview-based workbench baseline in `blue-app`. It remains an exploratory shell for the future window-system work, not the end state of the window-system effort.

### Included In This Commit

| Component | File | Purpose |
|---|---|---|
| Panel registry | `src/renderer/components/workbench/panel-registry.ts` | All 21 Blue panels with stable IDs matching Java `preferredID`, grouped by mode (editor/properties/output) |
| Placeholder panels | `src/renderer/components/workbench/panels/PlaceholderPanel.tsx` | Stub renderer showing panel name + mode |
| Dockview wrapper | `src/renderer/components/workbench/DockviewPanel.tsx` | Maps dockview panels to registry descriptors |
| Workbench shell | `src/renderer/components/workbench/WorkbenchShell.tsx` | 3-area dockview layout (editors center, properties right, output below), layout save/restore to localStorage |
| Window menu | `src/renderer/components/workbench/WindowMenu.tsx` | Dropdown listing all 21 panels by mode, opens/focuses on click |
| Workbench store | `src/renderer/stores/workbench-store.ts` | `openPanel`, `focusPanel`, `closePanel`, `saveLayout`, `loadLayout` |
| Theme overrides | `src/renderer/styles/index.css` | Dockview CSS variables matching Blue dark theme |
| MenuBar update | `src/renderer/components/menu-bar/MenuBar.tsx` | Shows Window menu when project is loaded |
| App routing update | `src/renderer/App.tsx` | Uses WorkbenchShell instead of old ProjectView |

### Verification

- `pnpm test` passes
- `pnpm build` passes

### Spec 011 Artifacts

| File | Purpose |
|---|---|
| `specs/011-window-system-research/research.md` | Capability baseline, 6-candidate comparison matrix, recommendation |
| `specs/011-window-system-research/quickstart.md` | Prototype handoff notes |
| `specs/011-window-system-research/spec.md` | Feature specification |
| `specs/011-window-system-research/tasks.md` | All 21 tasks checked off |

## Immediate Next Specs

1. **Spec 012**: closed; demo2026 now matches the Java reference `01.csd` byte-for-byte
2. **Spec 013**: continue the collapsed sidebar group research and decide whether dockview edge groups, paneview, or a custom collapse wrapper should back the properties/output sidebars

## Spec 012 — Closed

`~/work/blue/demo2026/01.blue` now compiles cleanly and matches the Java reference `01.csd` byte-for-byte. The earlier handoff overstated progress: after reviewing the generated output against Java source and `01.csd`, several non-cosmetic parity bugs still remained. Those issues are now fixed.

### Current Parity Status

- `csound -n` on the generated demo2026 CSD completes with 0 errors
- score semantics now match the Java reference for note timing, always-on duration, and render order
- `pnpm --filter @blue/data build` passes
- `pnpm --filter @blue/data test -- --maxWorkers=1` passes with **31 test files / 424 tests**
- `diff -w -B <(grep -v '^; Generated by blue ' 01.csd) <(grep -v '^; Generated by blue ' /tmp/01_generated.csd)` is empty
- `diff -u /Users/stevenyi/work/blue/demo2026/01.csd /tmp/01_generated.csd | wc -l` returns `0`
- repository guidance now explicitly requires consulting the Java implementation first for parity and behavior bugs (`AGENTS.md`, `CLAUDE.md`)

### Original Fixes

| # | Bug | Root Cause | Fix Location |
|---|---|---|---|
| 1 | `blueDuration is not defined` | JS engine injected `duration` param; Java injects `blueDuration` global | `javascript-object.ts` |
| 2 | No shared JS execution context | Each `new Function()` had isolated scope; Java uses persistent `ScriptEngine` | `javascript-object.ts` |
| 3 | `duration=0` for JS sound objects | XML tag mismatch: TS used `<bar>/<beat>`; Java uses `<bars>/<beats>` | `time-duration.ts` |
| 4 | SECONDS/FRAME tag mismatch | TS used `<seconds>/<frameNumber>`; Java uses `<totalSeconds>/<frameCount>` | `time-duration.ts`, `time-position.ts` |
| 5 | Score note `ii` double-prefix | TS stored raw `"i1"` as p1 and `toScoreText()` added another `"i"` | `generic-score.ts`, `javascript-object.ts` |
| 6 | `chnexport "channel already exists"` | Side effect of malformed `ii1` score events | resolved by bug #5 |
| 7 | Mixer effect UDOs after instruments | Java emits mixer effect UDOs before arrangement instruments | `blue-data.ts` |

### Additional Parity Fixes From This Review Pass

| Area | Issue | Fix Location |
|---|---|---|
| Always-on scheduling | TS only added mixer extra render time to `BlueMixer`; Java extends the shared render duration for all always-on events | `blue-data.ts` |
| Render order | `NoteList.merge()` sorted on every merge, changing Java append-order semantics | `sound-objects/note-list.ts` |
| `GenericScore` timing semantics | TS parsed raw score text but skipped note processors, time behavior, and start offsets | `sound-objects/generic-score.ts` |
| `JavaScriptObject` timing semantics | TS skipped note processors, time behavior, and start offsets after JS note generation | `sound-objects/javascript-object.ts` |
| Numeric formatting | TS emitted raw JS floats (`1.7000000000000002`); Java Blue uses a custom formatter for parameter-like values | `utilities/number-format.ts`, `blue-data.ts`, `instruments/blue-synth-builder/bsb-widget.ts`, `instruments/blue-synth-builder/bsb-xy-controller.ts` |
| Score text formatting | Java uses `Double.toString()` for note start times and tempo statements, not the Blue formatter | `utilities/number-format.ts`, `sound-objects/note.ts`, `blue-data.ts` |
| Project banner formatting | Java always emits the empty notes comment block; TS omitted it when notes were blank | `blue-data.ts` |
| Effect UDO formatting | Modern effect UDOs emitted `xout aout1, aout2`; Java emits `xout\taout1,aout2` for both styles | `mixer/effect.ts` |
| Parameter/string init spacing | TS emitted tab-separated init and `chnexport` lines; Java reference uses plain spaces | `blue-data.ts` |

### Formatter Finding

Java Blue is **not** relying on default Java number printing everywhere.

- `blue.utility.NumberUtilities.formatDouble()` uses `MessageFormat("{0,number,##.##########}", Locale.ENGLISH)`
- Java still uses `Double.toString()` for note start times and tempo values
- the TypeScript port now mirrors that split behavior instead of applying one formatter globally

### Regression Coverage Added

- `packages/blue-data/tests/integration/demo2026-render-parity.test.ts`
- `packages/blue-data/tests/utilities/number-format.test.ts`
- `packages/blue-data/tests/mixer/effect-udo.test.ts` now asserts exact modern/classic `xout` formatting
- `packages/blue-data/tests/time/time-duration.test.ts` now covers Java tag names (`bars`/`beats`, `totalSeconds`, `frameCount`) and legacy fallback loading
- `packages/blue-data/tests/time/time-position.test.ts` now covers Java tag names (`totalSeconds`, `frameCount`) and legacy fallback loading
- `packages/blue-data/tests/integration/node-api-usage.test.ts` updated to assert the Java-aligned `GenericScore` timing behavior

### Spec 012 Artifacts

| File | Purpose |
|---|---|
| `specs/012-demo2026-compile-investigation/spec.md` | Feature specification |
| `specs/012-demo2026-compile-investigation/plan.md` | Implementation plan |
| `specs/012-demo2026-compile-investigation/research.md` | Root cause analysis |
| `specs/012-demo2026-compile-investigation/tasks.md` | Task breakdown |
| `specs/012-demo2026-compile-investigation/data-model.md` | Data model |
| `specs/012-demo2026-compile-investigation/quickstart.md` | Quickstart guide |
| `specs/012-demo2026-compile-investigation/checklists/requirements.md` | Requirements checklist |

## Follow-On After 012/013

1. Continue the collapsed-sidebar / window-system follow-on work for Spec 013
2. Harden the workbench shell behavior around placement, ordering, persistence, and lifecycle
3. Replace `PlaceholderPanel` with real editor implementations
4. Remove `ProjectView` once the workbench shell is confirmed as the permanent project surface

## Notes

- Layout persistence still uses localStorage keyed by `blue-workbench-layout`; moving that to Electron `userData` remains follow-on work.
- `AGENTS.md` and `CLAUDE.md` now include repository-level Java-first debugging guidance for future parity work.
- In this shell environment, `vitest` may intermittently fail to spawn worker processes with `EAGAIN`; rerun with `pnpm --filter @blue/data test -- --maxWorkers=1` when that happens.
