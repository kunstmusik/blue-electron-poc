# Feature Specification: Csound Editor Tooling

**Feature Branch**: `018-csound-editor-tooling`  
**Created**: 2026-04-20  
**Status**: Complete
**Input**: User description: "Create the next spec around a richer Global Orchestra code editor, compare Monaco and CodeMirror, evaluate dynamic completion support, consider the user-supplied CodeMirror Csound plugin, and keep tree-sitter-csound as a possible grammar/language-tooling research input."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Evaluate Csound Editor Candidates (Priority: P1)

As an implementer, I need a grounded comparison of CodeMirror and Monaco for the Global Orchestra editor so the project chooses the editor surface that best supports Csound language features and dynamic completions.

**Why this priority**: The editor choice is now open. Monaco is no longer assumed to be mandatory, and the user has provided a purpose-built CodeMirror Csound language package that may lower implementation risk.

**Independent Test**: Can be fully tested by reviewing the research output and confirming it compares CodeMirror and Monaco on dynamic completions, Csound syntax support, packaging/build risk, theming, testing, and future editor reuse.

**Acceptance Scenarios**:

1. **Given** CodeMirror and Monaco are both candidate editor surfaces, **When** evaluation is completed, **Then** the research package records a side-by-side capability matrix and recommends one preferred 018 implementation path.
2. **Given** dynamic completions are a user concern, **When** evaluation is completed, **Then** the research package explains how each candidate can accept dynamically supplied completion data.
3. **Given** `@kunstmusik/codemirror-lang-csound` is a new candidate input, **When** evaluation is completed, **Then** the research package records its apparent package surface, Csound features, and integration risks.

---

### User Story 2 - Implement Selected Global Orchestra Editor (Priority: P1)

As a composer, I need the Global Orchestra panel to use the selected richer code editor so project-level orchestra editing moves beyond a plain textarea while preserving current load and save behavior.

**Why this priority**: The slice still needs to improve the actual Global Orchestra editing surface. Evaluation alone is not enough unless a selected editor lands in the app.

**Independent Test**: Can be fully tested by opening a project with global orchestra content, editing that content in the selected editor-backed Global Orchestra panel, saving the project, and reopening it to confirm behavior remains correct.

**Acceptance Scenarios**:

1. **Given** a project with existing global orchestra text, **When** the user opens `GlobalOrchestraTopComponent`, **Then** the panel uses the selected rich editor instead of the current plain textarea surface.
2. **Given** the selected editor-backed Global Orchestra panel, **When** the user edits and saves the project, **Then** the existing save and reopen flow preserves the edited orchestra text.
3. **Given** dynamic completions are not fully implemented in this slice, **When** implementation is completed, **Then** the selected editor exposes a documented extension point for supplying project/runtime completion data later.

---

### User Story 3 - Bound The Follow-On Editor Tooling Roadmap (Priority: P2)

As a planner, I need a bounded recommendation for what comes after the selected Global Orchestra editor slice so the project can extend editor tooling without reopening the same editor-selection and language-tooling questions.

**Why this priority**: Whether CodeMirror or Monaco wins, the project still needs a clear statement of what language tooling remains and how the same editor stack could extend to Global Score or other code-oriented panels.

**Independent Test**: Can be fully tested by reviewing the recommendation and confirming it names the post-018 follow-on work for language tooling and reuse beyond Global Orchestra.

**Acceptance Scenarios**:

1. **Given** a selected editor is incorporated into Global Orchestra, **When** the recommendation is finalized, **Then** it names the preferred next implementation path for language tooling follow-on work.
2. **Given** unresolved grammar, completion, or integration risk, **When** the recommendation is finalized, **Then** it states what can proceed anyway and what must remain deferred.
3. **Given** the editor-tooling work is expected to expand later, **When** the roadmap is written, **Then** it identifies how the result could extend to Global Score and other future code-oriented surfaces without requiring the current slice to solve them all now.

**Close-Out Note**: The follow-on roadmap is now specifically scoped toward Java Blue editor parity: context-menu insertions, Cut/Copy/Paste behavior, Java Blue completion and hint parity, and reusable CodeMirror support for other Csound text surfaces.

### Edge Cases

- What happens if CodeMirror has the stronger Csound package but Monaco has a feature that is important for future editor reuse?
- What happens if CodeMirror and Monaco both support dynamic completions but one requires significantly more adapter code to supply project/runtime completion data?
- What happens if `@kunstmusik/codemirror-lang-csound` builds in isolation but introduces app packaging, dependency, or styling issues in Electron?
- What happens if Monaco is viable as an editor shell but lacks a Csound language package comparable to the CodeMirror plugin?
- How should the recommendation handle the possibility that tree-sitter-csound remains useful later even if CodeMirror is selected now?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The slice MUST evaluate both CodeMirror and Monaco as candidate rich editor surfaces for `GlobalOrchestraTopComponent`.
- **FR-002**: The evaluation MUST compare dynamic completion support, syntax highlighting, folding, indentation, hover/help capability, theming, accessibility, packaging/build risk, testability, bundle/runtime complexity, and future reuse.
- **FR-003**: The evaluation MUST inspect the user-supplied `@kunstmusik/codemirror-lang-csound` package as the CodeMirror Csound language candidate.
- **FR-004**: The evaluation MUST keep `tree-sitter-csound` as a possible grammar/language-tooling input, especially if Monaco is selected or if CodeMirror language support is not sufficient.
- **FR-005**: The slice MUST select one preferred editor path for the 018 implementation and record the rationale and fallback.
- **FR-006**: The system MUST replace the current plain-text Global Orchestra editing surface with the selected rich editor while preserving the current project load, update, and save behavior.
- **FR-007**: The slice MUST remain bounded to `GlobalOrchestraTopComponent` as the first rich-editor surface.
- **FR-008**: The selected editor implementation MUST expose a documented extension point for dynamic completions, even if project/runtime completions are implemented in a later slice.
- **FR-009**: The slice MUST produce a bounded recommendation for what language-tooling or editor reuse work should follow after the selected editor lands in Global Orchestra.
- **FR-010**: The recommendation MUST describe how the chosen direction could extend later to other code-oriented editor surfaces without requiring the current slice to implement them.

### Key Entities *(include if feature involves data)*

- **Editor Capability Baseline**: The current functional and usability state of the Global Orchestra editing surface in the Electron port.
- **Editor Candidate Evaluation**: A comparison of CodeMirror and Monaco against the editor features needed for Csound editing.
- **Language Package Evaluation**: An assessment of `@kunstmusik/codemirror-lang-csound`, `tree-sitter-csound`, and any selected fallback language-support path.
- **Dynamic Completion Strategy**: The documented approach for supplying static, document-local, project-driven, or runtime-driven completions to the selected editor.
- **Implementation Recommendation**: The bounded decision record that names the preferred path, fallback path, and next execution slice.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A reviewer can inspect the research output and see a side-by-side CodeMirror vs Monaco decision matrix.
- **SC-002**: A reviewer can identify how dynamic completions would be supplied for both candidates and why the selected editor is preferred.
- **SC-003**: A reviewer can open `GlobalOrchestraTopComponent` and observe the selected rich editor instead of the plain textarea surface.
- **SC-004**: A reviewer can edit Global Orchestra content in the selected editor-backed surface, save the project, reopen it, and observe that the edited content is preserved.
- **SC-005**: The recommendation names one bounded follow-on slice for language tooling or editor reuse and explicitly states what remains deferred for later editor surfaces such as Global Score.

## Assumptions

- The current Global Orchestra panel added in spec 017 is the baseline surface to be replaced in this slice.
- The next slice should stay bounded to one primary editor surface even if the resulting tooling could later be reused elsewhere.
- The user-supplied `@kunstmusik/codemirror-lang-csound` package is the starting CodeMirror Csound language candidate.
- The user-supplied `tree-sitter-csound` repository remains a candidate grammar input, but it is no longer the only language-support path to evaluate.
- Monaco adoption is no longer assumed mandatory; the editor choice must be justified by the candidate evaluation before implementation proceeds.

## Close-Out

- CodeMirror was selected for the 018 implementation because `@kunstmusik/codemirror-lang-csound` provides the strongest Csound-specific baseline with lower Electron/Vite integration risk than Monaco.
- `GlobalOrchestraTopComponent` now uses the selected CodeMirror-backed editor while keeping the existing project load/edit/save path.
- Monaco and `tree-sitter-csound` remain documented fallback/follow-on options rather than current implementation dependencies.
- Java Blue editor parity is intentionally deferred to the next spec. That next slice should cover context-menu insertions such as Blue Variables, Opcodes, Blue Opcodes, Custom, Add to Code Repository, Cut/Copy/Paste integration, and deeper completion/hint behavior.
