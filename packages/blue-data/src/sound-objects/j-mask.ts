/**
 * JMask — generates notes using a mask-based random pattern system.
 * Mirrors the Java JMask class.
 *
 * Phase 11: Data preservation (load/save XML). Full JMask generation
 * requires the Field sub-system.
 */
import { AbstractSoundObject } from './abstract-sound-object';
import { NoteList } from './note-list';
import { TimeContext } from '../time/time-context';
import { CompileData } from '../compile-data';
import { Element } from '../serialization/xml-reader';
import { ObjRefSaveMap, ObjRefLoadMap } from '../serialization/obj-ref-map';
import { SoundObject } from './sound-object';
import { initBasicFromXML } from './sound-object-utilities';

export class JMask extends AbstractSoundObject {
  private _seedUsed = false;
  private _seed = 0;

  constructor(other?: JMask) {
    super();
    if (other) {
      this.copyFrom(other);
      this._seedUsed = other._seedUsed;
      this._seed = other._seed;
    }
  }

  isSeedUsed(): boolean { return this._seedUsed; }
  setSeedUsed(val: boolean): void { this._seedUsed = val; }

  getSeed(): number { return this._seed; }
  setSeed(val: number): void { this._seed = val; }


  override generateForCSD(
    _context: TimeContext,
    _compileData: CompileData,
    _startTime: number,
    _endTime: number,
  ): NoteList {
    console.warn('JMask.generateForCSD skipped: requires Field sub-system');
    return new NoteList();
  }

  override saveAsXML(_objRefMap?: ObjRefSaveMap): Element {
    const elem = new Element('soundObject');
    elem.setAttribute('type', 'JMask');
    elem.addElement('name').setText(this._name);
    elem.addElement('startTime').setText(this._startTime.getValue().toString());
    elem.addElement('subjectiveDuration').setText(this._subjectiveDuration.getValue().toString());
    elem.addElement('timeBehavior').setText(this._timeBehavior);
    elem.addElement('backgroundColor').setText(this._backgroundColor.toString());
    elem.addElement('seedUsed').setText(this._seedUsed.toString());
    elem.addElement('seed').setText(this._seed.toString());
    return elem;
  }

  static loadFromXML(data: Element, _objRefMap?: ObjRefLoadMap): JMask {
    const obj = new JMask();
    initBasicFromXML(obj, data);

    const seedUsed = data.getTextString('seedUsed');
    if (seedUsed) obj._seedUsed = seedUsed.toLowerCase() === 'true';

    const seed = data.getTextString('seed');
    if (seed) obj._seed = parseInt(seed, 10);

    return obj;
  }

  override deepCopy(): SoundObject {
    return new JMask(this);
  }
}
