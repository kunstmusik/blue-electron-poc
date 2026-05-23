# Status: ScoreObject BarRenderer Parity

**Date**: 2026-05-22
**Branch**: `047-score-object-bar-renderers`
**State**: Closed, validated

## Handoff Summary

Spec 047 is closed. The slice delivered Java Blue score-object bar-renderer parity across the Score timeline: generic, comment, and letter-badge renderers; PianoRoll thumbnails; AudioFile and FrozenSoundObject waveform bars; and Java-style audio-layer AudioClip waveform and fade rendering backed by typed snapshot metadata instead of renderer-side XML parsing.

Closeout review found and fixed the remaining parity gaps instead of documenting them away. The final pass corrected AudioClip selected and unselected fill semantics to use the Java translucent-alpha treatment, restored multi-line labels for AudioFile and FrozenSoundObject bars, expanded direct renderer coverage for those audio paths, and kept the broader score interaction surface green after the renderer extraction.

## Artifact Inventory

- `spec.md`: Closed feature spec for score-object bar-renderer parity.
- `plan.md`: Implementation plan for snapshot payloads, registry dispatch, and renderer families.
- `research.md`: Java parity anchors and TypeScript seam audit.
- `data-model.md`: `ScoreRowObjectSnapshot.barRenderer` union plus waveform and fade payloads.
- `contracts/score-object-bar-renderer-surface.md`: Shared snapshot and renderer contract for score bars.
- `quickstart.md`: Updated validation commands and manual parity scenarios.
- `tasks.md`: Implementation checklist reflecting completed renderer, interaction, and closeout work.
- `checklists/requirements.md`: Completed spec-readiness checklist retained for the feature package.
- `status.md`: This closeout summary.

## Delivered Scope

- Extended shared score-row and audio-clip snapshots with typed `barRenderer` payloads for generic, comment, letter, PianoRoll, AudioFile, FrozenSoundObject, AudioClip, and explicit fallback cases.
- Replaced the single inline score-bar JSX path with a registry-based renderer surface and shared Java-style color, repeat-marker, label, PianoRoll-thumbnail, waveform, and fade helpers.
- Implemented Java `GenericView`, `CommentView`, and `LetterRendererView` parity, including selected-state colors, multi-line label splitting, readable text contrast, and repeat markers.
- Implemented Java `PianoRollView` thumbnail drawing for `SCALE`, `REPEAT`, `REPEAT_CLASSIC`, and `NONE` behavior branches.
- Implemented Java-style waveform bars for `AudioFile`, `FrozenSoundObject`, and audio-layer `AudioClip`, including waveform caching outside `@blue/data`, file-start offsets, looping, fade polygons, extended-duration shading, and the final audio fill and multi-line label parity fixes from closeout review.
- Preserved score selection, drag, resize, context-menu, copy/paste, nested-score, and audio-layer editing behavior while moving rendering to snapshot-driven components.

## Adjacent Fixes On This Branch

- Added shared score clipboard helpers and cross-group renderer tests so score and audio-layer clipboard behavior stays stable after the timeline rendering refactor.
- Synced compiled runtime parameter names back onto live arrangement and audio-layer parameters before realtime playback, with main-process regression coverage.
- Updated `Mixer.loadFromXML()` to merge Java `channelListGroups` source-channel data with flat channel lists so imported audio-layer routing stays intact.
- Corrected `PianoRoll.getTimeBehavior()` to return the stored `_timeBehavior`, which keeps the bar renderer and properties panel aligned.

## Validation State

Automated validation completed:

- `pnpm --filter @blue/app exec vitest run --config vitest.config.ts src/renderer/tests/score-object-bar-renderer-contract.test.ts src/renderer/tests/score-object-bar-renderers.test.ts src/renderer/tests/audio-clip-bar-renderer.test.tsx --browser.enabled=false` — pass (`3` files, `94` tests)
- `pnpm --filter @blue/app exec vitest run --config vitest.config.ts src/renderer/tests/audio-layer-group-canvas.test.tsx src/renderer/tests/score-time-canvas-cross-group.test.tsx src/renderer/tests/score-object-properties-panel.test.tsx src/renderer/tests/score-object-editor-panel.test.tsx src/renderer/tests/score-panel-session-reset.test.tsx --browser.enabled=false` — pass (`5` files, `64` tests)
- `pnpm --filter @blue/app test` — pass (`110` files, `1233` passed, `2` skipped)
- `pnpm --filter @blue/app build` — pass
- `pnpm --filter @blue/data test -- --maxWorkers=1` — pass (`94` files, `916` tests)
- `./.specify/scripts/bash/check-prerequisites.sh --json --include-tasks --require-tasks` — pass
- `git diff --check` — pass

## Notes

- Manual quickstart scenarios were exercised during implementation, and the user re-verified the audio renderer after the final parity fixes on 2026-05-22.
- The focused interaction suite still emits jsdom `HTMLCanvasElement.getContext()` warnings in tests that mount canvas-backed surfaces without the optional `canvas` package, but those warnings are pre-existing and the suites exit cleanly.
- Java-only `ClojureObjectView` remains explicit fallback coverage rather than a silently claimed port; `ObjectBuilder` remains documented as fallback-mapped unless full data support lands in a later slice.

## Next Action

Spec 047 can be treated as closed. The next useful step is selecting the next score, editor, or parity slice.
