# Data Model: Blue Data XML Preservation and Root Compatibility

## Entity: BlueDataRootDocument

- **Purpose**: Canonical root project document matching Java Blue root XML.
- **Fields**:
  - `arrangement`
  - `score`
  - `soundObjectLibrary`
  - `instrumentLibrary`
  - `projectProperties`
  - `mixer`
  - `opcodeList`
  - `pluginData`
  - `markersList`
  - `scratchPadData`
  - `midiInputProcessor`
  - `liveData`
- **Validation**:
  - Root sections that appear in input XML must not disappear on save.
  - Missing mixer input must normalize to Java-compatible disabled state.

## Entity: PreservationSection

- **Purpose**: Root-level XML section that may be fully modeled or preserved losslessly until later runtime parity exists.
- **Examples**:
  - plugin data
  - scratch pad data
  - markers list
  - MIDI input processor
- **Validation**:
  - Unknown or deferred fields are retained through round-trip save.

## Entity: ProjectPropertiesEnvelope

- **Purpose**: Canonical project property state after Java-compatible defaulting and legacy migration.
- **Fields**:
  - `sampleRate`
  - `ksmps`
  - `zeroDbFS`
  - `diskKsmps`
  - `diskZeroDbFS`
  - normalized advanced command-line settings
  - media-copy preference
- **Validation**:
  - Defaults match Java.
  - Legacy aliases normalize into one canonical saved form.

## Entity: RootCopyInvariant

- **Purpose**: Testable expectation that `deepCopy()` preserves compatibility-relevant root sections.
- **Validation**:
  - Mutating the copy does not mutate the source.
  - The copy contains the same root sections and normalized defaults as the source.
