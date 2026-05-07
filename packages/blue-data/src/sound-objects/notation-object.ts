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
import { initBasicFromXML, getBasicXML } from './sound-object-utilities';

export class NotationObject extends AbstractSoundObject {
  private _staffData = '';

  constructor(other?: NotationObject) {
    super();
    this.setName('Notation Object');
    this._subjectiveDuration = TimeDuration.beats(2);
    this._backgroundColor = 0x404040;
    this._timeBehavior = TimeBehavior.SCALE;
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
    const elem = getBasicXML(this, 'blue.soundObject.NotationObject');
    elem.addElement('staffData').setText(this._staffData);
    return elem;
  }

  static loadFromXML(data: Element, _objRefMap?: ObjRefLoadMap): NotationObject {
    const obj = new NotationObject();
    initBasicFromXML(obj, data);

    const staff = data.getTextString('staffData');
    if (staff !== null) obj._staffData = staff;

    return obj;
  }

  override deepCopy(): SoundObject {
    return new NotationObject(this);
  }
}
