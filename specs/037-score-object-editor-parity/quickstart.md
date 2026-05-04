# Quickstart: Score Object Editor Parity

## Goal

Manually validate that Spec 037 replaces the auxiliary score-object placeholders with real Java Blue-style shared properties and type-specific editor surfaces, including `Instance`, library-backed, `AudioClip`, and unsupported-selection behavior.

## Preconditions

1. Build and run the Electron app from `/Users/stevenyi/work/blue-electron` after Spec 037 implementation is complete.
2. Prepare one or more representative projects containing:
   - at least one code-backed score object such as `GenericScore`, `PythonObject`, `JavaScriptObject`, `Comment`, or `External`
   - at least one `AudioClip` inside an `AudioLayerGroup`
   - at least one library-backed object or an `Instance` that resolves to a library object
   - at least one score object with note processors or repeat-point or time-behavior data
   - if possible, one unsupported or Java-only score object fixture to confirm fallback behavior

## Validation Steps

1. Launch the app with no project loaded.
2. Open `SoundObjectPropertiesTopComponent` and `ScoreObjectEditorTopComponent` from the workbench.
3. Confirm both panels show deliberate empty states rather than generic placeholders.
4. Load the representative project and focus `ScoreTopComponent`.
5. Select one supported timeline object.
6. Confirm the properties panel shows shared fields for the active selection:
   - name
   - start time
   - subjective duration
   - color
   - time behavior, repeat point, and note processor chain when the type supports them
7. Change the shared name, start time, duration, and color.
8. Confirm the score shell updates without losing selection context.
9. For a `SoundObject`, change time behavior and repeat point if applicable.
10. Confirm the properties panel applies the change and the selection refreshes with the new state.
11. Use the note-processor-chain affordance.
12. Confirm existing processors are listed clearly and unsupported processors, if any, remain visible as preserved unsupported entries.
13. Select a code-backed score object such as `GenericScore`, `PythonObject`, or `JavaScriptObject`.
14. Confirm `ScoreObjectEditorTopComponent` loads the correct editor family and syntax-oriented editing surface.
15. Change type-specific content and confirm the editor refreshes against the canonical object after the edit.
16. Select an `AudioClip`.
17. Confirm the shared properties panel still works and the type-specific editor switches to clip-oriented fields such as audio file, file-start offset, fades, and looping.
18. Select an `Instance` or a library-backed object.
19. Confirm both auxiliary panels indicate library-editing context and route to the underlying editable object instead of a dead-end placeholder.
20. Select multiple score objects, then clear the selection entirely.
21. Confirm both panels fall back to deliberate multi-selection or no-selection states instead of showing stale content.
22. If an unsupported or Java-only score object is available, select it and confirm the panels show an explicit unsupported message.
23. Remove or invalidate the currently edited target while either auxiliary panel remains open.
24. Confirm the panels clear safely and do not crash or retain stale controls.

## Expected Results

- `SoundObjectPropertiesTopComponent` and `ScoreObjectEditorTopComponent` are no longer placeholders.
- Shared ScoreObject fields can be edited for supported selections.
- Type-specific editors load for the supported TypeScript score-object families plus `AudioClip`.
- `Instance` and library-backed objects route to the underlying editable target with clear library-context messaging.
- Unsupported, ambiguous, empty, and removed-target states surface deliberate fallback UI.

## Suggested Automated Coverage

- `packages/blue-data/src/sound-objects/sound-object-library.test.ts`
- `packages/blue-app/src/renderer/tests/score-object-editor-contract.test.ts`
- `packages/blue-app/src/renderer/tests/score-object-properties-panel.test.tsx`
- `packages/blue-app/src/renderer/tests/score-object-editor-panel.test.tsx`
- `packages/blue-app/src/renderer/tests/score-object-editor-routing.test.tsx`
- `packages/blue-app/src/renderer/tests/score-object-editor-fallbacks.test.tsx`