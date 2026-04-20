# Data Model: Component System Research

## Overview

This research slice models documentation artifacts rather than runtime product data. The goal is to make the inventory, comparison, and recommendation outputs explicit and reviewable.

## Entity: JavaUISurface

- **Purpose**: Represents one source-traceable UI surface from the Java application.
- **Fields**:
  - `surfaceId`: stable Java identifier such as a `TopComponent` preferred ID
  - `modulePath`: source module or file path
  - `surfaceType`: workbench window, menu, dialog, browser panel, console panel, toolbar, or other surface
  - `mode`: logical owner mode such as `editor`, `properties`, or `output` when applicable
  - `openAtStartup`: whether the surface is seeded by default
  - `notes`: relevant parity or ownership observations
- **Validation**:
  - every inventoried Java workbench window must have a stable `surfaceId`
  - every surface must map to at least one `surfaceType`

## Entity: ElectronUISurface

- **Purpose**: Represents one current UI surface in the Electron port.
- **Fields**:
  - `surfaceId`: stable identifier such as a panel ID or named UI surface
  - `sourcePath`: renderer file or directory
  - `surfaceType`: workbench window, menu, context menu, dialog, form panel, browser panel, console panel, toolbar, or other surface
  - `currentOwnership`: Dockview-owned, custom workbench-owned, renderer-owned reusable component, or native operating-system-owned
  - `parityStatus`: implemented, partial, missing, or intentionally divergent
  - `notes`: implementation or parity observations
- **Validation**:
  - every current panel-registry surface must appear at least once in this model

## Entity: ComponentNeedCategory

- **Purpose**: Groups related Java and Electron surfaces that share behavior or reusable implementation needs.
- **Fields**:
  - `categoryId`
  - `name`
  - `description`
  - `memberSurfaceIds`
  - `sharedNeeds`: behavior, styling, state, accessibility, or ownership needs shared by the category
  - `ownershipBoundary`: custom workbench, reusable renderer component, native system surface, or mixed
- **Validation**:
  - every category must include at least one member surface
  - every member surface must be traceable to either a `JavaUISurface` or an `ElectronUISurface`

## Entity: RequiredUIFeature

- **Purpose**: Represents one reusable UI capability implied by the Java component inventory.
- **Fields**:
  - `featureId`
  - `name`
  - `description`
  - `sourceSurfaceIds`
  - `candidateCategories`
  - `notes`
- **Validation**:
  - every Java component in the dedicated inventory document must map to at least one `RequiredUIFeature`
  - every required UI feature must trace back to at least one source surface

## Entity: ApproachOption

- **Purpose**: Represents one candidate implementation family under review.
- **Fields**:
  - `optionId`
  - `name`
  - `family`: primitive renderer-owned, styled wrapper, native system menu, or bespoke workbench ownership
  - `scopeNotes`
- **Validation**:
  - the research must include at least the currently discussed option families

## Entity: CategoryEvaluation

- **Purpose**: Records how one candidate approach fits one component-need category.
- **Fields**:
  - `categoryId`
  - `optionId`
  - `parityFit`
  - `stateIntegrationFit`
  - `themingFit`
  - `accessibilityFit`
  - `ownershipFit`
  - `maintenanceFit`
  - `overallRecommendation`: preferred, acceptable, mixed, or reject
  - `rationale`
  - `risks`
- **Validation**:
  - every component-need category must be evaluated against every approach option

## Entity: RecommendationRecord

- **Purpose**: Captures the final decision for the research slice.
- **Fields**:
  - `decisionId`
  - `categoryScope`: one category or a set of related categories
  - `recommendedOptionId`
  - `rationale`
  - `deferredAreas`
  - `nonGoals`
- **Validation**:
  - every major component-need category must have a recommendation outcome

## Entity: RoadmapCandidate

- **Purpose**: Represents a bounded next spec or follow-on implementation slice that falls out of the research.
- **Fields**:
  - `candidateId`
  - `title`
  - `goal`
  - `targetCategories`
  - `dependencyNotes`
  - `priority`
  - `boundedPilotSurface`
- **Validation**:
  - at least one immediate next candidate and one deferred candidate must be documented

## Relationships

- One `JavaUISurface` may map to zero or one current `ElectronUISurface` counterpart during the audit.
- One `JavaUISurface` may imply many `RequiredUIFeature` records.
- One `RequiredUIFeature` may inform one or many `ComponentNeedCategory` records.
- One `ComponentNeedCategory` groups many `JavaUISurface` and `ElectronUISurface` records.
- One `ApproachOption` participates in many `CategoryEvaluation` records.
- One `RecommendationRecord` draws on many `CategoryEvaluation` records.
- One `RoadmapCandidate` may target many `ComponentNeedCategory` records.
