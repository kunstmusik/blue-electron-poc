import { describe, it, expect } from 'vitest';
import { AudioClip } from '../../src/score/audio/audio-clip';
import { AudioLayer } from '../../src/score/audio/audio-layer';
import { AudioLayerGroup } from '../../src/score/audio/audio-layer-group';
import { AudioLayerGroupProvider } from '../../src/score/audio/audio-layer-group-provider';
import { FadeType, fadeTypeFromString, fadeTypeToCsound } from '../../src/score/audio/fade-type';
import { PLAYBACK_INSTRUMENT_ORC } from '../../src/score/audio/playback-instrument-orc';
import { BLUE_FADE_UDO } from '../../src/score/audio/blue-fade-udo';
import { TimePosition } from '../../src/time/time-position';
import { TimeDuration } from '../../src/time/time-duration';
import { TimeContext } from '../../src/time/time-context';
import { CompileData } from '../../src/compile-data';
import { Element } from '../../src/serialization/xml-reader';

describe('FadeType', () => {
  it('maps all fade types to Csound numbers', () => {
    expect(fadeTypeToCsound(FadeType.LINEAR)).toBe(0);
    expect(fadeTypeToCsound(FadeType.CONSTANT_POWER)).toBe(1);
    expect(fadeTypeToCsound(FadeType.SYMMETRIC)).toBe(2);
    expect(fadeTypeToCsound(FadeType.FAST)).toBe(3);
    expect(fadeTypeToCsound(FadeType.SLOW)).toBe(4);
  });

  it('parses fade type from string', () => {
    expect(fadeTypeFromString('Linear')).toBe(FadeType.LINEAR);
    expect(fadeTypeFromString('Constant Power')).toBe(FadeType.CONSTANT_POWER);
    expect(fadeTypeFromString('Symmetric')).toBe(FadeType.SYMMETRIC);
    expect(fadeTypeFromString('Fast')).toBe(FadeType.FAST);
    expect(fadeTypeFromString('Slow')).toBe(FadeType.SLOW);
    expect(fadeTypeFromString('Unknown')).toBeUndefined();
  });
});

describe('AudioClip', () => {
  it('creates with defaults', () => {
    const clip = new AudioClip();
    expect(clip.getName()).toBe('');
    expect(clip.getAudioFile()).toBe('');
    expect(clip.isLooping()).toBe(true);
    expect(clip.getFadeIn()).toBe(0);
    expect(clip.getFadeInType()).toBe(FadeType.LINEAR);
    expect(clip.getFadeOut()).toBe(0);
    expect(clip.getFadeOutType()).toBe(FadeType.LINEAR);
  });

  it('sets and gets all properties', () => {
    const clip = new AudioClip();
    clip.setName('My Clip');
    clip.setAudioFile('/path/to/audio.wav');
    clip.setNumChannels(2);
    clip.setAudioDuration(5.5);
    clip.setFileStartTime(1.0);
    clip.setStartTime(TimePosition.beats(4));
    clip.setSubjectiveDuration(TimeDuration.beats(5.5));
    clip.setFadeIn(0.5);
    clip.setFadeInType(FadeType.CONSTANT_POWER);
    clip.setFadeOut(1.0);
    clip.setFadeOutType(FadeType.SYMMETRIC);
    clip.setLooping(null, false);
    clip.setBackgroundColor(0xff6666);

    expect(clip.getName()).toBe('My Clip');
    expect(clip.getAudioFile()).toBe('/path/to/audio.wav');
    expect(clip.getNumChannels()).toBe(2);
    expect(clip.getAudioDuration()).toBe(5.5);
    expect(clip.getFileStartTime()).toBe(1.0);
    expect(clip.getFadeIn()).toBe(0.5);
    expect(clip.getFadeInType()).toBe(FadeType.CONSTANT_POWER);
    expect(clip.getFadeOut()).toBe(1.0);
    expect(clip.getFadeOutType()).toBe(FadeType.SYMMETRIC);
    expect(clip.isLooping()).toBe(false);
    expect(clip.getBackgroundColor()).toBe(0xff6666);
  });

  it('round-trips through XML', () => {
    const clip = new AudioClip();
    clip.setName('Test Clip');
    clip.setAudioFile('/path/to/file.wav');
    clip.setNumChannels(2);
    clip.setAudioDuration(10.0);
    clip.setFileStartTime(2.0);
    clip.setStartTime(TimePosition.beats(0));
    clip.setSubjectiveDuration(TimeDuration.seconds(10));
    clip.setFadeIn(0.5);
    clip.setFadeInType(FadeType.SLOW);
    clip.setFadeOut(1.5);
    clip.setFadeOutType(FadeType.FAST);
    clip.setLooping(null, true);
    clip.setBackgroundColor(0x404040);

    const xml = clip.saveAsXML();
    const reloaded = AudioClip.loadFromXML(xml);

    expect(reloaded.getName()).toBe('Test Clip');
    expect(reloaded.getAudioFile()).toBe('/path/to/file.wav');
    expect(reloaded.getNumChannels()).toBe(2);
    expect(reloaded.getAudioDuration()).toBe(10.0);
    expect(reloaded.getFileStartTime()).toBe(2.0);
    expect(reloaded.getFadeIn()).toBe(0.5);
    expect(reloaded.getFadeInType()).toBe(FadeType.SLOW);
    expect(reloaded.getFadeOut()).toBe(1.5);
    expect(reloaded.getFadeOutType()).toBe(FadeType.FAST);
    expect(reloaded.isLooping()).toBe(true);
    expect(reloaded.getBackgroundColor()).toBe(0x404040);
  });

  it('copies from another clip', () => {
    const src = new AudioClip();
    src.setName('Source');
    src.setAudioFile('/src.wav');
    src.setFadeInType(FadeType.SYMMETRIC);

    const copy = AudioClip.copyFrom(src);
    expect(copy.getName()).toBe('Source');
    expect(copy.getAudioFile()).toBe('/src.wav');
    expect(copy.getFadeInType()).toBe(FadeType.SYMMETRIC);
  });
});

describe('AudioLayer', () => {
  it('creates and adds clips', () => {
    const layer = new AudioLayer();
    layer.setName('Audio Layer 1');

    const clip1 = new AudioClip();
    clip1.setName('Clip 1');
    clip1.setAudioFile('/clip1.wav');
    clip1.setAudioDuration(4);
    clip1.setSubjectiveDuration(TimeDuration.beats(4));

    layer.push(clip1);
    expect(layer.length).toBe(1);
    expect(layer.getName()).toBe('Audio Layer 1');
  });

  it('round-trips through XML', () => {
    const layer = new AudioLayer();
    layer.setName('Test Layer');
    layer.setMuted(true);
    layer.setSolo(false);
    layer.setHeightIndex(2);

    const clip = new AudioClip();
    clip.setName('Test Clip');
    clip.setAudioFile('/test.wav');
    clip.setAudioDuration(5);
    clip.setStartTime(TimePosition.beats(0));
    clip.setSubjectiveDuration(TimeDuration.beats(5));
    layer.push(clip);

    const xml = layer.saveAsXML();
    const reloaded = AudioLayer.loadFromXML(xml);

    expect(reloaded.getName()).toBe('Test Layer');
    expect(reloaded.isMuted()).toBe(true);
    expect(reloaded.isSolo()).toBe(false);
    expect(reloaded.getHeightIndex()).toBe(2);
    expect(reloaded.length).toBe(1);
    expect(reloaded[0].getName()).toBe('Test Clip');
    expect(reloaded[0].getAudioFile()).toBe('/test.wav');
  });

  it('generates CSD notes for clips in render window', () => {
    const layer = new AudioLayer();
    layer.setName('Test');

    const clip = new AudioClip();
    clip.setAudioFile('/audio/test.wav');
    clip.setAudioDuration(4);
    clip.setStartTime(TimePosition.beats(0));
    clip.setSubjectiveDuration(TimeDuration.beats(4));
    clip.setFileStartTime(0);
    clip.setFadeIn(0.5);
    clip.setFadeInType(FadeType.LINEAR);
    clip.setFadeOut(0.5);
    clip.setFadeOutType(FadeType.LINEAR);
    clip.setLooping(null, true);
    layer.push(clip);

    const context = new TimeContext();
    const compileData = new CompileData();
    const notes = layer.generateForCSD(context, compileData, 0, -1);

    expect(notes.length).toBe(1);
    const note = notes[0];
    expect(note.getPField(4)).toBe('"/audio/test.wav"');
    expect(note.getPField(8)).toBe('0'); // fade-in type: linear = 0
    expect(note.getPField(12)).toBe('1'); // looping = true
  });
});

describe('AudioLayerGroup', () => {
  it('creates and adds layers', () => {
    const group = new AudioLayerGroup();
    group.setName('Audio Layers');

    const layer = group.newLayerAt(0);
    layer.setName('Layer 1');

    expect(group.length).toBe(1);
    expect(group.getName()).toBe('Audio Layers');
  });

  it('round-trips through XML', () => {
    const group = new AudioLayerGroup();
    group.setName('Test Group');
    group.setDefaultHeightIndex(3);

    const layer = group.newLayerAt(0);
    layer.setName('Layer A');
    layer.setHeightIndex(1);

    const clip = new AudioClip();
    clip.setName('Clip A');
    clip.setAudioFile('/clip.wav');
    clip.setAudioDuration(3);
    clip.setSubjectiveDuration(TimeDuration.beats(3));
    layer.push(clip);

    const xml = group.saveAsXML();
    const reloaded = AudioLayerGroup.loadFromXML(xml);

    expect(reloaded.getName()).toBe('Test Group');
    expect(reloaded.getDefaultHeightIndex()).toBe(3);
    expect(reloaded.length).toBe(1);
    expect(reloaded[0].getName()).toBe('Layer A');
    expect(reloaded[0].length).toBe(1);
    expect(reloaded[0][0].getName()).toBe('Clip A');
  });

  it('generates CSD from all non-muted layers', () => {
    const group = new AudioLayerGroup();

    const layer1 = group.newLayerAt(0);
    const clip1 = new AudioClip();
    clip1.setAudioFile('/a.wav');
    clip1.setAudioDuration(2);
    clip1.setSubjectiveDuration(TimeDuration.beats(2));
    layer1.push(clip1);

    const layer2 = group.newLayerAt(1);
    layer2.setMuted(true);
    const clip2 = new AudioClip();
    clip2.setAudioFile('/b.wav');
    clip2.setAudioDuration(2);
    clip2.setSubjectiveDuration(TimeDuration.beats(2));
    layer2.push(clip2);

    const context = new TimeContext();
    const compileData = new CompileData();
    const notes = group.generateForCSD(context, compileData, 0, -1, false);

    // Only layer1 (non-muted) should contribute
    expect(notes.length).toBe(1);
  });
});

describe('AudioLayerGroupProvider', () => {
  it('creates a default layer group', () => {
    const provider = new AudioLayerGroupProvider();
    expect(provider.getLayerGroupName()).toBe('Audio');

    const group = provider.createLayerGroup();
    expect(group).toBeInstanceOf(AudioLayerGroup);
    expect(group.length).toBe(1); // newLayerAt(0) called in createLayerGroup
  });

  it('loads from matching XML', () => {
    const provider = new AudioLayerGroupProvider();
    const xml = new Element('audioLayerGroup');
    xml.setAttribute('name', 'Test');
    xml.addElement('audioLayers');

    const result = provider.loadFromXML(xml, new Map());
    expect(result).toBeInstanceOf(AudioLayerGroup);
    expect(result!.getName()).toBe('Test');
  });

  it('returns null for non-matching XML', () => {
    const provider = new AudioLayerGroupProvider();
    const xml = new Element('polyObject');
    const result = provider.loadFromXML(xml, new Map());
    expect(result).toBeNull();
  });
});

describe('Csound templates', () => {
  it('PLAYBACK_INSTRUMENT_ORC contains placeholders', () => {
    expect(PLAYBACK_INSTRUMENT_ORC).toContain('diskin2');
    expect(PLAYBACK_INSTRUMENT_ORC).toContain('Saudio_file = p4');
    expect(PLAYBACK_INSTRUMENT_ORC).toContain('{0}');
    expect(PLAYBACK_INSTRUMENT_ORC).toContain('{1}');
    expect(PLAYBACK_INSTRUMENT_ORC).toContain('blue_fade');
  });

  it('BLUE_FADE_UDO contains fade types', () => {
    expect(BLUE_FADE_UDO).toContain('opcode blue_fade');
    expect(BLUE_FADE_UDO).toContain('ifadeInType');
    expect(BLUE_FADE_UDO).toContain('ifadeOutType');
    expect(BLUE_FADE_UDO).toContain('reverse_curve');
    expect(BLUE_FADE_UDO).toContain('calc_cubic_coefficients');
  });
});

describe('Audio clip CSD note generation', () => {
  it('produces correct p-fields for diskin2 playback', () => {
    const clip = new AudioClip();
    clip.setAudioFile('/path/to/file.wav');
    clip.setStartTime(TimePosition.beats(0));
    clip.setSubjectiveDuration(TimeDuration.beats(4));
    clip.setFileStartTime(1.5);
    clip.setAudioDuration(10);
    clip.setFadeIn(0.5);
    clip.setFadeInType(FadeType.CONSTANT_POWER);
    clip.setFadeOut(1.0);
    clip.setFadeOutType(FadeType.SLOW);
    clip.setLooping(null, false);

    const layer = new AudioLayer();
    layer.push(clip);

    const context = new TimeContext();
    const compileData = new CompileData();
    const notes = layer.generateForCSD(context, compileData, 0, -1);

    expect(notes.length).toBe(1);
    const note = notes[0];
    expect(note.getStartTime()).toBe(0);
    expect(note.getSubjectiveDuration()).toBe(4);
    expect(note.getPField(4)).toBe('"/path/to/file.wav"');
    expect(note.getPField(5)).toBe('1.5');
    expect(note.getPField(7)).toBe('4');
    expect(note.getPField(8)).toBe('1'); // CONSTANT_POWER = 1
    expect(note.getPField(9)).toBe('0.5');
    expect(note.getPField(10)).toBe('4'); // SLOW = 4
    expect(note.getPField(11)).toBe('1'); // fadeOut
    expect(note.getPField(12)).toBe('0'); // looping = false
  });

  it('skips clips outside render window', () => {
    const layer = new AudioLayer();

    const clip1 = new AudioClip();
    clip1.setAudioFile('/a.wav');
    clip1.setAudioDuration(2);
    clip1.setStartTime(TimePosition.beats(10));
    clip1.setSubjectiveDuration(TimeDuration.beats(2));
    layer.push(clip1);

    const clip2 = new AudioClip();
    clip2.setAudioFile('/b.wav');
    clip2.setAudioDuration(2);
    clip2.setStartTime(TimePosition.beats(1));
    clip2.setSubjectiveDuration(TimeDuration.beats(2));
    layer.push(clip2);

    const context = new TimeContext();
    const compileData = new CompileData();
    // Only render beats 0-5
    const notes = layer.generateForCSD(context, compileData, 0, 5);

    // clip1 at beat 10 is outside window, clip2 at beat 1 is inside
    expect(notes.length).toBe(1);
  });
});
