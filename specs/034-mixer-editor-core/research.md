# Research: Mixer Editor Core

## Decision: Treat the existing `@blue/data` mixer models as the baseline and audit gaps before adding new structures

**Rationale**: `packages/blue-data/src/mixer/` already contains `Mixer`, `Channel`, `EffectsChain`, `Effect`, `Send`, `EffectManager`, and `MixerNode`, and Spec 032 already closed the runtime-model parity slice for mixer XML and routing behavior. Spec 034 should begin with an audit against the Java classes rather than assuming the mixer data model is still missing.

**Sources Reviewed**:

- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/mixer/mixer.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/mixer/channel.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/mixer/effect.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/mixer/effect-manager.ts`
- `/Users/stevenyi/work/blue-electron/STATUS.md` (Spec 032 closeout)
- `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/mixer/Mixer.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/mixer/Channel.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/mixer/Effect.java`

**Alternatives considered**:

- Start with a new pure `@blue/data` parity spec: rejected because it would mostly duplicate Spec 032 and delay the real missing work in the app layer.

## Decision: Extend the existing project snapshot and patch bridge rather than creating a mixer-only state store

**Rationale**: The current app already uses typed snapshots and patch intents for Orchestra, Blue Live, MIDI Input, and BSB editing. The Mixer panel has the same shape of problem: renderer needs optimistic updates, main process needs canonical ownership, and cross-surface changes must reconcile back into one project document. Reusing that bridge is lower risk than inventing a mixer-specific store.

**Sources Reviewed**:

- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/preload/preload.ts`
- `/Users/stevenyi/work/blue-electron/specs/033-midi-input-virtual-keyboard-parity/plan.md`

**Alternatives considered**:

- Instantiate `@blue/data` mixer objects directly in the renderer: rejected because it breaks the existing canonical-document model.
- Add a mixer-only IPC channel separate from the project patch flow: rejected because it would split project state ownership and complicate arrangement synchronization.

## Decision: Load the real user effects library from `~/.blue` into a mutable session copy and never save it in this slice

**Rationale**: The user explicitly wants development work unblocked without risking unintended writes to their actual library. Java Blue stores the effects library in XML under the user config area. Matching that load path while constraining all mutations to an in-memory session copy provides safe realism for development.

**Sources Reviewed**:

- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/mixer/EffectsLibrary.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/mixer/EffectsLibraryDialog.java`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/settings-window.ts`

**Alternatives considered**:

- Write back to `~/.blue` immediately: rejected because it is risky during early parity work.
- Introduce SQLite now for effects only: rejected because the user explicitly deferred all library-storage redesign work and wants that solved later across effects, instruments, code, and related libraries.

## Decision: Use a modal library-management surface plus non-modal effect editor windows

**Rationale**: Java Blue separates effects-library management from individual effect editing. The library surface is dialog-like, while editing a specific effect is window-based and reusable. This split also maps cleanly onto the current Electron architecture: a menu-driven modal management flow plus non-modal child windows for focused editing.

**Sources Reviewed**:

- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/mixer/EffectsLibraryDialog.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/mixer/EffectEditor.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/mixer/EffectEditorManager.java`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/settings-window.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/workbench-menu.ts`

**Alternatives considered**:

- Put both library management and effect editing inside the Mixer panel: rejected because it would overload the panel and diverge from the Java interaction model.
- Open effect editors as modal windows: rejected because the user explicitly requested non-modal windows and Java reuses dedicated dialogs.

## Decision: Reuse existing BSB, UDO, and CodeMirror editor surfaces for effect editing

**Rationale**: The effect editor needs three families of functionality that already exist in the app: interface-widget editing, embedded UDO editing, and ORC-focused text editing. Spec 034 should validate that these surfaces are reusable for mixer effects rather than introducing a second UI stack with similar behavior.

**Sources Reviewed**:

- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/BlueSynthBuilderEditor.tsx`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/BSBInterfaceEditor.tsx`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/BSBUDOPanel.tsx`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/udo/UdoEditor.tsx`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/editors/SelectedCodeEditor.tsx`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/mixer/EffectEditor.java`

**Alternatives considered**:

- Build a new mixer-only interface editor: rejected because it duplicates existing BSB work.
- Keep effect code editing as a plain text area: rejected because parity and existing editor affordances both call for reusing CodeMirror.

## Decision: Make arrangement-driven channel synchronization a first-class planning requirement

**Rationale**: The user identified UI synchronization as the main trick in this feature, and the Java implementation handles channel identity through instrument association logic. Spec 034 must explicitly plan for reconciliation when arrangement rows change so the Mixer panel does not drift from the project document.

**Sources Reviewed**:

- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/mixer/MixerTopComponent.java`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts`

**Alternatives considered**:

- Treat channel synchronization as UI-only derived state with no canonical reconciliation: rejected because the canonical document still needs stable channel associations and consistent routing state.

## Deferred To Later Specs

- Durable effects-library persistence or SQLite-backed storage
- Cross-library persistence unification for effects, instruments, code, and other user libraries
- Deep meter visualization, playback-aware metering, and other live-polish items beyond the core editing workflow
- Advanced drag-and-drop and import/export parity that does not block the first usable mixer release