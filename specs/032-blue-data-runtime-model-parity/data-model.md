# Data Model: Blue Data Runtime Model Parity for Instruments, BSB, Mixer, Automation, and Time

## Entity: BsbCompilationUnit

- **Purpose**: Generated text and parameter-substitution state for BlueSynthBuilder and related BSB output.
- **Fields**:
  - generated instrument text
  - generated global orchestra text
  - generated global score text
  - always-on text
  - ftable output
- **Validation**:
  - Value replacement and preset/default behavior match Java.

## Entity: RuntimeInstrumentVariant

- **Purpose**: One instrument model whose generation or preservation behavior must match Java compatibility expectations.
- **Examples**:
  - GenericInstrument
  - BlueSynthBuilder
  - JavaScriptInstrument
  - PythonInstrument
  - BlueX7
- **Validation**:
  - Compatible generation or preservation behavior is defined per variant.

## Entity: MixerGraph

- **Purpose**: Mixer channels, subchannels, sends, effects, master channel, dependencies, and extra render time.
- **Validation**:
  - XML and generated behavior match Java defaults and structure.
  - Dependency ordering is stable and Java-compatible.

## Entity: AutomationLineModel

- **Purpose**: Time-based parameter automation shared across parameters and line-oriented behaviors.
- **Fields**:
  - line segments or equivalent time-based modulation state
  - associated parameter metadata
- **Validation**:
  - Serialization and behavior match Java automation semantics.

## Entity: TimeContextState

- **Purpose**: Tempo-map, SMPTE, measure-meter, and project-property-linked time conversion state.
- **Validation**:
  - Defaults, sorting, reset behavior, and BBST conversions match Java.
