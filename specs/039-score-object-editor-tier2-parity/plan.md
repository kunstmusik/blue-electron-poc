# Implementation Plan: Score Object Editor Tier 2 Parity

**Branch**: `039-score-object-editor-tier2-parity` | **Date**: 2026-05-07 | **Spec**: [/Users/stevenyi/work/blue-electron/specs/039-score-object-editor-tier2-parity/spec.md](/Users/stevenyi/work/blue-electron/specs/039-score-object-editor-tier2-parity/spec.md)
**Input**: Feature specification from `/Users/stevenyi/work/blue-electron/specs/039-score-object-editor-tier2-parity/spec.md`

## Summary

Deliver the heavyweight remaining score-object editors after the Tier 1 cleanup: `Sound`, `PianoRoll`, and `JMask`. This slice extends the Spec 037 auxiliary editor architecture and the new Tier 1 follow-up with bespoke payloads and renderer surfaces for the three most demanding remaining editors, while intentionally keeping broader score-management/navigation work out of scope until these editor gaps are planned.

## Technical Context

**Language/Version**: TypeScript 5.8.x, React 19.x, Electron 35.x, strict monorepo packages  
**Primary Dependencies**: Spec 037 score-object editor shell and registry, Spec 038 Tier 1 follow-up patterns, existing BSB interface/automation work from Specs 022 and 023, existing `@blue/data` `Sound`, `PianoRoll`, and `JMask` models, Zustand 5.x, Dockview 5.2.0, Vitest 4.x  
**Storage**: canonical score objects remain in main-process `BlueData`; renderer reads Tier 2 editor documents on demand and writes back through the existing score patch flow  
**Testing**: Vitest shared-contract, renderer, and main-process coverage plus renderer build validation  
**Target Platform**: Electron desktop on macOS first  
**Project Type**: app-layer parity feature with substantial renderer/editor work built on existing shared score-object infrastructure  
**Performance Goals**: Tier 2 editors must keep heavy note or generator payloads scoped to the active selection and avoid full-project snapshot churn  
**Constraints**: preserve Java `.blue` compatibility, reuse earlier BSB/editor infrastructure where practical, keep unsupported Tier 2 subfeatures explicit, and defer score-manager/navigation work until after these editors are planned  
**Scale/Scope**: three bespoke editor families and the shared contract extensions needed to load and mutate them canonically

## Constitution Check

- **Data-First, UI-Separated**: PASS. Canonical Tier 2 object data remains in `@blue/data` and shared patch helpers.
- **Backwards-Compatible Serialization**: PASS. All writes continue through canonical score patches.
- **JVM Dependencies Preserved, Not Replaced**: PASS. Java Blue remains the parity source for `Sound`, `PianoRoll`, and `JMask` editor behavior.
- **Engine as External Process**: PASS. This slice concerns editor-state and preview affordances only.
- **Test-First for Serialization**: PASS. The plan requires document-contract and renderer coverage for all three Tier 2 editors.
- **Research Integration**: PASS. The plan builds on prior BSB and score-editor slices rather than inventing unrelated architecture.

## Project Structure

### Documentation

```text
/Users/stevenyi/work/blue-electron/specs/039-score-object-editor-tier2-parity/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── score-object-editor-tier2-surfaces.md
└── tasks.md
```

### Source Code

```text
/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts
/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score-object/
/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/
/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/
```

**Structure Decision**: Keep the shared auxiliary shell from Spec 037, but allow each Tier 2 editor to introduce its own dedicated renderer surface and payload variant where necessary.

## Phase 0 Research Output

See [/Users/stevenyi/work/blue-electron/specs/039-score-object-editor-tier2-parity/research.md](/Users/stevenyi/work/blue-electron/specs/039-score-object-editor-tier2-parity/research.md).

## Phase 1 Design Output

- [/Users/stevenyi/work/blue-electron/specs/039-score-object-editor-tier2-parity/data-model.md](/Users/stevenyi/work/blue-electron/specs/039-score-object-editor-tier2-parity/data-model.md)
- [/Users/stevenyi/work/blue-electron/specs/039-score-object-editor-tier2-parity/contracts/score-object-editor-tier2-surfaces.md](/Users/stevenyi/work/blue-electron/specs/039-score-object-editor-tier2-parity/contracts/score-object-editor-tier2-surfaces.md)
- [/Users/stevenyi/work/blue-electron/specs/039-score-object-editor-tier2-parity/quickstart.md](/Users/stevenyi/work/blue-electron/specs/039-score-object-editor-tier2-parity/quickstart.md)

## Post-Design Constitution Check

- **Data-First, UI-Separated**: PASS. Tier 2 editors remain consumers of on-demand editor documents.
- **Backwards-Compatible Serialization**: PASS. Canonical mutation stays in shared patch helpers.
- **JVM Dependencies Preserved, Not Replaced**: PASS. Java editors remain the parity source.
- **Engine as External Process**: PASS. No transport or playback architecture changes are introduced.
- **Test-First for Serialization**: PASS. Contract and renderer tests are planned before parity is claimed.
- **Research Integration**: PASS. The slice builds intentionally on Specs 022, 023, 037, and 038.