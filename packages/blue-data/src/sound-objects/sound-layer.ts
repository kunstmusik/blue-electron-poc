/**
 * SoundLayer — a layer within a PolyObject that contains SoundObjects.
 * Mirrors the Java SoundLayer class.
 *
 * generateForCSD sorts sound objects by start time, computes adjusted
 * start/end times relative to each object's timeline, and merges notes
 * without applying an additional offset (sound objects handle their own
 * start time internally).
 */
import { Layer, LAYER_HEIGHT } from '../score/layers/layer';
import { ScoreObject } from '../score/score-object';
import { SoundObject } from '../sound-objects/sound-object';
import { TimeContext } from '../time/time-context';
import { CompileData } from '../compile-data';
import { NoteList } from './note-list';

export class SoundLayer extends Array<SoundObject> implements Layer {
  private _name = '';

  constructor() {
    super();
  }

  // ─── Layer implementation ───

  getName(): string {
    return this._name;
  }

  setName(name: string): void {
    this._name = name;
  }

  getLayerHeight(): number {
    return LAYER_HEIGHT;
  }

  accepts(object: ScoreObject): boolean {
    // SoundLayer accepts any SoundObject
    return 'generateForCSD' in object;
  }

  contains(object: ScoreObject): boolean {
    return (this as SoundObject[]).includes(object as SoundObject);
  }

  remove(object: ScoreObject): boolean {
    const idx = this.indexOf(object as SoundObject);
    if (idx !== -1) {
      this.splice(idx, 1);
      return true;
    }
    return false;
  }

  clearScoreObjects(): void {
    this.length = 0;
  }

  /**
   * Generate notes for all sound objects in this layer.
   * Mirrors Java SoundLayer.generateForCSD exactly:
   * - Sort sound objects by start time
   * - Compute adjustedStart/adjustedEnd relative to each object's timeline
   * - Skip objects that don't overlap with the render range
   * - Each sound object handles its own start time offset internally
   * - Do NOT apply an additional offset here
   */
  generateForCSD(
    context: TimeContext,
    compileData: CompileData,
    startTime: number,
    endTime: number,
  ): NoteList {
    const noteList = new NoteList();

    // Sort sound objects by start time
    const sorted = [...this].sort((a, b) =>
      a.getStartTime().toBeats(context) - b.getStartTime().toBeats(context),
    );

    for (const sObj of sorted) {
      const sObjStart = sObj.getStartTime().toBeats(context);
      const sObjDur = sObj.getSubjectiveDuration().toBeats(context);
      const sObjEnd = sObjStart + sObjDur;

      // Skip objects that end before the render start
      if (sObjEnd <= startTime) continue;

      let adjustedStart: number;
      let adjustedEnd: number;

      if (endTime <= startTime) {
        // No end time constraint: render from adjustedStart to end
        adjustedStart = startTime - sObjStart;
        if (adjustedStart < 0) adjustedStart = 0;
        adjustedEnd = -1;
      } else if (sObjStart < endTime) {
        // Both start and end constraints
        adjustedStart = startTime - sObjStart;
        adjustedEnd = endTime - sObjStart;
        if (adjustedStart < 0) adjustedStart = 0;
        if (adjustedEnd >= sObjDur) adjustedEnd = -1;
      } else {
        // Object starts after render end — skip
        continue;
      }

      const nl = sObj.generateForCSD(context, compileData, adjustedStart, adjustedEnd);
      noteList.merge(nl);
    }

    return noteList;
  }

  deepCopy(): SoundLayer {
    // SoundLayers are deep-copied by their containing PolyObject
    throw new Error('SoundLayer deepCopy should be called via PolyObject');
  }
}
