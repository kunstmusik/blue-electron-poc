/**
 * AbstractSoundObject — base implementation of SoundObject.
 * Mirrors the Java AbstractSoundObject class.
 *
 * Provides default implementations for ScoreObject properties (name, start time,
 * duration, color) and common listener management.
 */
import { SoundObject } from './sound-object';
import { ScoreObjectListener, ScoreObjectEvent, ScoreEventType } from '../score/score-object-event';
import { TimePosition } from '../time/time-position';
import { TimeDuration } from '../time/time-duration';
import { TimeContext } from '../time/time-context';
import { TimeBehavior } from './time-behavior';
import { NoteProcessorChain } from '../note-processors/note-processor-chain';
import { NoteList } from './note-list';
import { CompileData } from '../compile-data';
import { Element } from '../serialization/xml-reader';
import { ObjRefSaveMap } from '../serialization/obj-ref-map';

export abstract class AbstractSoundObject implements SoundObject {
  protected _name = '';
  protected _startTime = TimePosition.beats(0);
  protected _subjectiveDuration = TimeDuration.beats(4);
  protected _backgroundColor = 0x404040;
  protected _timeBehavior = TimeBehavior.SCALE;
  protected _repeatPoint: TimeDuration | null = null;
  protected _npc = new NoteProcessorChain();
  protected _cloneSourceHashCode = 0;
  private _listeners: ScoreObjectListener[] = [];

  constructor() {}

  // Copy constructor
  protected copyFrom(other: AbstractSoundObject): void {
    this._name = other._name;
    this._startTime = other._startTime;
    this._subjectiveDuration = other._subjectiveDuration;
    this._backgroundColor = other._backgroundColor;
    this._timeBehavior = other._timeBehavior;
    this._repeatPoint = other._repeatPoint;
    this._npc = new NoteProcessorChain(other._npc);
    this._cloneSourceHashCode = other._cloneSourceHashCode;
  }

  // ─── ScoreObject implementation ───

  getName(): string {
    return this._name;
  }

  setName(value: string): void {
    const old = this._name;
    this._name = value;
    this.fireEvent(ScoreEventType.NAME);
  }

  getStartTime(): TimePosition {
    return this._startTime;
  }

  setStartTime(value: TimePosition): void {
    const old = this._startTime;
    this._startTime = value;
    this.fireEvent(ScoreEventType.START_TIME);
  }

  getSubjectiveDuration(): TimeDuration {
    return this._subjectiveDuration;
  }

  setSubjectiveDuration(value: TimeDuration): void {
    const old = this._subjectiveDuration;
    this._subjectiveDuration = value;
    this.fireEvent(ScoreEventType.DURATION);
  }

  getBackgroundColor(): number {
    return this._backgroundColor;
  }

  setBackgroundColor(color: number): void {
    const old = this._backgroundColor;
    this._backgroundColor = color;
    this.fireEvent(ScoreEventType.COLOR);
  }

  getResizeLeftLimits(_context: TimeContext): number[] {
    return [-Infinity, 0];
  }

  getResizeRightLimits(_context: TimeContext): number[] {
    return [0, Infinity];
  }

  resizeLeft(_context: TimeContext, _newStartTime: number): void {
    // Default: no-op
  }

  resizeRight(_context: TimeContext, _newEndTime: number): void {
    // Default: no-op
  }

  addScoreObjectListener(listener: ScoreObjectListener): void {
    if (!this._listeners.includes(listener)) {
      this._listeners.push(listener);
    }
  }

  removeScoreObjectListener(listener: ScoreObjectListener): void {
    const idx = this._listeners.indexOf(listener);
    if (idx !== -1) {
      this._listeners.splice(idx, 1);
    }
  }

  getCloneSourceHashCode(): number {
    return this._cloneSourceHashCode;
  }

  // ─── SoundObject implementation ───

  getNoteProcessorChain(): NoteProcessorChain {
    return this._npc;
  }

  setNoteProcessorChain(chain: NoteProcessorChain): void {
    this._npc = chain;
  }

  getTimeBehavior(): TimeBehavior {
    return this._timeBehavior;
  }

  setTimeBehavior(behavior: TimeBehavior): void {
    this._timeBehavior = behavior;
    this.fireEvent(ScoreEventType.TIME_BEHAVIOR);
  }

  getRepeatPoint(): TimeDuration | null {
    return this._repeatPoint;
  }

  setRepeatPoint(repeatPoint: TimeDuration | null): void {
    this._repeatPoint = repeatPoint;
    this.fireEvent(ScoreEventType.REPEAT_POINT);
  }

  // ─── Abstract methods ───

  abstract generateForCSD(
    context: TimeContext,
    compileData: CompileData,
    startTime: number,
    endTime: number,
  ): NoteList;

  abstract saveAsXML(objRefMap?: ObjRefSaveMap): Element;

  abstract deepCopy(): SoundObject;

  // ─── Event firing ───

  protected fireEvent(type: ScoreEventType): void {
    const event = new ScoreObjectEvent(type);
    for (const listener of this._listeners) {
      listener.scoreObjectChanged(event);
    }
  }
}
