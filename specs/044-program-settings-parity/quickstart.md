# Quickstart: Program Settings Parity

## Preconditions

1. Work from `/Users/stevenyi/work/blue-electron`.
2. Keep `.specify/feature.json` pointed at `specs/044-program-settings-parity`.
3. If you change `packages/blue-data/src`, rebuild `@blue/data` before rerunning app-side tests because `@blue/app` consumes `packages/blue-data/dist`.

## Validation Commands

```bash
pnpm --filter @blue/app exec vitest run --config vitest.config.ts src/main/program-settings-store.test.ts src/main/program-settings-application.test.ts src/main/program-settings-usage.test.ts src/renderer/tests/program-settings-window.test.tsx --browser.enabled=false
pnpm --filter @blue/app test
pnpm --filter @blue/app build
pnpm --filter @blue/data test -- --maxWorkers=1
./.specify/scripts/bash/check-prerequisites.sh --json --include-tasks --require-tasks
git diff --check
```

## Closeout Results

- Focused Program Settings suite: pass
- `@blue/app` package suite: pass (`91` files, `980` tests, `2` skipped)
- `@blue/app` build: pass
- `@blue/data` suite: pass (`94` files, `894` tests)
- Spec-kit prerequisite check: pass
- Diff hygiene: pass

## Manual Smoke Scenarios

1. Open Settings with no project loaded and confirm the only top-level categories are General, Project Defaults, Playback, Utility, Realtime Render, and Disk Render.
2. Change one field in each category, apply, reopen Settings, and confirm the saved values are restored.
3. Edit several fields again, cancel, reopen Settings, and confirm canceled values did not replace the last saved snapshot.

## New Project Defaults Smoke Scenario

1. Change Default Author, Mixer Enabled, Default Layer Height, Primary/Secondary Ruler settings, Snap Enabled/Snap Value, and SMPTE Frame Rate.
2. Change realtime defaults for sr, ksmps, nchnls, 0dbfs, audio/MIDI usage flags, message flags, and advanced settings.
3. Change disk defaults for sr, ksmps, nchnls, 0dbfs, message flags, and advanced settings.
4. Create a new project and confirm Project Properties and score defaults reflect the saved settings.
5. Add a new root score layer and confirm it inherits the configured default layer height.
6. Save/reload the project and confirm only normal project-owned fields were serialized; app-wide settings should not appear as a separate `.blue` settings block.
7. Note that Default UDO Style remains blocked until a future UDO/effect-creation workflow exists.

## Runtime And Matrix Smoke Scenario

1. Toggle Message Colors Enabled and Disable Displays, start realtime playback, and confirm the generated options reflect the saved values.
2. Toggle playback FPS, Latency Correction, Score Follows Playback, and Follow on Render Start, then confirm the playhead behavior uses the saved defaults.
3. Open the usage matrix or dependency notes and confirm every active Java setting is classified, Text Settings remains `resource-only-stale`, and blocked settings name their missing-feature dependency.

## Completion Criteria

- All 79 tasks in `tasks.md` are checked off.
- `spec.md` is `Closed`.
- `missing-feature-report.md` and `status.md` match current implementation behavior.
- The validation commands above pass.
- Manual smoke scenarios remain the human verification checklist; they were not rerun during the final documentation update.
