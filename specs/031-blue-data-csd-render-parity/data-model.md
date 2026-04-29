# Data Model: Blue Data CSD Render Pipeline Parity

## Entity: CsdRenderRequest

- **Purpose**: One render invocation using canonical project state and render settings.
- **Fields**:
  - project copy
  - render start
  - render end
  - render mode
- **Validation**:
  - Render operates on copied state rather than mutating the live project.

## Entity: CompileDataContext

- **Purpose**: Java-compatible compile-time bookkeeping used during CSD generation.
- **Fields**:
  - instrument source ids
  - open ftable numbers
  - string channels
  - original parameters
  - generated automation state
- **Validation**:
  - Source ids and table numbering are stable and Java-compatible.

## Entity: UdoMergeResult

- **Purpose**: Combined and collision-safe project UDO set for render generation.
- **Fields**:
  - merged UDO text
  - renamed references
- **Validation**:
  - Name collisions are resolved compatibly with Java.

## Entity: RenderBoundaryState

- **Purpose**: Total-duration and render-window values used to finalize score output.
- **Fields**:
  - render start
  - render end
  - total duration
  - end-instrument requirement
- **Validation**:
  - Macro substitution and end handling match Java.
