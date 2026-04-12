# @blue/data — Quick Start Guide

## Installation

```bash
pnpm install @blue/data
```

Or from the monorepo root:

```bash
pnpm install
pnpm build
```

## Basic Usage

### Loading a .blue File

```typescript
import { BlueData } from '@blue/data';
import { readFileSync } from 'fs';

// Read XML from file (in Node.js; browser uses fetch/FileReader)
const xml = readFileSync('project.blue', 'utf-8');
const data = BlueData.loadFromString(xml);

console.log('Project:', data.getProjectProperties().title);
console.log('Version:', data.getVersion());
```

### Saving a .blue File

```typescript
const xml = data.saveToString();
writeFileSync('project.blue', xml);
```

### Inspecting the Score

```typescript
const score = data.getScore();

// Check layer groups
for (const lg of score) {
  console.log('Layer group:', lg.getName());
}

// Access audio layers
import { AudioLayerGroup } from '@blue/data';
const audioGroup = score[0] as AudioLayerGroup;
for (const layer of audioGroup) {
  console.log('  Layer:', layer.getName());
  for (const clip of layer) {
    console.log('    Clip:', clip.getName(), clip.getAudioFile());
  }
}

// Access pattern layers
import { PatternsLayerGroup } from '@blue/data';
const patternGroup = score[1] as PatternsLayerGroup;
console.log('Pattern beats:', patternGroup.getPatternBeatsLength());
for (const layer of patternGroup) {
  const pd = layer.getPatternData();
  console.log('  Pattern max:', pd.getMaxSelected());
}
```

### Generating a CSD

```typescript
const csd = data.toCSD();
console.log(csd);
// Outputs:
// <CsoundSynthesizer>
// <CsOptions>
// -r 44100
// -k 64
// ...
// </CsOptions>
// <CsInstruments>
// ... orchestra code ...
// </CsInstruments>
// <CsScore>
// i1 0 2
// ...
// </CsScore>
// </CsoundSynthesizer>
```

### Creating a Project Programmatically

```typescript
import {
  BlueData,
  ProjectProperties,
  AudioLayerGroup,
  AudioLayer,
  AudioClip,
  FadeType,
  TimePosition,
  TimeDuration,
  Score,
  GlobalOrcSco,
  Tables,
} from '@blue/data';

const data = new BlueData();

// Set project properties
data.getProjectProperties().sampleRate = '44100';
data.getProjectProperties().ksmps = '64';
data.getProjectProperties().nchnls = '2';

// Global orchestra
data.getGlobalOrcSco().setGlobalOrc('sr = 44100\nkr = 4410\nnchnls = 2\n0dbfs = 1\n');

// F-tables
data.getTableSet().addTable('f1', 'f 1 0 1024 10 1');

// Score with audio layer
const score = new Score();
const audioGroup = new AudioLayerGroup();
const layer = audioGroup.newLayerAt(0);
layer.setName('Audio Track 1');

const clip = new AudioClip();
clip.setName('Kick Drum');
clip.setAudioFile('/samples/kick.wav');
clip.setAudioDuration(0.5);
clip.setStartTime(TimePosition.beats(0));
clip.setSubjectiveDuration(TimeDuration.beats(0.5));
clip.setFadeIn(0.01);
clip.setFadeOut(0.01);
layer.push(clip);

score.push(audioGroup);
data.setScore(score);

// Save
const xml = data.saveToString();
```

## API Reference

### Core

| Class | Description |
|-------|-------------|
| `BlueData` | Root project class. `loadFromString()`, `saveToString()`, `toCSD()` |
| `ProjectProperties` | Sample rate, ksmps, nchnls, 0dbfs, Csound options |
| `CompileData` | CSD compilation accumulator |

### Score Layers

| Type | Description |
|------|-------------|
| `AudioClip` | File-based audio clip with timing and fades |
| `AudioLayer` | Layer of AudioClip objects |
| `AudioLayerGroup` | Group of AudioLayers |
| `PatternData` | Boolean array pattern |
| `PatternLayer` | Layer with SoundObject + pattern grid |
| `PatternsLayerGroup` | Group of PatternLayers |
| `PolyObject` | Nested layer group (legacy score type) |

### Sound Objects

| Type | Description |
|------|-------------|
| `GenericScore` | Raw Csound score text |
| `JavaScriptObject` | JS code → score (runs in both Node and browser) |
| `PythonObject` | Python code → score (data only, JVM needed for generation) |
| `CSDSoundObject` | Embedded CSD |
| `Comment` | Score annotation |

### Supporting Types

| Category | Types |
|----------|-------|
| Mixer | `Mixer`, `Channel`, `Effect`, `EffectsChain`, `Send` |
| Automation | `Parameter`, `ParameterList`, `ParameterTimeManager` |
| Note Processors | `AddProcessor`, `MultiplyProcessor`, `Code` |
| Live | `LiveObject`, `LiveObjectSet`, `LiveObjectSetList` |
| MIDI | `MidiKeyMapping`, `MidiVelocityMapping` |
| Opcodes | `OpcodeDefinition`, `OpcodeList` |

### Utilities

| Function | Description |
|----------|-------------|
| `setScoreStart(notes, offset)` | Shift all notes by offset |
| `getNotes(scoreText)` | Parse Csound score text into NoteList |
| `applyNoteProcessorChain(notes, chain)` | Apply processor chain |

## Environment Compatibility

`@blue/data` works in **both Node.js and browsers**:

- ✅ No `require()` calls
- ✅ No `import()` calls
- ✅ No Node.js built-in imports (`fs`, `path`, `crypto`, etc.)
- ✅ Pure ES modules with static imports only

### What works everywhere

- Loading/saving `.blue` XML files
- All data class manipulation
- `JavaScriptObject` score generation (uses `new Function()`)
- CSD generation

### What requires Node.js (or a Java subprocess)

- `PythonObject` score generation — returns empty notes in browser
- `Mixer` CSD variable generation — needs channel routing info

## Browser Usage

```html
<script type="module">
  import { BlueData } from '/path/to/@blue/data/dist/index.js';

  const xml = '<blueData version="2.9.1"><projectProperties><title>Test</title></projectProperties></blueData>';
  const data = BlueData.loadFromString(xml);
  console.log(data.getProjectProperties().title); // "Test"
</script>
```
