# Research: Mixer Follow-Up

## Decision: Keep durable library persistence out of scope for this follow-up spec

**Rationale**: The user explicitly deferred SQLite and broader user-library storage redesign until a later initiative that can address effects, instruments, code, and similar libraries together. Spec 035 should improve the session-local workflow introduced in Spec 034 without inventing a one-off persistence model.

**Sources Reviewed**:

- User planning note captured during Spec 034/035 planning on 2026-05-01
- `/Users/stevenyi/work/blue-electron/specs/034-mixer-editor-core/spec.md`
- `/Users/stevenyi/work/blue-electron/specs/034-mixer-editor-core/research.md`

**Alternatives considered**:

- Add SQLite just for effects library follow-up work: rejected because it conflicts with the desired cross-library storage initiative.
- Save session-local mutations back to `~/.blue`: rejected because it would reintroduce the same early-risk behavior Spec 034 intentionally avoided.

## Decision: Focus the first follow-up on routing safety and advanced chain operations

**Rationale**: After the core Mixer panel exists, routing correctness and chain-editing ergonomics are the highest-value remaining gaps. Java Blue exposes combobox models and popup flows that prevent invalid destinations and support richer chain actions than the core slice needs.

**Sources Reviewed**:

- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/mixer/ChannelOutComboBoxModel.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/mixer/SubChannelOutComboBoxModel.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/mixer/EffectsPopup.java`

**Alternatives considered**:

- Spend the first follow-up on visual polish only: rejected because routing mistakes are higher-risk than cosmetic gaps.

## Decision: Use import/export and reload as explicit library workflow improvements without implying persistence ownership

**Rationale**: Java Blue supports explicit effect import/export operations independent of automatic persistence. Those flows improve development usability while respecting the current no-save stance for the canonical user library path.

**Sources Reviewed**:

- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/mixer/EffectsUtil.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/mixer/TransferableEffect.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/mixer/EffectsLibraryDialog.java`

**Alternatives considered**:

- Leave the library workspace exactly as Spec 034 delivers it until persistence exists: rejected because reload, import/export, and session organization are useful now and do not commit the app to a storage backend.

## Decision: Bound playback-aware polish to existing playback and Blue Live state

**Rationale**: Mixer follow-up polish should make the UI clearer during playback sessions, but it should not require a new engine telemetry or metering protocol unless the existing state proves insufficient. This keeps the slice small enough to remain a follow-up rather than becoming an engine-integration project.

**Sources Reviewed**:

- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/playback-store.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/blue-live-engine.ts`

**Alternatives considered**:

- Add new engine-side meter streaming as part of this spec: deferred because it materially widens the slice.

## Decision: Preserve the one-window-per-owner model and refine it rather than replacing it

**Rationale**: Spec 034 establishes the important effect-editor ownership rule. Spec 035 should build on that by improving focus behavior, missing-owner handling, and shortcut integration instead of creating a different window model.

**Sources Reviewed**:

- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/mixer/EffectEditorManager.java`
- `/Users/stevenyi/work/blue-electron/specs/034-mixer-editor-core/contracts/mixer-editor-surfaces.md`

**Alternatives considered**:

- Fold effect editors back into the main window: rejected because it would undo the deliberately chosen Java-style interaction model.

## Deferred Beyond Spec 035

- Durable effects-library persistence
- Cross-library storage redesign for effects, instruments, code, and other user assets
- Engine-protocol additions for true signal metering if existing playback state proves insufficient
- Any broader mixer automation or live-performance slice that goes beyond editor/workflow parity