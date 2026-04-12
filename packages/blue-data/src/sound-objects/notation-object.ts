/**
 * NotationObject — generates notes from standard music notation.
 * Mirrors the Java NotationObject class.
 *
 * Phase 11: Data preservation (load/save XML). Full notation generation
 * requires the NotationStaff sub-system.
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

export class NotationObject extends AbstractSoundObject {
  private _staffData = '';

  constructor(other?: NotationObject) {
    super();
    if (other) {
      this.copyFrom(other);
      this._staffData = other._staffData;
    }
  }

  getStaffData(): string { return this._staffData; }
  setStaffData(data: string): void { this._staffData = data; }


  override generateForCSD(
    _context: TimeContext,
    _compileData: CompileData,
    _startTime: number,
    _endTime: number,
  ): NoteList {
    console.warn('NotationObject.generateForCSD skipped: requires NotationStaff sub-system');
    return new NoteList();
  }

  override saveAsXML(_objRefMap?: ObjRefSaveMap): Element {
    const elem = new Element('soundObject');
    elem.setAttribute('type', 'NotationObject');
    elem.addElement('name').setText(this._name);
    elem.addElement('startTime').setText(this._startTime.getValue().toString());
    elem.addElement('subjectiveDuration').setText(this._subjectiveDuration.getValue().toString());
    elem.addElement('timeBehavior').setText(this._timeBehavior);
    elem.addElement('backgroundColor').setText(this._backgroundColor.toString());
    elem.addElement('staffData').setText(this._staffData);
    return elem;
  }

  static loadFromXML(data: Element, _objRefMap?: ObjRefLoadMap): NotationObject {
    const obj = new NotationObject();
    obj.setName(data.getTextString('name') ?? 'Notation Object');

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

    const staff = data.getTextString('staffData');
    if (staff !== null) obj._staffData = staff;

    return obj;
  }

  override deepCopy(): SoundObject {
    return new NotationObject(this);
  }
}
