# Data Model: UI Window System Research

## Overview

This feature produces a decision package, not runtime code. The entities below define the shape of that decision package so the next session can keep the research artifacts consistent.

## Entity: WorkspaceArea

- **Purpose**: Represents one durable region of the Blue workbench, usually derived from a NetBeans mode or an intentionally merged replacement area.
- **Fields**:
  - `id`: stable identifier such as `editor`, `properties`, `output`
  - `sourceModeName`: original NetBeans mode name when applicable
  - `role`: what kinds of panels live here
  - `startupBehavior`: open-at-startup, optional, hidden-by-default
  - `orderingHints`: default placement or position hints
  - `representativeWindows`: list of concrete Blue panels associated with the area
  - `requiredForPrototype`: boolean
  - `notes`: migration constraints or compromises
- **Validation**:
  - Must map to at least one concrete Java Blue TopComponent
  - Must declare whether it is prototype-critical

## Entity: WindowSystemCapability

- **Purpose**: Describes a user-visible or programmatic behavior the new workbench may need to support.
- **Fields**:
  - `id`: stable capability identifier
  - `category`: layout, docking, persistence, activation, extensibility, etc.
  - `description`: concise behavior statement
  - `evidenceSources`: file paths or notes proving the capability matters
  - `requiredLevel`: mandatory, preferred, deferrable
  - `prototypeCritical`: boolean
  - `notes`: nuance about acceptable compromises
- **Validation**:
  - Every mandatory capability must have at least one evidence source
  - The required level must be explicitly assigned

## Entity: CandidateFramework

- **Purpose**: Represents one evaluated docking/workbench option.
- **Fields**:
  - `name`: framework or approach name
  - `family`: React docking library, general workbench, custom shell, etc.
  - `reactFriendly`: yes/no/partial
  - `electronFit`: summary of desktop-app suitability
  - `layoutModel`: high-level docking/layout approach
  - `persistenceStory`: how layouts are saved/restored
  - `extensibilityStory`: how Blue panels/tools would be hosted
  - `maintenanceState`: current-maintenance summary from verified sources
  - `licenseSummary`: license fit notes
  - `notes`: any special constraints
- **Validation**:
  - Must include evidence-backed maintenance and licensing notes
  - Must be evaluated against the shared criteria set

## Entity: EvaluationCriterion

- **Purpose**: Defines a repeatable scoring axis for candidate comparison.
- **Fields**:
  - `id`: stable criterion identifier
  - `label`: human-readable name
  - `category`: capability parity, operational risk, integration fit, etc.
  - `weight`: optional importance level
  - `scoringRule`: support / partial / custom / unsupported, or equivalent rubric
  - `notes`: explanation of what counts as success
- **Validation**:
  - Must be reusable across all candidates
  - Must map back to one or more `WindowSystemCapability` entries

## Entity: CapabilityAssessment

- **Purpose**: Joins a `CandidateFramework` to a `WindowSystemCapability`.
- **Fields**:
  - `candidateId`
  - `capabilityId`
  - `supportLevel`: direct, partial, custom-work-required, unsupported
  - `evidence`: citation or summary from current candidate research
  - `risk`: low, medium, high
  - `notes`: candidate-specific caveats
- **Validation**:
  - Every candidate must have an assessment row for every mandatory capability
  - Every non-direct support level must include a rationale

## Entity: RecommendationPackage

- **Purpose**: Final decision-ready summary for the project lead.
- **Fields**:
  - `preferredCandidate`
  - `fallbackCandidate`
  - `rejectedCandidates`
  - `acceptedGaps`
  - `prototypeScope`
  - `prototypeQuestions`
  - `decisionRationale`
  - `followUpTasks`
- **Validation**:
  - Must name exactly one preferred direction
  - Must include at least one fallback
  - Must include a bounded prototype scope

## Relationships

- `WorkspaceArea` informs which `WindowSystemCapability` items are mandatory.
- `EvaluationCriterion` is derived from one or more `WindowSystemCapability` items.
- `CandidateFramework` is scored through many `CapabilityAssessment` rows.
- `RecommendationPackage` summarizes the completed `CapabilityAssessment` matrix and the selected prototype scope.
