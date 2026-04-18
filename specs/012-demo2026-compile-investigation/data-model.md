# Data Model: Demo2026 Compile Investigation

## Overview

This feature produces an investigation package, not a user-facing product feature. The entities below define the shape of the evidence and diagnosis so future debugging work stays consistent.

## Entity: InvestigationRun

- **Purpose**: Represents one reproducible attempt to trigger the `01.blue` failure.
- **Fields**:
  - `blueFilePath`: absolute path to the project under test
  - `branchName`: feature branch used for the run
  - `referenceCsdPath`: absolute path to the Java-generated reference CSD used for comparison
  - `buildState`: whether runtime packages were freshly rebuilt, reused, or unknown
  - `playbackEntryPoint`: where playback was initiated from
  - `timestamp`: when the run occurred
  - `outcome`: reproduced, not reproduced, or inconclusive
  - `notes`: freeform context about environment or deviations
- **Validation**:
  - Must identify the exact project under test
  - Must record the reference CSD when reference comparison is part of the run
  - Must record whether runtime artifacts were freshly rebuilt

## Entity: FailureSignature

- **Purpose**: Captures the visible and diagnostic evidence associated with one failing run.
- **Fields**:
  - `pipelineStage`: stage where failure was observed
  - `userVisibleMessage`: playback error seen by the app or maintainer
  - `engineResponse`: compile or runtime failure returned by the engine client
  - `stderrExcerpt`: relevant engine stderr text if present
  - `loggedContext`: generated output lines surrounding the suspected failure location
  - `reproducibility`: always, intermittent, or unknown
  - `referenceComparison`: summary of whether the failing region matches, diverges from, or is not yet compared against the Java reference CSD
- **Validation**:
  - Must include at least one concrete diagnostic artifact
  - Must distinguish between app-side logging and engine-side response

## Entity: PipelineStage

- **Purpose**: Defines one bounded phase in the path from project load to playback.
- **Fields**:
  - `id`: stable identifier such as `csd-generation`, `csd-parse`, `orc-compile`, `score-read`, `engine-start`
  - `description`: what happens in this stage
  - `inputArtifacts`: data passed into the stage
  - `outputArtifacts`: data emitted from the stage
  - `status`: confirmed-healthy, suspect, failed, or not-yet-checked
- **Validation**:
  - Stages must be ordered in playback sequence
  - A failed stage must identify the artifact that demonstrated failure

## Entity: SuspectArtifact

- **Purpose**: Represents the concrete source fragment, generated block, or runtime condition most strongly linked to the failure.
- **Fields**:
  - `artifactType`: project data, generated orchestra block, extracted orchestra, engine response, build artifact, environment state
  - `location`: file path, line range, or runtime checkpoint
  - `evidence`: why this artifact is suspect
  - `sourceStage`: which pipeline stage produced it
  - `confidence`: low, medium, or high
  - `nextCheck`: smallest follow-up validation step
- **Validation**:
  - Every suspect artifact must cite evidence
  - High-confidence artifacts must have more than one supporting signal or one decisive signal

## Entity: DiagnosticRecommendation

- **Purpose**: Final investigation outcome used to drive the next engineering step.
- **Fields**:
  - `diagnosisType`: confirmed-root-cause, bounded-hypothesis-set, or environment-blocker
  - `primaryFinding`: most important conclusion
  - `healthyStages`: stages ruled out by evidence
  - `suspectStages`: stages still under consideration
  - `recommendedNextAction`: direct fix, added instrumentation, reduced reproduction, or follow-up spec
  - `verificationWorkflow`: exact steps for confirming the recommendation
- **Validation**:
  - Must name exactly one next action
  - Must make clear whether the root cause is confirmed or still partially open

## Relationships

- `InvestigationRun` produces a `FailureSignature` when reproduction succeeds.
- `FailureSignature` is attached to one `PipelineStage` where failure is observed.
- `SuspectArtifact` is derived from a `PipelineStage` and supports a `DiagnosticRecommendation`.
- `DiagnosticRecommendation` summarizes the strongest findings across one or more `InvestigationRun` records.