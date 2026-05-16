/**
 * JMask — generates notes using a mask-based random pattern system.
 * Mirrors the Java JMask class.
 *
 * The nested field/generator model is implemented in jmask-support.ts.
 */
import { AbstractSoundObject } from './abstract-sound-object';
import { NoteList } from './note-list';
import { TimeContext } from '../time/time-context';
import { CompileData } from '../compile-data';
import { Element } from '../serialization/xml-reader';
import { ObjRefSaveMap, ObjRefLoadMap } from '../serialization/obj-ref-map';
import { SoundObject } from './sound-object';
import { initBasicFromXML, getBasicXML } from './sound-object-utilities';
import { applyNoteProcessorChain, applyTimeBehavior, setScoreStart } from '../utilities/score';
import { Field, JavaRandom } from './jmask-support';

export class JMask extends AbstractSoundObject {
  private _seedUsed = false;
  private _seed = 0;
  private _field = new Field();

  constructor(other?: JMask) {
    super();
    this.setName('JMask');
    if (other) {
      this.copyFrom(other);
      this._seedUsed = other._seedUsed;
      this._seed = other._seed;
      this._field = other._field.deepCopy();
    }
  }

  isSeedUsed(): boolean { return this._seedUsed; }
  setSeedUsed(val: boolean): void { this._seedUsed = val; }

  getSeed(): number { return this._seed; }
  setSeed(val: number): void { this._seed = val; }

  getField(): Field { return this._field; }
  setField(field: Field): void { this._field = field; }

  generateNotes(context: TimeContext, _renderStart = 0, _renderEnd = -1): NoteList {
    const field = new Field(this._field);
    const rnd = this._seedUsed ? new JavaRandom(this._seed) : new JavaRandom();
    const duration = this.getSubjectiveDuration().toBeats(context);

    let notes = field.generateNotes(duration, rnd);
    notes = applyNoteProcessorChain(notes, this.getNoteProcessorChain());

    const repeatPoint = this.getRepeatPoint();
    const repeatPointBeats = repeatPoint ? repeatPoint.toBeats(context) : -1;
    applyTimeBehavior(notes, this.getTimeBehavior(), duration, repeatPointBeats);
    setScoreStart(notes, this.getStartTime().toBeats(context));

    return notes;
  }


  override generateForCSD(
    context: TimeContext,
    _compileData: CompileData,
    startTime: number,
    endTime: number,
  ): NoteList {
    return this.generateNotes(context, startTime, endTime);
  }

  override saveAsXML(_objRefMap?: ObjRefSaveMap): Element {
    const elem = getBasicXML(this, 'blue.soundObject.JMask');
    elem.addElement('seedUsed').setText(this._seedUsed.toString());
    elem.addElement('seed').setText(this._seed.toString());
    elem.addElement(this._field.saveAsXML());
    return elem;
  }

  static loadFromXML(data: Element, _objRefMap?: ObjRefLoadMap): JMask {
    const obj = new JMask();
    initBasicFromXML(obj, data);

    const seedUsed = data.getTextString('seedUsed');
    if (seedUsed !== null) obj._seedUsed = seedUsed.toLowerCase() === 'true';

    const seed = data.getTextString('seed');
    if (seed !== null) obj._seed = parseInt(seed, 10);

    const field = data.getElement('field');
    if (field !== null) {
      obj._field = Field.loadFromXML(field);
    }

    return obj;
  }

  override deepCopy(): SoundObject {
    return new JMask(this);
  }
}
