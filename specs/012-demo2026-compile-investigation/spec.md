# Feature Specification: Demo2026 Compile Investigation

**Feature Branch**: `012-demo2026-compile-investigation`  
**Created**: 2026-04-17  
**Status**: Closed — implemented with successful playback/render and byte-for-byte Java parity (2026-04-18)  
**Input**: User description: "Investigate why `~/work/blue/demo2026/01.blue` is not compiling when playback starts. Current symptom shows a generated-orchestra failure around automation initialization lines such as `gk_blue_auto96 init 5.7`."

Use [STATUS.md](/Users/stevenyi/work/blue-electron/STATUS.md) as the authoritative current summary. This document is retained as the feature record for the demo2026 compile investigation that is now complete.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reproduce The Playback Failure (Priority: P1)

As a maintainer debugging `01.blue`, I need a reliable reproduction path and a clean failure report so the team can confirm the problem before attempting any fix.

**Why this priority**: Without a stable reproduction and agreed failure signature, any later debugging work risks chasing unrelated symptoms or stale builds.

**Independent Test**: Can be fully tested by following a documented playback workflow for `~/work/blue/demo2026/01.blue` and confirming that the investigation captures the observable failure signature and where in the play pipeline it occurs.

**Acceptance Scenarios**:

1. **Given** the current `blue-electron` app and the `01.blue` project, **When** a maintainer follows the documented playback steps, **Then** the investigation records whether the failure reproduces consistently and what the visible error signature is.
2. **Given** the reproduced failure, **When** the investigation summary is reviewed, **Then** it clearly states whether the problem appears during project loading, orchestra generation, engine compilation, score handoff, or playback start.

---

### User Story 2 - Isolate The Failing Generated State (Priority: P1)

As a maintainer, I need the failure traced from the generated output back to the responsible project data or transformation stage so the root cause can be addressed deliberately instead of by trial and error.

**Why this priority**: The visible error line may only be a symptom. The real value of this spec is narrowing the failure to one stage and one bounded cause.

**Independent Test**: Can be fully tested by producing an investigation report that identifies the specific generated statement or surrounding block involved in the failure and maps it to the relevant source data or compile stage.

**Acceptance Scenarios**:

1. **Given** a failing generated orchestra or handoff payload, **When** the investigation is complete, **Then** it identifies the offending statement, surrounding context, and the most likely source stage that produced it.
2. **Given** multiple plausible layers in the playback pipeline, **When** the evidence is reviewed, **Then** the report distinguishes which layers are confirmed healthy and which layer remains suspect.

---

### User Story 3 - Restore Successful Rendering For 01.blue (Priority: P2)

As the project lead, I need the failing `01.blue` project to render successfully again so the investigation ends in a verified fix rather than a diagnosis with no working outcome.

**Why this priority**: The investigation only pays off if it results in a restored rendering path or a clearly proven external blocker.

**Independent Test**: Can be fully tested by producing generated output for `01.blue` that passes the automated `csound -n` compile check and then succeeds through the normal `blue-electron` playback/render path.

**Acceptance Scenarios**:

1. **Given** the corrected rendering pipeline, **When** a maintainer renders `~/work/blue/demo2026/01.blue`, **Then** the project no longer fails with the orchestra compile error and proceeds through the expected rendering path.
2. **Given** the automated compile loop and the Java-generated `~/work/blue/demo2026/01.csd` reference, **When** the fix is validated, **Then** the generated output compiles under `csound -n` and any remaining reference differences relevant to the original failure are explicitly explained.

### Edge Cases

- What happens if the failure reproduces only during live playback but not in other compile or render paths?
- How should the investigation handle a case where the highlighted error line is syntactically valid in isolation but the true cause originates earlier in the generated orchestra?
- How should the output report a case where one malformed automation source causes many otherwise valid generated lines to fail together?
- What happens if the issue depends on stale build artifacts, environment setup, or transport-specific startup behavior rather than the project data alone?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The investigation output MUST document a reproducible workflow for triggering the `01.blue` playback failure from the current repository state.
- **FR-002**: The investigation output MUST capture the observable failure signature, including the relevant generated-output context and any engine or compile diagnostics that accompany it.
- **FR-003**: The investigation MUST identify where the failure occurs within the playback pipeline, including whether it arises during project loading, orchestra generation, engine compilation, score handoff, or playback start.
- **FR-004**: The investigation MUST trace the failing generated output back to the responsible source data, transformation stage, or runtime handoff when the available evidence permits that conclusion.
- **FR-005**: The investigation MUST distinguish clearly between confirmed findings, working hypotheses, and unresolved questions.
- **FR-006**: The investigation MUST determine whether the failure is specific to `01.blue` or indicates a broader class of project, automation, or orchestra-generation defects.
- **FR-007**: The feature MUST define and maintain a repeatable automated compile-evaluation workflow that runs the generated `01.blue` output through standalone `csound -n` checks.
- **FR-008**: The feature MUST restore successful rendering for `~/work/blue/demo2026/01.blue` through the current `blue-electron` playback path unless the investigation proves a blocker outside this repository's control.
- **FR-009**: The validation workflow MUST use the Java-generated `~/work/blue/demo2026/01.csd` as a reference artifact when comparing generated output around the failing region or confirming that the fix resolved the relevant mismatch.

### Key Entities *(include if feature involves data)*

- **Investigation Run**: A documented attempt to reproduce the failure, including the environment, playback steps, and observed outcome.
- **Failure Signature**: The user-visible and diagnostic evidence that identifies the failing condition, including message text and generated-output context.
- **Pipeline Stage**: One bounded phase in the path from project load to playback start where the failure may originate.
- **Suspect Source Element**: The project data, generated fragment, or handoff unit most strongly linked to the failure.
- **Diagnostic Recommendation**: The decision-ready summary of the root cause, the validated fix or blocker, and the final verification step.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A maintainer can follow the documented reproduction steps and determine within 5 minutes whether the `01.blue` playback failure is present.
- **SC-002**: The investigation narrows the failure to one confirmed pipeline stage, or to at most two explicitly justified remaining candidate stages.
- **SC-003**: The final report identifies either one confirmed root cause or no more than three evidence-backed hypotheses.
- **SC-004**: Another maintainer can rerun the automated `csound -n` evaluation loop for `01.blue` in under 1 minute without additional exploratory setup.
- **SC-005**: `~/work/blue/demo2026/01.blue` renders successfully from the current `blue-electron` playback path without the original orchestra compile failure.
- **SC-006**: Any remaining differences from the Java-generated `~/work/blue/demo2026/01.csd` that matter to the original failure are either resolved or explicitly documented.

## Assumptions

- The current high-priority symptom is triggered when attempting to play `~/work/blue/demo2026/01.blue` from the Electron app.
- The investigation is primarily a diagnosis feature; a production fix may follow as separate implementation work if needed.
- The Java-generated reference file `~/work/blue/demo2026/01.csd` is available and can be used as a comparison artifact during debugging and validation.
- The repository state and local project file available on 2026-04-17 are sufficient to reproduce the current failure.
- Existing playback, logging, and generated-output inspection paths can be used to gather evidence without first redesigning the engine bridge.