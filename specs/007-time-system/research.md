# Research: Blue Time System

**Date**: 2026-04-14
**Source**: Java `blue.time.*`, `SoundObjectUtilities.java`, `PolyObject.java`, `SoundLayer.java`, `ScoreUtilities.java`

## Root Cause of the Bug

Sound objects in `.blue` XML store start times as:
```xml
<startTime type='BEATS'>
  <csoundBeats>8.0</csoundBeats>
</startTime>
```

The TypeScript code does `data.getTextString('startTime')` which returns the **direct text** of the `<startTime>` element — but that element has no direct text, only a `<csoundBeats>` child. So it returns `''` → `parseFloat('')` → `NaN` → default of `0`.

The Java code uses `TimePosition.loadFromXML(startTimeElement)` which reads the `type` attribute and then extracts the value from the appropriate child element (`<csoundBeats>` for BEATS type).

## Decision 1: TimePosition/TimeDuration XML Loading

**What**: Implement `TimePosition.loadFromXML` and `TimeDuration.loadFromXML` to handle the nested `<csoundBeats>` child element format, with fallback to plain text for legacy files.

**Java reference** (`TimePosition.loadFromXML`):
```java
return switch (type) {
    case "BEATS", "CSOUND_BEATS", "BeatTime" -> {
        double csoundBeats = Double.parseDouble(element.getTextString("csoundBeats"));
        yield new BeatTime(csoundBeats);
    }
    // ... other types
};
```

**Alternatives**:
- Change `getTextString` to auto-descend into children — rejected because it changes serialization behavior globally
- Add a `getNestedTextString` helper — reasonable but the Java pattern of dedicated `loadFromXML` is cleaner

## Decision 2: SoundObjectUtilities Pattern

**What**: Replicate Java's `SoundObjectUtilities.initBasicFromXML` as a shared utility that all sound objects call during loading to handle startTime/subjectiveDuration.

**Java reference** (`SoundObjectUtilities.initBasicFromXML`):
```java
Element startTimeElement = data.getElement("startTime");
if (startTimeElement != null && startTimeElement.getAttributeValue("type") != null) {
    sObj.setStartTime(TimePosition.loadFromXML(startTimeElement));
} else if (data.getElement("startTimePosition") != null) {
    sObj.setStartTime(TimePosition.loadFromXML(data.getElement("startTimePosition")));
} else if (data.getElement("startTime") != null) {
    double startTime = Double.parseDouble(data.getTextString("startTime"));
    sObj.setStartTime(TimePosition.beats(startTime));
}
// Same pattern for subjectiveDuration
```

**Key insight**: Three formats to handle:
1. New format: `<startTime type='BEATS'><csoundBeats>N</csoundBeats></startTime>`
2. Legacy format: `<startTimePosition type='BEATS'><csoundBeats>N</csoundBeats></startTimePosition>`
3. Old format: `<startTime>N</startTime>` (plain double)

## Decision 3: PolyObject Note Time Offset

**What**: After merging notes from child sound layers, `PolyObject.generateForCSD` must call `setScoreStart(nl, this.getStartTime().toBeats(context))` to offset all notes by its own start time.

**Java reference** (`PolyObject.processNotes`):
```java
double startTime = getStartTime().toBeats(context);
ScoreUtilities.setScoreStart(nl, startTime);
```

Where `setScoreStart` is simply:
```java
public static void setScoreStart(NoteList notes, double start) {
    for (Note note : notes) {
        note.setStartTime(note.getStartTime() + start);
    }
}
```

## Decision 4: SoundLayer Relative Time Passing

**What**: `SoundLayer.generateForCSD` computes adjusted start/end times relative to each sound object before passing them to the sound object's `generateForCSD`.

**Java reference** (`SoundLayer.generateForCSD`):
```java
double sObjStart = sObj.getStartTime().toBeats(context);
double adjustedStart = startTime - sObjStart;
if (adjustedStart < 0.0f) adjustedStart = 0.0f;
notes.merge(sObj.generateForCSD(context, compileData, adjustedStart, adjustedEnd));
```

**Current TypeScript gap**: PolyObject directly iterates layers and sound objects without computing adjusted times or using SoundLayer as an intermediary.

## Current TypeScript State

| Component | Status | Gap |
|-----------|--------|-----|
| `TimePosition` | Stub — only `BEATS`, stores raw number | Needs `loadFromXML` with `<csoundBeats>` child parsing |
| `TimeDuration` | Does not exist as separate class | Needs full implementation mirroring TimePosition |
| `TimeContext` | Partial — has TempoMap loading | Needs MeterMap, sampleRate access |
| `TempoMap` | Single-tempo only | Needs multi-point `beatsToSeconds`/`secondsToBeats` |
| `MeterMap` | Does not exist | Needed for BBT/BBST/BBF time bases (can defer) |
| Sound object `loadFromXML` | Uses `getTextString('startTime')` | Must use `TimePosition.loadFromXML(data.getElement('startTime'))` |
| `PolyObject.generateForCSD` | Merges notes without offset | Must add `setScoreStart(nl, startTime)` |
| `SoundLayer.generateForCSD` | Does not exist | Must compute adjusted times per sound object |
