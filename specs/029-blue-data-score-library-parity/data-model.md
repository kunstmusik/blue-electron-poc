# Data Model: Blue Data Score, Library, and Sound Object Model Parity

## Entity: SoundObjectLibrary

- **Purpose**: Java-compatible library of reusable sound objects stored at the root project level.
- **Fields**:
  - ordered library sound objects
  - stable `objRefId` for each stored entry
- **Validation**:
  - Library object ids remain stable across save/reopen.
  - Corrupt library entries are handled consistently with Java compatibility expectations.

## Entity: LibraryReferenceBinding

- **Purpose**: Relationship between an `Instance` sound object and the library sound object it references.
- **Fields**:
  - referenced `objRefId`
  - resolved library sound object
- **Validation**:
  - Resolved references survive deep copy and resave.
  - Unresolved references fail safely without silently rebinding to the wrong object.

## Entity: InstrumentLibraryTree

- **Purpose**: Java-compatible instrument-category hierarchy used for legacy arrangement resolution.
- **Fields**:
  - root category
  - child categories
  - instruments with stable ids
- **Validation**:
  - Legacy arrangement references can resolve through the tree the same way Java does.

## Entity: ScoreGraph

- **Purpose**: Canonical score structure containing root layer groups, layers, and nested sound objects.
- **Fields**:
  - root layer groups
  - time context and score-level state
  - nested `PolyObject`, `SoundLayer`, audio, and pattern structures
- **Validation**:
  - Default score normalization matches Java.
  - Deep copy preserves child structure and compatibility-relevant fields.

## Entity: SoundObjectEnvelope

- **Purpose**: Shared Java-compatible XML contract for concrete sound object types.
- **Fields**:
  - Java full class-name type
  - start time
  - subjective duration
  - time behavior
  - repeat point
  - note processor chain
- **Validation**:
  - Common fields are emitted in Java-compatible form for all in-scope sound objects.
