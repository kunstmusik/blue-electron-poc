import { describe, it, expect } from 'vitest';
import type { TimebaseUpdateMode } from '../components/workbench/panels/score/RulerConfigDialog';
import { TimeBase, TimePosition, TimeDuration, TimeContext } from '@blue/data';

interface MockScoreObject {
  startTime: TimePosition;
  duration: TimeDuration;
  timeBase: TimeBase;
}

interface MockMarker {
  time: TimePosition;
  timeBase: TimeBase;
}

function shouldUpdateObject(
  obj: MockScoreObject,
  oldTimeBase: TimeBase,
  mode: TimebaseUpdateMode | null,
): { updateStart: boolean; updateDuration: boolean } {
  if (mode === null) return { updateStart: false, updateDuration: false };
  if (mode === 'UPDATE_ALL') return { updateStart: true, updateDuration: true };
  return {
    updateStart: obj.startTime.getTimeBase() === oldTimeBase,
    updateDuration: obj.duration.getTimeBase() === oldTimeBase,
  };
}

function shouldUpdateMarker(
  marker: MockMarker,
  oldTimeBase: TimeBase,
  mode: TimebaseUpdateMode | null,
): boolean {
  if (mode === null) return false;
  if (mode === 'UPDATE_ALL') return true;
  return marker.time.getTimeBase() === oldTimeBase;
}

describe('Ruler Config Timebase Update Logic', () => {
  const oldTimeBase = TimeBase.BEATS;
  const newTimeBase = TimeBase.SECONDS;

  const objBeatsBeats: MockScoreObject = {
    startTime: TimePosition.beats(4.0),
    duration: TimeDuration.beats(2.0),
    timeBase: TimeBase.BEATS,
  };

  const objBeatsSeconds: MockScoreObject = {
    startTime: TimePosition.beats(4.0),
    duration: TimeDuration.seconds(1.0),
    timeBase: TimeBase.BEATS,
  };

  const objSecondsSeconds: MockScoreObject = {
    startTime: TimePosition.seconds(2.0),
    duration: TimeDuration.seconds(1.0),
    timeBase: TimeBase.SECONDS,
  };

  const markerBeats: MockMarker = {
    time: TimePosition.beats(8.0),
    timeBase: TimeBase.BEATS,
  };

  const markerSeconds: MockMarker = {
    time: TimePosition.seconds(4.0),
    timeBase: TimeBase.SECONDS,
  };

  describe('shouldUpdateObject', () => {
    it('UPDATE_ALL updates all objects regardless of their timebase', () => {
      expect(shouldUpdateObject(objBeatsBeats, oldTimeBase, 'UPDATE_ALL')).toEqual({
        updateStart: true,
        updateDuration: true,
      });
      expect(shouldUpdateObject(objSecondsSeconds, oldTimeBase, 'UPDATE_ALL')).toEqual({
        updateStart: true,
        updateDuration: true,
      });
    });

    it('UPDATE_MATCHING only updates objects matching old timebase', () => {
      expect(shouldUpdateObject(objBeatsBeats, oldTimeBase, 'UPDATE_MATCHING')).toEqual({
        updateStart: true,
        updateDuration: true,
      });
      expect(shouldUpdateObject(objBeatsSeconds, oldTimeBase, 'UPDATE_MATCHING')).toEqual({
        updateStart: true,
        updateDuration: false,
      });
      expect(shouldUpdateObject(objSecondsSeconds, oldTimeBase, 'UPDATE_MATCHING')).toEqual({
        updateStart: false,
        updateDuration: false,
      });
    });

    it('UPDATE_MATCHING per-field: start matches old, duration does not', () => {
      expect(shouldUpdateObject(objBeatsSeconds, oldTimeBase, 'UPDATE_MATCHING')).toEqual({
        updateStart: true,
        updateDuration: false,
      });
    });

    it('null mode skips all updates', () => {
      expect(shouldUpdateObject(objBeatsBeats, oldTimeBase, null)).toEqual({
        updateStart: false,
        updateDuration: false,
      });
      expect(shouldUpdateObject(objSecondsSeconds, oldTimeBase, null)).toEqual({
        updateStart: false,
        updateDuration: false,
      });
    });
  });

  describe('shouldUpdateMarker', () => {
    it('UPDATE_ALL updates all markers regardless of timebase', () => {
      expect(shouldUpdateMarker(markerBeats, oldTimeBase, 'UPDATE_ALL')).toBe(true);
      expect(shouldUpdateMarker(markerSeconds, oldTimeBase, 'UPDATE_ALL')).toBe(true);
    });

    it('UPDATE_MATCHING only updates markers matching old timebase', () => {
      expect(shouldUpdateMarker(markerBeats, oldTimeBase, 'UPDATE_MATCHING')).toBe(true);
      expect(shouldUpdateMarker(markerSeconds, oldTimeBase, 'UPDATE_MATCHING')).toBe(false);
    });

    it('null mode skips all marker updates', () => {
      expect(shouldUpdateMarker(markerBeats, oldTimeBase, null)).toBe(false);
      expect(shouldUpdateMarker(markerSeconds, oldTimeBase, null)).toBe(false);
    });
  });

  describe('combined decision matrix', () => {
    const objects = [objBeatsBeats, objBeatsSeconds, objSecondsSeconds];
    const markers = [markerBeats, markerSeconds];

    function applyUpdate(
      scoreObjectMode: TimebaseUpdateMode | null,
      markerMode: TimebaseUpdateMode | null,
    ) {
      const updatedObjects = objects.map((obj) => shouldUpdateObject(obj, oldTimeBase, scoreObjectMode));
      const updatedMarkers = markers.map((m) => shouldUpdateMarker(m, oldTimeBase, markerMode));
      return { updatedObjects, updatedMarkers };
    }

    it('both UPDATE_ALL: updates everything', () => {
      const result = applyUpdate('UPDATE_ALL', 'UPDATE_ALL');
      expect(result.updatedObjects).toEqual([
        { updateStart: true, updateDuration: true },
        { updateStart: true, updateDuration: true },
        { updateStart: true, updateDuration: true },
      ]);
      expect(result.updatedMarkers).toEqual([true, true]);
    });

    it('both UPDATE_MATCHING: only matching items', () => {
      const result = applyUpdate('UPDATE_MATCHING', 'UPDATE_MATCHING');
      expect(result.updatedObjects).toEqual([
        { updateStart: true, updateDuration: true },
        { updateStart: true, updateDuration: false },
        { updateStart: false, updateDuration: false },
      ]);
      expect(result.updatedMarkers).toEqual([true, false]);
    });

    it('scoreobjects UPDATE_ALL, markers null: updates all objects, no markers', () => {
      const result = applyUpdate('UPDATE_ALL', null);
      expect(result.updatedObjects.every((o) => o.updateStart && o.updateDuration)).toBe(true);
      expect(result.updatedMarkers.every((m) => m === false)).toBe(true);
    });

    it('scoreobjects null, markers UPDATE_ALL: no objects, all markers', () => {
      const result = applyUpdate(null, 'UPDATE_ALL');
      expect(result.updatedObjects.every((o) => !o.updateStart && !o.updateDuration)).toBe(true);
      expect(result.updatedMarkers.every((m) => m === true)).toBe(true);
    });

    it('both null: nothing updated', () => {
      const result = applyUpdate(null, null);
      expect(result.updatedObjects.every((o) => !o.updateStart && !o.updateDuration)).toBe(true);
      expect(result.updatedMarkers.every((m) => m === false)).toBe(true);
    });

    it('scoreobjects UPDATE_MATCHING, markers UPDATE_ALL', () => {
      const result = applyUpdate('UPDATE_MATCHING', 'UPDATE_ALL');
      expect(result.updatedObjects).toEqual([
        { updateStart: true, updateDuration: true },
        { updateStart: true, updateDuration: false },
        { updateStart: false, updateDuration: false },
      ]);
      expect(result.updatedMarkers).toEqual([true, true]);
    });
  });
});
