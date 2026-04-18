# Implementation Plan: Demo2026 Compile Investigation

**Branch**: `012-demo2026-compile-investigation` | **Date**: 2026-04-17 | **Spec**: [/Users/stevenyi/work/blue-electron/specs/012-demo2026-compile-investigation/spec.md](/Users/stevenyi/work/blue-electron/specs/012-demo2026-compile-investigation/spec.md)
**Input**: Feature specification from `/Users/stevenyi/work/blue-electron/specs/012-demo2026-compile-investigation/spec.md`

## Summary

Diagnose and fix why `~/work/blue/demo2026/01.blue` fails when playback starts in `blue-electron`, with the current visible symptom showing an orchestra compile failure around logged automation-init lines such as `gk_blue_auto96 init 5.7`. The work is investigation-led but implementation-backed: reproduce the failure reliably, determine whether the fault originates in generated CSD content, CSD parsing/splitting, stale build output, or engine compilation handoff, and drive the feature to the exit criterion of `01.blue` rendering successfully again.

## Technical Context

**Language/Version**: TypeScript 5.x, strict mode, plus Markdown investigation artifacts  
**Primary Dependencies**: Electron main-process playback path in `packages/blue-app`, `@blue/data` CSD generation, `@blue/engine-client` ZMQ protocol client, external `blue-engine` process, standalone `csound` for compile validation, and the Java-generated reference file `~/work/blue/demo2026/01.csd`  
**Storage**: Local `.blue` project file at `~/work/blue/demo2026/01.blue`, Java reference CSD at `~/work/blue/demo2026/01.csd`, generated CSD/orchestra text, and Markdown files under `/Users/stevenyi/work/blue-electron/specs/012-demo2026-compile-investigation`  
**Testing**: Manual playback reproduction plus automated `csound -n` compile evaluation against generated output, reference comparison against `01.csd`, and targeted regression tests for the identified fix  
**Target Platform**: Electron desktop app on macOS with `blue-engine` running as an external process  
**Project Type**: Investigation/debugging feature  
**Performance Goals**: Reproduce the failure in under 5 minutes, rerun the automated `csound -n` compile loop for `01.blue` in under 1 minute, isolate the root cause to one confirmed stage, and restore successful rendering without repeated exploratory sessions  
**Constraints**: Preserve the existing external-engine architecture; avoid assuming the logged error line is the real source of failure; account for possible stale built artifacts in `dist/`; use `01.csd` as a reference rather than a byte-for-byte requirement unless the evidence proves parity is needed at that level; do not broaden this work into unrelated playback parity changes  
**Scale/Scope**: One failing project, one Java reference CSD, one playback path (`toCSD` -> `parseCSD` -> `compileOrc` -> `readScore` -> `start`), one automated standalone compile loop, and one validated fix or external blocker conclusion

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Data-First, UI-Separated**: PASS. The planned work is diagnosis of an existing playback path; no UI architecture changes are required.
- **II. Backwards-Compatible Serialization**: PASS. The investigation does not propose `.blue` format changes. If a later fix touches serialization or CSD generation inputs, that follow-up must preserve backward compatibility.
- **III. JVM Dependencies Preserved, Not Replaced**: PASS. No JVM-dependent object strategy changes are in scope.
- **IV. Engine as External Process**: PASS. The plan keeps `blue-engine` as an external process and focuses on the existing handoff boundary.
- **V. Test-First for Serialization**: PASS. No serialization work is planned in this phase. If the eventual fix touches serialized project data or XML loading, round-trip tests become mandatory in the implementation phase.

**Gate Result**: PASS. No constitution violations are introduced by an investigation-first feature.

## Project Structure

### Documentation (this feature)

```text
specs/012-demo2026-compile-investigation/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code and Investigation Inputs

```text
packages/
├── blue-app/
│   └── src/main/
│       ├── main.ts
│       └── engine-bridge.ts
├── blue-data/
│   └── src/
│       ├── blue-data.ts
│       └── automation/
│           ├── parameter-helper.ts
│           └── parameter.ts
└── blue-engine-client/
    └── src/

.specify/
├── feature.json
├── memory/
│   └── constitution.md
└── templates/

test-csd.js
~/work/blue/demo2026/01.blue
```

**Structure Decision**: Keep this feature centered on documentation under `specs/012-demo2026-compile-investigation/`, using targeted source inspection and runtime reproduction against the existing playback path. No new public interfaces or feature-area source files are planned in this phase.

## Phase 0 Research Decisions

1. Investigate the live Electron playback path first, because the failure is observed during `EngineBridge.playCSD()` rather than in a standalone export workflow.
2. Treat the logged `gk_blue_auto96 init 5.7` line as a symptom window, not an assumed root cause, because the line is syntactically plausible Csound and the actual parser/compiler error may originate earlier.
3. Capture evidence at three boundaries: raw `currentData.toCSD()` output, the orchestra extracted by `parseCSD()`, and the engine-side response/stderr from `compileOrc()`.
4. Include stale-build validation early, because this repository already has generated `dist/` artifacts and prior work encountered stale runtime bundles.
5. Use the Java-generated `~/work/blue/demo2026/01.csd` as a reference artifact when narrowing the failing region, but treat it as a debugging aid rather than a blanket byte-for-byte requirement.
6. Use a fast standalone `csound -n -o /dev/null -m135` loop as the primary iteration gate for compile validity before rechecking the full Electron playback path.
7. If the full project is too noisy for diagnosis, reduce the failure by isolating the parameter-init block, the surrounding generated orchestra region, or the responsible project element rather than editing the project blindly.

## Phase 1 Design Artifacts

- `research.md`: investigation strategy, evidence checkpoints, the Java-reference usage notes, and the current hypothesis map for the `01.blue` playback failure
- `data-model.md`: entities for reproduction runs, failure signatures, pipeline stages, suspect artifacts, and diagnostic recommendations
- `quickstart.md`: concrete next-session workflow for rebuilding, reproducing, running the automated `csound -n` loop, comparing against `01.csd`, and validating the final render fix
- `tasks.md`: dependency-ordered task list for the actual investigation work

## Post-Design Constitution Check

- **I. Data-First, UI-Separated**: PASS
- **II. Backwards-Compatible Serialization**: PASS
- **III. JVM Dependencies Preserved, Not Replaced**: PASS
- **IV. Engine as External Process**: PASS
- **V. Test-First for Serialization**: PASS

**Post-Design Gate Result**: PASS.

## Complexity Tracking

No constitution exceptions or additional architectural complexity are required in this planning phase.
