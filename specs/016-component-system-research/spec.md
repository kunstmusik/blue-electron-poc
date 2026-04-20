# Feature Specification: Component System Research

**Feature Branch**: `016-component-system-research`  
**Created**: 2026-04-20  
**Status**: Draft  
**Input**: User description: "Research Java blue component needs and evaluate Radix versus shadcn and native operating-system menus so future UI work can be planned coherently."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Inventory The UI Surface Area (Priority: P1)

As a maintainer, I need a reliable inventory of reusable user-interface surfaces in both the Java application and the current Electron port so future UI work is planned against the real product surface rather than ad hoc impressions.

**Why this priority**: Every later decision depends on knowing what kinds of surfaces actually exist, how often they recur, and where the current Electron port already diverges from the Java application.

**Independent Test**: Can be fully tested by reviewing the research package and confirming it accounts for all currently registered Java workbench windows and their current Electron counterparts or gaps.

**Acceptance Scenarios**:

1. **Given** the registered Java workbench windows and the current Electron panel registry, **When** the inventory is completed, **Then** every current window surface is cataloged with its current placement, role, and parity status.
2. **Given** recurring UI patterns such as menus, tool windows, dialogs, form panels, browser panels, and console-like surfaces, **When** the inventory is grouped, **Then** those surfaces are organized into reusable component-need categories rather than a flat list.

---

### User Story 2 - Compare Component Approach Families (Priority: P2)

As an implementer, I need a comparison of the main component-approach families available to the Electron port so I can choose the right tool for each surface without relitigating the same tradeoffs on every feature.

**Why this priority**: The project now has enough UI complexity that piecemeal widget choices will create inconsistency, duplicated styling work, and avoidable rewrites.

**Independent Test**: Can be fully tested by reading the comparison matrix and confirming it evaluates the identified surface categories against the candidate approach families and documents fit, risks, and boundaries.

**Acceptance Scenarios**:

1. **Given** the identified component-need categories, **When** the comparison is completed, **Then** each category includes a documented fit assessment for primitive renderer-owned components, styled wrapper components, native operating-system menus, and custom workbench-owned solutions where applicable.
2. **Given** the workbench’s Java-parity requirements, **When** the comparison is written, **Then** it explains which surfaces should remain custom or workbench-owned instead of being moved into a general-purpose component layer.

---

### User Story 3 - Recommend A Roadmap And Next Specs (Priority: P3)

As a planner, I need a concrete recommendation and a sequenced follow-on roadmap so future UI specs can move forward with bounded pilot slices instead of broad, ambiguous “UI cleanup” efforts.

**Why this priority**: Research only becomes useful when it produces a decision record and a next-step sequence that the team can execute incrementally.

**Independent Test**: Can be fully tested by reviewing the recommendation and confirming it names an immediate direction, deferred areas, and at least one bounded next spec that follows from the research.

**Acceptance Scenarios**:

1. **Given** the inventory and comparison outputs, **When** the recommendation is finalized, **Then** it names which approach family should be used for which surface categories and where mixed ownership is expected.
2. **Given** the remaining UI gaps, **When** the roadmap is written, **Then** it proposes bounded next specs with clear goals, dependencies, and suggested pilot surfaces.

### Edge Cases

- What happens when a Java surface has no current Electron counterpart but still needs to influence the component-system recommendation?
- How should the research treat surfaces that likely need a mixed strategy, such as workbench-owned chrome with reusable internal controls?
- How should the recommendation handle areas where native operating-system behavior conflicts with Java-parity styling or interaction expectations?
- How should the inventory represent one-off surfaces that should remain bespoke rather than driving a reusable component decision?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The research package MUST inventory the currently registered Java workbench windows and the corresponding Electron surfaces relevant to the port.
- **FR-001a**: The research package MUST include a dedicated inventory document that lists all currently registered Java components in scope and the required UI features they imply.
- **FR-002**: The inventory MUST group surfaces into reusable component-need categories instead of only listing windows one by one.
- **FR-003**: The research MUST describe the current parity status of each identified surface category, including where the Electron port already has a satisfactory solution and where it does not.
- **FR-004**: The research MUST compare the main component-approach families under consideration for the identified surface categories.
- **FR-005**: The comparison MUST explicitly identify which surfaces should remain workbench-owned or bespoke rather than being absorbed into a reusable component layer.
- **FR-006**: The research MUST produce a recommendation record that explains the preferred approach for each major surface category and the rationale behind that choice.
- **FR-007**: The research MUST propose a phased roadmap with bounded follow-on specs or implementation slices.
- **FR-008**: The research MUST document assumptions, dependencies, and open risks that could affect the recommended roadmap.

### Key Entities *(include if feature involves data)*

- **UI Surface**: A user-visible area such as a workbench window, menu, dialog, form panel, browser panel, or console surface that may need a reusable implementation strategy.
- **Component Need Category**: A grouping of related surfaces that share behavior, styling, interaction, or lifecycle requirements.
- **Approach Evaluation**: An assessment of how well a candidate component approach fits a given category, including benefits, risks, and ownership boundaries.
- **Roadmap Candidate**: A proposed next spec or bounded slice derived from the research findings.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The research inventory accounts for all currently registered Java workbench windows and all current Electron panel-registry entries in a traceable way.
- **SC-001a**: The dedicated Java inventory document lists every currently registered Java `TopComponent` in scope, maps each one to at least one required UI feature, and identifies any intentionally excluded non-registered surfaces.
- **SC-002**: Every identified component-need category has a documented comparison across the candidate approach families.
- **SC-003**: The recommendation record resolves the current menu/component-system ambiguity sufficiently that a reviewer can name the immediate next UI spec without additional exploratory discussion.
- **SC-004**: The roadmap identifies at least one immediate follow-on spec and at least one deferred follow-on area, each with a stated rationale and boundary.

## Assumptions

- The current Java application remains the primary parity reference for workbench surfaces and interaction expectations.
- The current Electron workbench implementation is stable enough to audit without reopening spec 015 immediately.
- This research slice produces documentation and recommendations only; it does not need to land new runtime UI behavior.
- A mixed strategy is acceptable if the research shows that different surface categories need different ownership models.
