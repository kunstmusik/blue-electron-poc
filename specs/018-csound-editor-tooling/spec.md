# Feature Specification: Csound Editor Tooling

**Feature Branch**: `018-csound-editor-tooling`  
**Created**: 2026-04-20  
**Status**: Draft  
**Input**: User description: "Create the next spec around Monaco for the Global Orchestra editor and research the viability of using the user-supplied tree-sitter-csound grammar as the candidate Csound language source."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Define The Global Orchestra Editor Target (Priority: P1)

As a maintainer, I need a clear target for the next-generation Global Orchestra editing surface so the port can move beyond a plain textarea without guessing which editor behaviors matter first.

**Why this priority**: The current Global Orchestra panel is now functional, so the next decision point is not whether it exists but what a richer editor must actually deliver without regressing the current save and load behavior.

**Independent Test**: Can be fully tested by reviewing the research output and confirming it names the current Global Orchestra editing baseline, the desired follow-on capabilities, and the explicit scope boundary for the first editor-tooling slice.

**Acceptance Scenarios**:

1. **Given** the current Electron Global Orchestra panel and the Java reference surfaces, **When** the target-state analysis is completed, **Then** the research package defines which editor capabilities are required immediately and which are deferred.
2. **Given** multiple Csound-oriented editing surfaces exist in the product, **When** the scope is bounded, **Then** the research package identifies Global Orchestra as the first target and states how later surfaces relate to that first slice.

---

### User Story 2 - Evaluate Candidate Editor And Grammar Approaches (Priority: P2)

As an implementer, I need a grounded evaluation of the candidate editor and language-tooling approaches so the next implementation slice can choose a viable stack instead of committing to one prematurely.

**Why this priority**: Adopting a rich editor affects bundle size, Electron integration, keyboard behavior, syntax support, and long-term maintenance, so the tool choice needs to be justified before implementation work starts.

**Independent Test**: Can be fully tested by reviewing the comparison output and confirming it evaluates Monaco for the Global Orchestra surface and evaluates the user-supplied `tree-sitter-csound` grammar as a candidate language source, including risks and fallbacks.

**Acceptance Scenarios**:

1. **Given** Monaco is the candidate rich-editor surface, **When** the evaluation is completed, **Then** the research package records its fit, integration risks, and known tradeoffs for the Global Orchestra editor.
2. **Given** the user-supplied `tree-sitter-csound` repository is the candidate grammar source, **When** the evaluation is completed, **Then** the research package records whether it appears viable, conditionally viable, or not viable for the next slice and explains why.
3. **Given** the grammar candidate may not be sufficient, **When** the comparison is written, **Then** the research package names at least one fallback path that still allows Monaco-based editor progress.

---

### User Story 3 - Produce A Bounded Implementation Recommendation (Priority: P3)

As a planner, I need a bounded recommendation for the next editor-tooling implementation slice so the project can move from research into execution without reopening the same viability questions.

**Why this priority**: Research only becomes useful when it produces a decision, a bounded pilot surface, and a clear fallback strategy for unresolved language-tooling risks.

**Independent Test**: Can be fully tested by reviewing the recommendation and confirming it names a preferred direction, a fallback, and a bounded next implementation slice focused on the Global Orchestra editor.

**Acceptance Scenarios**:

1. **Given** the target-state analysis and tooling evaluation, **When** the recommendation is finalized, **Then** it names the preferred next implementation path for Global Orchestra.
2. **Given** unresolved grammar or integration risk, **When** the recommendation is finalized, **Then** it states what can proceed anyway and what must remain deferred.
3. **Given** the editor-tooling work is expected to expand later, **When** the roadmap is written, **Then** it identifies how the result could extend to Global Score and other future code-oriented surfaces without requiring the current slice to solve them all now.

### Edge Cases

- What happens if Monaco is viable as an editor shell but the grammar candidate is not viable for the first implementation slice?
- How should the research treat language features that are useful but not required for the first Global Orchestra upgrade, such as richer diagnostics or structural navigation?
- What happens if the grammar candidate appears viable in principle but introduces maintenance or packaging costs that are too high for the next bounded slice?
- How should the recommendation handle the possibility that Global Orchestra and Global Score ultimately share the same editor stack but cannot both fit into the next implementation slice?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The research package MUST describe the current Global Orchestra editing baseline in the Electron port and the immediate user-facing editor capabilities needed beyond that baseline.
- **FR-002**: The research package MUST define the scope boundary for the first rich-editor tooling slice and identify Global Orchestra as the first target surface.
- **FR-003**: The research package MUST evaluate Monaco as the candidate rich-editor surface for the first Global Orchestra tooling slice.
- **FR-004**: The research package MUST evaluate the user-supplied `tree-sitter-csound` repository as the candidate Csound grammar source for that slice.
- **FR-005**: The evaluation MUST record viability, integration risk, maintenance risk, and scope impact for both the editor candidate and the grammar candidate.
- **FR-006**: The research package MUST identify fallback options that preserve forward progress if the grammar candidate is not viable for the first implementation slice.
- **FR-007**: The research package MUST recommend a bounded next implementation slice with a clear preferred direction and a clearly stated fallback.
- **FR-008**: The research package MUST describe how the chosen direction could extend later to other code-oriented editor surfaces without requiring the current slice to implement them.

### Key Entities *(include if feature involves data)*

- **Editor Capability Baseline**: The current functional and usability state of the Global Orchestra editing surface in the Electron port.
- **Editor Candidate Evaluation**: An assessment of whether the candidate rich-editor surface fits the bounded Global Orchestra upgrade.
- **Grammar Candidate Evaluation**: An assessment of whether the candidate Csound grammar source can support the next slice at acceptable risk.
- **Implementation Recommendation**: The bounded decision record that names the preferred path, fallback path, and next execution slice.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A reviewer can read the research package and understand the exact Global Orchestra editor baseline, the desired next-step capabilities, and the first-slice boundary without additional exploratory discussion.
- **SC-002**: A reviewer can determine from the research package whether Monaco is the preferred editor candidate for the next slice and why.
- **SC-003**: A reviewer can determine from the research package whether the `tree-sitter-csound` candidate is viable, conditionally viable, or not viable for the next slice and what fallback applies.
- **SC-004**: The recommendation names one bounded implementation follow-on slice for Global Orchestra and explicitly states what remains deferred for later editor surfaces such as Global Score.

## Assumptions

- The current Global Orchestra panel added in spec 017 is the baseline surface for this research slice.
- The next slice should stay bounded to one primary editor surface even if the resulting tooling could later be reused elsewhere.
- The user-supplied `tree-sitter-csound` repository is the starting grammar candidate to evaluate, but the research outcome does not assume it will be adopted.
- This slice produces research and a decision record only; it does not require Monaco or grammar tooling to land in the runtime yet.
