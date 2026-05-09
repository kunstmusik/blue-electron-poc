import { describe, it, expect } from 'vitest';
import { TrackerObject } from './tracker-object';
import { Track } from './tracker/track';
import { Column } from './tracker/column';
import { TimeContext } from '../time/time-context';
import { Element } from '../serialization/xml-reader';

describe('TrackerObject', () => {
  it('should initialize with default values', () => {
    const obj = new TrackerObject();
    expect(obj.getName()).toBe('Tracker');
    expect(obj.getStepsPerBeat()).toBe(4);
    expect(obj.getTracks().size()).toBe(0);
  });

  it('should generate notes correctly', () => {
    const obj = new TrackerObject();
    const track = new Track();
    track.setInstrumentId('1');
    track.resizeSteps(16);
    
    // Set a note at step 0
    track.getTrackerNote(0).setValue(1, '8.00'); // pch column
    track.getTrackerNote(0).setValue(2, '80');   // db column
    
    obj.getTracks().setSteps(16);
    obj.getTracks().addTrack(track);
    obj.setStepsPerBeat(4);

    const context = new TimeContext();
    const nl = obj.generateForCSD(context, {} as any, 0, -1);

    expect(nl.size).toBe(1);
    const note = nl.getNote(0);
    expect(note.getPField(1)).toBe('1');
    expect(note.getStartTime()).toBe(0);
    expect(note.getSubjectiveDuration()).toBe(4.0); // 16 steps / 4 steps per beat
    expect(note.getPField(4)).toBe('8.00');
    expect(note.getPField(5)).toBe('80');
  });

  it('should handle tied notes', () => {
    const obj = new TrackerObject();
    const track = new Track();
    track.setInstrumentId('1');
    track.resizeSteps(16);
    
    track.getTrackerNote(0).setTied(true);
    track.getTrackerNote(0).setValue(1, '8.00');
    track.getTrackerNote(0).setValue(2, '80');
    
    obj.getTracks().setSteps(16);
    obj.getTracks().addTrack(track);
    obj.setStepsPerBeat(4);

    const context = new TimeContext();
    const nl = obj.generateForCSD(context, {} as any, 0, -1);

    expect(nl.size).toBe(1);
    const note = nl.getNote(0);
    expect(note.isTiedNote()).toBe(true);
    expect(note.getPField(3)).toBe('-4');
  });

  it('should support legacy XML loading defaults for stepsPerBeat', () => {
    const xml = `<blue.soundObject.TrackerObject>
      <name>Tracker</name>
      <trackList>
        <steps>64</steps>
      </trackList>
    </blue.soundObject.TrackerObject>`;
    
    const doc = Element.parse(xml);
    const obj = TrackerObject.loadFromXML(doc);
    
    expect(obj.getStepsPerBeat()).toBe(1); // Default for legacy
  });

  it('should load stepsPerBeat when present in XML', () => {
    const xml = `<blue.soundObject.TrackerObject>
      <name>Tracker</name>
      <stepsPerBeat>2</stepsPerBeat>
      <trackList>
        <steps>64</steps>
      </trackList>
    </blue.soundObject.TrackerObject>`;
    
    const doc = Element.parse(xml);
    const obj = TrackerObject.loadFromXML(doc);
    
    expect(obj.getStepsPerBeat()).toBe(2);
  });

  it('should round-trip XML correctly', () => {
    const obj = new TrackerObject();
    obj.setStepsPerBeat(2);
    const track = new Track();
    track.setName('TestTrack');
    obj.getTracks().addTrack(track);
    
    const xml = obj.saveAsXML();
    const obj2 = TrackerObject.loadFromXML(xml);
    
    expect(obj2.getStepsPerBeat()).toBe(2);
    expect(obj2.getTracks().size()).toBe(1);
    expect(obj2.getTracks().getTrack(0)!.getName()).toBe('TestTrack');
  });
});
