import { describe, it, expect } from 'vitest';
import { PatternData } from '../../src/score/patterns/pattern-data';
import { PatternLayer } from '../../src/score/patterns/pattern-layer';
import { PatternsLayerGroup } from '../../src/score/patterns/patterns-layer-group';
import { PatternsLayerGroupProvider } from '../../src/score/patterns/patterns-layer-group-provider';
import { GenericScore } from '../../src/sound-objects/generic-score';
import { TimePosition } from '../../src/time/time-position';
import { TimeDuration } from '../../src/time/time-duration';
import { TimeContext } from '../../src/time/time-context';
import { CompileData } from '../../src/compile-data';
import { Element } from '../../src/serialization/xml-reader';

describe('PatternData', () => {
  it('creates with default size', () => {
    const pd = new PatternData();
    expect(pd.getSize()).toBe(16);
    expect(pd.getMaxSelected()).toBe(-1);
    expect(pd.isPatternSet(0)).toBe(false);
  });

  it('sets and gets pattern steps', () => {
    const pd = new PatternData();
    pd.setPattern(0, true);
    pd.setPattern(2, true);
    pd.setPattern(5, true);

    expect(pd.isPatternSet(0)).toBe(true);
    expect(pd.isPatternSet(1)).toBe(false);
    expect(pd.isPatternSet(2)).toBe(true);
    expect(pd.isPatternSet(5)).toBe(true);
    expect(pd.getMaxSelected()).toBe(5);
  });

  it('auto-resizes when needed', () => {
    const pd = new PatternData();
    pd.setPattern(20, true); // Beyond initial 16

    expect(pd.getSize()).toBe(32); // Resized to next block
    expect(pd.isPatternSet(20)).toBe(true);
    expect(pd.getMaxSelected()).toBe(20);
  });

  it('recalculates maxSelected when clearing', () => {
    const pd = new PatternData();
    pd.setPattern(0, true);
    pd.setPattern(5, true);
    pd.setPattern(10, true);
    expect(pd.getMaxSelected()).toBe(10);

    pd.setPattern(10, false);
    expect(pd.getMaxSelected()).toBe(5);

    pd.setPattern(5, false);
    expect(pd.getMaxSelected()).toBe(0);

    pd.setPattern(0, false);
    expect(pd.getMaxSelected()).toBe(-1);
  });

  it('round-trips through XML', () => {
    const pd = new PatternData();
    pd.setPattern(0, true);
    pd.setPattern(1, false);
    pd.setPattern(2, true);
    pd.setPattern(3, true);

    const xml = pd.saveAsXML();
    const text = xml.getTextString();
    expect(text).toMatch(/^[01]+$/);

    const reloaded = PatternData.loadFromXML(xml);
    expect(reloaded.isPatternSet(0)).toBe(true);
    expect(reloaded.isPatternSet(1)).toBe(false);
    expect(reloaded.isPatternSet(2)).toBe(true);
    expect(reloaded.isPatternSet(3)).toBe(true);
    expect(reloaded.getMaxSelected()).toBe(3);
  });

  it('copies from another PatternData', () => {
    const src = new PatternData();
    src.setPattern(3, true);
    src.setPattern(7, true);

    const copy = new PatternData(src);
    expect(copy.isPatternSet(3)).toBe(true);
    expect(copy.isPatternSet(7)).toBe(true);
    expect(copy.getSize()).toBe(src.getSize());
  });
});

describe('PatternLayer', () => {
  it('creates with default GenericScore', () => {
    const layer = new PatternLayer();
    expect(layer.getName()).toBe('');
    expect(layer.isMuted()).toBe(false);
    expect(layer.isSolo()).toBe(false);
    expect(layer.getPatternData().getSize()).toBe(16);
    expect(layer.getSoundObject()).toBeInstanceOf(GenericScore);
  });

  it('sets and gets properties', () => {
    const layer = new PatternLayer();
    layer.setName('My Pattern');
    layer.setMuted(true);
    layer.setSolo(true);

    expect(layer.getName()).toBe('My Pattern');
    expect(layer.isMuted()).toBe(true);
    expect(layer.isSolo()).toBe(true);
  });

  it('generates notes at active pattern positions', () => {
    const layer = new PatternLayer();

    const gs = new GenericScore();
    gs.setName('Pattern Score');
    gs.setScoreText('i1 0 2\n');
    gs.setStartTime(TimePosition.beats(0));
    gs.setSubjectiveDuration(TimeDuration.beats(1));
    layer.setSoundObject(gs);

    // Activate patterns 0, 2, 4
    layer.getPatternData().setPattern(0, true);
    layer.getPatternData().setPattern(2, true);
    layer.getPatternData().setPattern(4, true);

    const context = new TimeContext();
    const compileData = new CompileData();
    const patternBeatsLength = 4; // Each step = 4 beats
    const notes = layer.generateForCSD(context, compileData, 0, -1, patternBeatsLength);

    // 3 active patterns * 1 note each = 3 notes
    expect(notes.length).toBe(3);

    // Notes should be at times 0, 8, 16 (pattern index * 4 beats)
    const times = notes.map((n) => n.getStartTime()).sort((a, b) => a - b);
    expect(times[0]).toBe(0);
    expect(times[1]).toBe(8);
    expect(times[2]).toBe(16);
  });

  it('round-trips through XML', () => {
    const layer = new PatternLayer();
    layer.setName('Test Pattern');
    layer.setMuted(false);
    layer.setSolo(true);

    const gs = new GenericScore();
    gs.setName('Inner Score');
    gs.setScoreText('i1 0 2\ni1 3 1\n');
    layer.setSoundObject(gs);

    layer.getPatternData().setPattern(0, true);
    layer.getPatternData().setPattern(1, true);
    layer.getPatternData().setPattern(3, false);
    layer.getPatternData().setPattern(5, true);

    const xml = layer.saveAsXML();
    const reloaded = PatternLayer.loadFromXML(xml);

    expect(reloaded.getName()).toBe('Test Pattern');
    expect(reloaded.isMuted()).toBe(false);
    expect(reloaded.isSolo()).toBe(true);
    expect(reloaded.getPatternData().isPatternSet(0)).toBe(true);
    expect(reloaded.getPatternData().isPatternSet(1)).toBe(true);
    expect(reloaded.getPatternData().isPatternSet(3)).toBe(false);
    expect(reloaded.getPatternData().isPatternSet(5)).toBe(true);
    expect(reloaded.getSoundObject()).toBeInstanceOf(GenericScore);
  });

  it('deep copies correctly', () => {
    const layer = new PatternLayer();
    layer.setName('Original');
    layer.getPatternData().setPattern(2, true);

    const copy = layer.deepCopy();
    expect(copy.getName()).toBe('Original');
    expect(copy.getPatternData().isPatternSet(2)).toBe(true);

    // Modifying copy should not affect original
    copy.getPatternData().setPattern(2, false);
    expect(layer.getPatternData().isPatternSet(2)).toBe(true);
  });
});

describe('PatternsLayerGroup', () => {
  it('creates with default values', () => {
    const group = new PatternsLayerGroup();
    expect(group.getName()).toBe('Patterns Layer Group');
    expect(group.getPatternBeatsLength()).toBe(4);
  });

  it('adds and manages layers', () => {
    const group = new PatternsLayerGroup();
    const layer = group.newLayerAt(0);
    layer.setName('Layer 1');

    expect(group.length).toBe(1);
    expect(group[0].getName()).toBe('Layer 1');
  });

  it('generates CSD from all pattern layers', () => {
    const group = new PatternsLayerGroup();
    group.setPatternBeatsLength(2);

    // Layer 1: score "i1 0 1" at patterns 0, 2
    const layer1 = group.newLayerAt(0);
    layer1.setName('Layer A');
    const gs1 = new GenericScore();
    gs1.setScoreText('i1 0 1\n');
    gs1.setStartTime(TimePosition.beats(0));
    gs1.setSubjectiveDuration(TimeDuration.beats(1));
    layer1.setSoundObject(gs1);
    layer1.getPatternData().setPattern(0, true);
    layer1.getPatternData().setPattern(2, true);

    // Layer 2: score "i2 0 1" at pattern 1
    const layer2 = group.newLayerAt(1);
    layer2.setName('Layer B');
    layer2.setMuted(false);
    const gs2 = new GenericScore();
    gs2.setScoreText('i2 0 1\n');
    gs2.setStartTime(TimePosition.beats(0));
    gs2.setSubjectiveDuration(TimeDuration.beats(1));
    layer2.setSoundObject(gs2);
    layer2.getPatternData().setPattern(1, true);

    const context = new TimeContext();
    const compileData = new CompileData();
    const notes = group.generateForCSD(context, compileData, 0, -1, false);

    // Layer 1: 2 patterns * 1 note = 2 notes (at 0, 4)
    // Layer 2: 1 pattern * 1 note = 1 note (at 2)
    expect(notes.length).toBe(3);
  });

  it('respects muted layers', () => {
    const group = new PatternsLayerGroup();
    group.setPatternBeatsLength(4);

    const layer1 = group.newLayerAt(0);
    const gs1 = new GenericScore();
    gs1.setScoreText('i1 0 1\n');
    gs1.setStartTime(TimePosition.beats(0));
    gs1.setSubjectiveDuration(TimeDuration.beats(1));
    layer1.setSoundObject(gs1);
    layer1.getPatternData().setPattern(0, true);

    const layer2 = group.newLayerAt(1);
    layer2.setMuted(true);
    const gs2 = new GenericScore();
    gs2.setScoreText('i2 0 1\n');
    gs2.setStartTime(TimePosition.beats(0));
    gs2.setSubjectiveDuration(TimeDuration.beats(1));
    layer2.setSoundObject(gs2);
    layer2.getPatternData().setPattern(0, true);

    const context = new TimeContext();
    const compileData = new CompileData();
    const notes = group.generateForCSD(context, compileData, 0, -1, false);

    // Only layer1 (non-muted) should contribute
    expect(notes.length).toBe(1);
  });

  it('round-trips through XML', () => {
    const group = new PatternsLayerGroup();
    group.setName('Test Patterns');
    group.setPatternBeatsLength(8);

    const layer = group.newLayerAt(0);
    layer.setName('Pattern Layer');
    const gs = new GenericScore();
    gs.setScoreText('i1 0 2\n');
    gs.setStartTime(TimePosition.beats(0));
    gs.setSubjectiveDuration(TimeDuration.beats(2));
    layer.setSoundObject(gs);
    layer.getPatternData().setPattern(0, true);
    layer.getPatternData().setPattern(3, true);

    const xml = group.saveAsXML();
    const reloaded = PatternsLayerGroup.loadFromXML(xml);

    expect(reloaded.getName()).toBe('Test Patterns');
    expect(reloaded.getPatternBeatsLength()).toBe(8);
    expect(reloaded.length).toBe(1);
    expect(reloaded[0].getName()).toBe('Pattern Layer');
    expect(reloaded[0].getPatternData().isPatternSet(0)).toBe(true);
    expect(reloaded[0].getPatternData().isPatternSet(3)).toBe(true);
  });

  it('deep copies correctly', () => {
    const group = new PatternsLayerGroup();
    group.setName('Original');
    group.setPatternBeatsLength(8);

    const layer = group.newLayerAt(0);
    layer.getPatternData().setPattern(1, true);

    const copy = group.deepCopyLG();
    expect(copy.getName()).toBe('Original');
    expect(copy.getPatternBeatsLength()).toBe(8);
    expect(copy.length).toBe(1);

    // Modifying copy should not affect original
    (copy as PatternsLayerGroup)[0].getPatternData().setPattern(1, false);
    expect(group[0].getPatternData().isPatternSet(1)).toBe(true);
  });
});

describe('PatternsLayerGroupProvider', () => {
  it('returns correct name', () => {
    const provider = new PatternsLayerGroupProvider();
    expect(provider.getLayerGroupName()).toBe('Patterns');
  });

  it('creates a default group with one layer', () => {
    const provider = new PatternsLayerGroupProvider();
    const group = provider.createLayerGroup();
    expect(group).toBeInstanceOf(PatternsLayerGroup);
    expect(group.length).toBe(1);
  });

  it('loads from matching XML', () => {
    const provider = new PatternsLayerGroupProvider();
    const xml = new Element('patternsLayerGroup');
    xml.setAttribute('name', 'Test');
    xml.addElement('patternLayers');

    const result = provider.loadFromXML(xml, new Map());
    expect(result).toBeInstanceOf(PatternsLayerGroup);
    expect(result!.getName()).toBe('Test');
  });

  it('returns null for non-matching XML', () => {
    const provider = new PatternsLayerGroupProvider();
    const xml = new Element('audioLayerGroup');
    const result = provider.loadFromXML(xml, new Map());
    expect(result).toBeNull();
  });
});
