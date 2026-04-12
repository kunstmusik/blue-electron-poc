/**
 * TrackerObject — generates notes from a tracker-style step sequencer.
 * Mirrors the Java TrackerObject class.
 *
 * Phase 11: Data preservation (load/save XML). Full tracker generation
 * requires the TrackList sub-system.
 */
import { AbstractSoundObject } from './abstract-sound-object';
import { NoteList } from './note-list';
import { TimeContext } from '../time/time-context';
import { CompileData } from '../compile-data';
import { Element } from '../serialization/xml-reader';
import { ObjRefSaveMap, ObjRefLoadMap } from '../serialization/obj-ref-map';
import { SoundObject } from './sound-object';
import { TimeBehavior } from './time-behavior';
import { TimeDuration } from '../time/time-duration';
import { TimePosition } from '../time/time-position';

export class TrackerObject extends AbstractSoundObject {
  private _stepsPerBeat = 4;
  private _trackData: string[][] = [];

  constructor(other?: TrackerObject) {
    super();
    if (other) {
      this.copyFrom(other);
      this._stepsPerBeat = other._stepsPerBeat;
      this._trackData = other._trackData.map((t) => [...t]);
    }
  }

  getStepsPerBeat(): number { return this._stepsPerBeat; }
  setStepsPerBeat(s: number): void { this._stepsPerBeat = s; }

  getTrackData(): string[][] { return this._trackData.map((t) => [...t]); }
  setTrackData(data: string[][]): void { this._trackData = data.map((t) => [...t]); }
  addTrack(track: string[]): void { this._trackData.push(track); }


  override generateForCSD(
    _context: TimeContext,
    _compileData: CompileData,
    _startTime: number,
    _endTime: number,
  ): NoteList {
    console.warn('TrackerObject.generateForCSD skipped: requires TrackList sub-system');
    return new NoteList();
  }

  override saveAsXML(_objRefMap?: ObjRefSaveMap): Element {
    const elem = new Element('soundObject');
    elem.setAttribute('type', 'TrackerObject');
    elem.addElement('name').setText(this._name);
    elem.addElement('startTime').setText(this._startTime.getValue().toString());
    elem.addElement('subjectiveDuration').setText(this._subjectiveDuration.getValue().toString());
    elem.addElement('timeBehavior').setText(this._timeBehavior);
    elem.addElement('backgroundColor').setText(this._backgroundColor.toString());
    elem.addElement('stepsPerBeat').setText(this._stepsPerBeat.toString());

    const tracksElem = elem.addElement('tracks');
    for (const track of this._trackData) {
      const tElem = tracksElem.addElement('track');
      tElem.setText(track.join(' '));
    }

    return elem;
  }

  static loadFromXML(data: Element, _objRefMap?: ObjRefLoadMap): TrackerObject {
    const obj = new TrackerObject();
    obj.setName(data.getTextString('name') ?? 'Tracker');

    const startStr = data.getTextString('startTime');
    if (startStr) obj._startTime = TimePosition.beats(parseFloat(startStr));

    const dur = data.getTextString('subjectiveDuration');
    if (dur) obj._subjectiveDuration = TimeDuration.beats(parseFloat(dur));

    const tb = data.getTextString('timeBehavior');
    if (tb && Object.values(TimeBehavior).includes(tb as TimeBehavior)) {
      obj._timeBehavior = tb as TimeBehavior;
    }

    const color = data.getTextString('backgroundColor');
    if (color) obj._backgroundColor = parseInt(color, 10);

    const spb = data.getTextString('stepsPerBeat');
    if (spb) obj._stepsPerBeat = parseInt(spb, 10);

    const tracksElem = data.getElement('tracks');
    if (tracksElem) {
      const tNodes = tracksElem.getElements('track');
      while (tNodes.hasMoreElements()) {
        obj._trackData.push(tNodes.next().getTextString().split(' '));
      }
    }

    return obj;
  }

  override deepCopy(): SoundObject {
    return new TrackerObject(this);
  }
}
