# Data Model: Blue Data Note Parsing and Note Processor Parity

## Entity: ParsedNoteEvent

- **Purpose**: One score note parsed with Java-compatible timing, pfields, and duration semantics.
- **Fields**:
  - pfields
  - subjective duration
  - objective duration
  - end time
- **Validation**:
  - Carry and shorthand semantics match Java.
  - Objective duration behavior matches Java when ties or time behaviors affect note end time.

## Entity: NoteProcessorDescriptor

- **Purpose**: One serialized note processor definition.
- **Fields**:
  - Java-compatible type name
  - processor parameters
  - preserved unsupported payload where needed
- **Validation**:
  - Load accepts Java full class names.
  - Save emits Java-compatible XML identity and fields.

## Entity: NoteProcessorChain

- **Purpose**: Ordered list of processors applied to note events.
- **Validation**:
  - Processor ordering matches Java.
  - Error behavior matches Java for invalid configuration.

## Entity: NamedNoteProcessorChainMap

- **Purpose**: Root-level mapping of reusable named chains.
- **Fields**:
  - chain name
  - processor chain
- **Validation**:
  - Names and chain contents survive load/save/copy round-trips.
