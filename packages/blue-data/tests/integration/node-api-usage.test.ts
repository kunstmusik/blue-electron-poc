/**
 * Node.js API usage test — verifies @blue/data works as a standalone library.
 *
 * This simulates what a user would do in a Node.js script:
 * 1. Import the library
 * 2. Create data objects
 * 3. Load from XML string
 * 4. Save to XML string
 * 5. Inspect data programmatically
 */
import { describe, it, expect } from 'vitest';
import { BlueData } from '../../src/blue-data';
import { ProjectProperties } from '../../src/project-properties';
import { GenericScore } from '../../src/sound-objects/generic-score';
import { AudioClip } from '../../src/score/audio/audio-clip';
import { AudioLayer } from '../../src/score/audio/audio-layer';
import { AudioLayerGroup } from '../../src/score/audio/audio-layer-group';
import { PatternData } from '../../src/score/patterns/pattern-data';
import { PatternLayer } from '../../src/score/patterns/pattern-layer';
import { PatternsLayerGroup } from '../../src/score/patterns/patterns-layer-group';
import { PolyObject } from '../../src/sound-objects/poly-object';
import { SoundLayer } from '../../src/sound-objects/sound-layer';
import { FadeType } from '../../src/score/audio/fade-type';
import { TimePosition } from '../../src/time/time-position';
import { TimeDuration } from '../../src/time/time-duration';
import { Score } from '../../src/score/score';
import { Tables } from '../../src/tables';
import { GlobalOrcSco } from '../../src/global-orc-sco';
import { MarkersList } from '../../src/markers-list';
import { MidiInputProcessor } from '../../src/midi/midi-input-processor';
import { ScratchPadData } from '../../src/scratch-pad-data';
import { LiveData } from '../../src/live-data';
import { NoteProcessorChainMap } from '../../src/note-processors/note-processor-chain-map';
import { NoteProcessorChain } from '../../src/note-processors/note-processor-chain';
import { BLUE_VERSION } from '../../src/blue-constants';
import { UpgradeManager } from '../../src/migration/upgrade-manager';
import { ProjectVersion } from '../../src/migration/project-version';
import { PLAYBACK_INSTRUMENT_ORC } from '../../src/score/audio/playback-instrument-orc';
import { BLUE_FADE_UDO } from '../../src/score/audio/blue-fade-udo';

describe('Node.js library API', () => {
  it('imports all public exports without errors', () => {
    // If we got here, all imports resolved successfully
    expect(typeof BlueData).toBe('function');
    expect(typeof ProjectProperties).toBe('function');
    expect(typeof GenericScore).toBe('function');
    expect(typeof AudioClip).toBe('function');
    expect(typeof AudioLayer).toBe('function');
    expect(typeof AudioLayerGroup).toBe('function');
    expect(typeof PatternData).toBe('function');
    expect(typeof PatternLayer).toBe('function');
    expect(typeof PatternsLayerGroup).toBe('function');
    expect(typeof PolyObject).toBe('function');
    expect(typeof SoundLayer).toBe('function');
    expect(typeof FadeType).toBe('object');
    expect(typeof TimePosition).toBe('function');
    expect(typeof TimeDuration).toBe('function');
    expect(typeof Score).toBe('function');
    expect(typeof Tables).toBe('function');
    expect(typeof GlobalOrcSco).toBe('function');
    expect(typeof MarkersList).toBe('function');
    expect(typeof MidiInputProcessor).toBe('function');
    expect(typeof ScratchPadData).toBe('function');
    expect(typeof LiveData).toBe('function');
    expect(typeof NoteProcessorChainMap).toBe('function');
    expect(typeof NoteProcessorChain).toBe('function');
    expect(typeof UpgradeManager).toBe('function');
    expect(typeof ProjectVersion).toBe('function');
    expect(typeof PLAYBACK_INSTRUMENT_ORC).toBe('string');
    expect(typeof BLUE_FADE_UDO).toBe('string');
  });

  it('creates and inspects a project programmatically', () => {
    const data = new BlueData();

    // Set project properties
    const props = data.getProjectProperties();
    props.title = 'API Test Project';
    props.author = 'API User';
    props.sampleRate = '44100';

    // Create audio layer group with clips
    const audioGroup = new AudioLayerGroup();
    const layer = audioGroup.newLayerAt(0);
    layer.setName('Audio Track');

    const clip = new AudioClip();
    clip.setName('Kick');
    clip.setAudioFile('/samples/kick.wav');
    clip.setAudioDuration(0.5);
    clip.setStartTime(TimePosition.beats(0));
    clip.setSubjectiveDuration(TimeDuration.beats(0.5));
    clip.setFadeIn(0.01);
    clip.setFadeOut(0.01);
    layer.push(clip);

    // Create pattern layer group
    const patternGroup = new PatternsLayerGroup();
    patternGroup.setPatternBeatsLength(1);

    const patLayer = patternGroup.newLayerAt(0);
    patLayer.setName('Bass Pattern');
    const bassScore = new GenericScore();
    bassScore.setScoreText('i1 0 1\n');
    bassScore.setStartTime(TimePosition.beats(0));
    bassScore.setSubjectiveDuration(TimeDuration.beats(1));
    patLayer.setSoundObject(bassScore);
    patLayer.getPatternData().setPattern(0, true);
    patLayer.getPatternData().setPattern(2, true);
    patLayer.getPatternData().setPattern(4, true);
    patLayer.getPatternData().setPattern(6, true);

    // Add layer groups to score
    const score = new Score();
    score.push(audioGroup);
    score.push(patternGroup);
    data.setScore(score);

    // Inspect data programmatically
    expect(data.getProjectProperties().title).toBe('API Test Project');
    expect(data.getProjectProperties().author).toBe('API User');

    // Audio clips
    expect(data.getScore()[0]).toBeInstanceOf(AudioLayerGroup);
    const ag = data.getScore()[0] as AudioLayerGroup;
    expect(ag.length).toBe(1);
    expect(ag[0].getName()).toBe('Audio Track');
    expect(ag[0].length).toBe(1);
    expect(ag[0][0].getAudioFile()).toBe('/samples/kick.wav');

    // Pattern layers
    expect(data.getScore()[1]).toBeInstanceOf(PatternsLayerGroup);
    const pg = data.getScore()[1] as PatternsLayerGroup;
    expect(pg.length).toBe(1);
    expect(pg[0].getPatternData().isPatternSet(0)).toBe(true);
    expect(pg[0].getPatternData().isPatternSet(1)).toBe(false);
    expect(pg[0].getPatternData().isPatternSet(2)).toBe(true);
  });

  it('loads from XML string and inspects data', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<blueData version="2.9.1">
  <projectProperties>
    <title>Loaded Project</title>
    <author>Test User</author>
    <sampleRate>48000</sampleRate>
    <ksmps>32</ksmps>
    <nchnls>2</nchnls>
    <useZeroDbFS>true</useZeroDbFS>
    <zeroDbFS>32768</zeroDbFS>
  </projectProperties>
  <globalOrcSco>
    <globalOrc>sr = 48000</globalOrc>
  </globalOrcSco>
  <tables>
    <fTable name="f1">f 1 0 1024 10 1</fTable>
  </tables>
  <score>
    <timeContext>
      <tempo>120</tempo>
    </timeContext>
  </score>
</blueData>`;

    const data = BlueData.loadFromString(xml);

    expect(data.getVersion()).toBe('2.9.1');
    expect(data.getProjectProperties().title).toBe('Loaded Project');
    expect(data.getProjectProperties().author).toBe('Test User');
    expect(data.getProjectProperties().sampleRate).toBe('48000');
    expect(data.getProjectProperties().ksmps).toBe('32');
    expect(data.getProjectProperties().useZeroDbFS).toBe(true);
    expect(data.getGlobalOrcSco().getGlobalOrc()).toBe('sr = 48000');
    expect(data.getTableSet().getTable('f1')).toBe('f 1 0 1024 10 1');
  });

  it('saves to XML string and round-trips', async () => {
    const data = new BlueData();
    data.setVersion('2.9.1');

    const props = data.getProjectProperties();
    props.title = 'Round Trip';
    props.sampleRate = '44100';
    props.ksmps = '64';
    props.nchnls = '2';
    props.useZeroDbFS = true;
    props.zeroDbFS = '32768';

    // Audio layer
    const score = new Score();
    const audioGroup = new AudioLayerGroup();
    const layer = audioGroup.newLayerAt(0);
    layer.setName('Layer 1');

    const clip = new AudioClip();
    clip.setAudioFile('/audio/test.wav');
    clip.setAudioDuration(2.0);
    clip.setStartTime(TimePosition.beats(0));
    clip.setSubjectiveDuration(TimeDuration.beats(2.0));
    clip.setFadeIn(0.1);
    clip.setFadeInType(FadeType.CONSTANT_POWER);
    clip.setFadeOut(0.2);
    clip.setFadeOutType(FadeType.LINEAR);
    layer.push(clip);

    score.push(audioGroup);
    data.setScore(score);

    // Save and reload
    const xml1 = data.saveToString();
    const reloadedData = BlueData.loadFromString(xml1);

    // Verify the saved XML contains expected content
    expect(xml1).toContain('<audioLayerGroup');
    expect(xml1).toContain('audioFile');
    expect(xml1).toContain('/audio/test.wav');
    expect(xml1).toContain('<fadeIn>0.1</fadeIn>');
    expect(xml1).toContain('<fadeOut>0.2</fadeOut>');

    // Verify we can reload from saved XML
    expect(reloadedData.getProjectProperties().title).toBe('Round Trip');
    expect(reloadedData.getProjectProperties().useZeroDbFS).toBe(true);
  });

  it('generates CSD output', () => {
    const data = new BlueData();

    const props = data.getProjectProperties();
    props.sampleRate = '44100';
    props.ksmps = '64';
    props.nchnls = '2';

    const globalOrcSco = new GlobalOrcSco();
    globalOrcSco.setGlobalOrc('; Global ORC\nsr = 44100\n');
    globalOrcSco.setGlobalSco('; Global SCO\ne\n');
    data.setGlobalOrcSco(globalOrcSco);

    const tables = new Tables();
    tables.addTable('f1', 'f 1 0 1024 10 1');
    data.setTableSet(tables);

    // Pattern layer with score
    const score = new Score();
    const patternGroup = new PatternsLayerGroup();
    patternGroup.setPatternBeatsLength(4);

    const patLayer = patternGroup.newLayerAt(0);
    const gs = new GenericScore();
    gs.setScoreText('i1 0 2\n');
    gs.setStartTime(TimePosition.beats(0));
    gs.setSubjectiveDuration(TimeDuration.beats(1));
    patLayer.setSoundObject(gs);
    patLayer.getPatternData().setPattern(0, true);
    patLayer.getPatternData().setPattern(2, true);

    score.push(patternGroup);
    data.setScore(score);

    const csd = data.toCSD();

    expect(csd).toContain('<CsoundSynthesizer>');
    expect(csd).toContain('<CsOptions>');
    expect(csd).toContain('-r 44100');
    expect(csd).toContain('<CsInstruments>');
    expect(csd).toContain('<CsScore>');
    expect(csd).toContain('i1 0 2');
    expect(csd).toContain('</CsoundSynthesizer>');
  });

  it('provides migration system access', () => {
    const um = UpgradeManager.getInstance();
    expect(um).toBeInstanceOf(UpgradeManager);

    const version = ProjectVersion.parse('2.1.10');
    const other = ProjectVersion.parse('2.3.0');
    expect(version.lessThan(other)).toBe(true);
    expect(other.lessThan(version)).toBe(false);
  });

  it('provides Csound template strings', () => {
    expect(PLAYBACK_INSTRUMENT_ORC).toContain('diskin2');
    expect(BLUE_FADE_UDO).toContain('blue_fade');
  });

  it('creates and inspects a PolyObject score', () => {
    const data = new BlueData();
    data.getProjectProperties().title = 'PolyObject Test';

    const score = new Score();
    const pObj = new PolyObject(false);
    pObj.setName('Main Score');

    const layer = new SoundLayer();
    layer.setName('Instruments');

    const gs = new GenericScore();
    gs.setName('Score Part');
    gs.setScoreText('i1 0 4\ni2 5 2\n');
    gs.setStartTime(TimePosition.beats(0));
    gs.setSubjectiveDuration(TimeDuration.beats(7));
    layer.push(gs);

    pObj.push(layer);
    score.push(pObj);
    data.setScore(score);

    // Inspect
    const reloadedScore = data.getScore();
    expect(reloadedScore.length).toBe(1);
    expect(reloadedScore[0]).toBeInstanceOf(PolyObject);
  });
});
