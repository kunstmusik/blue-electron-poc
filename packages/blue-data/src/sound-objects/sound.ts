/**
 * Sound — a SoundObject with a BlueSynthBuilder (BSB) instrument.
 * Mirrors the Java Sound class.
 *
 * Phase 11: Data preservation (load/save XML). BSB CSD generation
 * requires the full BSB system (Phase 11 BSB sub-task).
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

export class Sound extends AbstractSoundObject {
  private _comment = '';
  private _bsbInstrumentText = '';

  constructor(other?: Sound) {
    super();
    if (other) {
      this.copyFrom(other);
      this._comment = other._comment;
      this._bsbInstrumentText = other._bsbInstrumentText;
    }
  }

  getComment(): string { return this._comment; }
  setComment(text: string): void { this._comment = text; }

  getBSBInstrumentText(): string { return this._bsbInstrumentText; }
  setBSBInstrumentText(text: string): void { this._bsbInstrumentText = text; }


  override getTimeBehavior(): TimeBehavior {
    return TimeBehavior.NOT_SUPPORTED;
  }

  override generateForCSD(
    _context: TimeContext,
    _compileData: CompileData,
    _startTime: number,
    _endTime: number,
  ): NoteList {
    // BSB CSD generation requires full BSB system — deferred
    console.warn('Sound.generateForCSD skipped: requires BlueSynthBuilder system');
    return new NoteList();
  }

  override saveAsXML(_objRefMap?: ObjRefSaveMap): Element {
    const elem = new Element('soundObject');
    elem.setAttribute('type', 'Sound');
    elem.addElement('name').setText(this._name);
    elem.addElement('startTime').setText(this._startTime.getValue().toString());
    elem.addElement('subjectiveDuration').setText(this._subjectiveDuration.getValue().toString());
    elem.addElement('timeBehavior').setText(this._timeBehavior);
    elem.addElement('backgroundColor').setText(this._backgroundColor.toString());
    elem.addElement('comment').setText(this._comment);
    if (this._bsbInstrumentText) {
      elem.addElement('instrumentText').setText(this._bsbInstrumentText);
    }
    return elem;
  }

  static loadFromXML(data: Element, _objRefMap?: ObjRefLoadMap): Sound {
    const obj = new Sound();
    obj.setName(data.getTextString('name') ?? 'Sound');

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

    const comment = data.getTextString('comment');
    if (comment !== null) obj._comment = comment;

    // For backwards compatibility with Blue versions < 2.6.0
    const instrText = data.getTextString('instrumentText');
    if (instrText !== null) obj._bsbInstrumentText = instrText;

    return obj;
  }

  override deepCopy(): SoundObject {
    return new Sound(this);
  }
}
