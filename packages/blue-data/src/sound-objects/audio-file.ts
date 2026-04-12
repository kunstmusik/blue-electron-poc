/**
 * AudioFile — a SoundObject that plays an audio file via diskin2.
 * Mirrors the Java AudioFile class.
 *
 * Generates a diskin2-based Csound instrument and a single i-statement.
 */
import { AbstractSoundObject } from './abstract-sound-object';
import { NoteList } from './note-list';
import { Note } from './note';
import { TimeContext } from '../time/time-context';
import { CompileData } from '../compile-data';
import { Element } from '../serialization/xml-reader';
import { ObjRefSaveMap, ObjRefLoadMap } from '../serialization/obj-ref-map';
import { SoundObject } from './sound-object';
import { TimeBehavior } from './time-behavior';
import { TimeDuration } from '../time/time-duration';
import { TimePosition } from '../time/time-position';

export class AudioFile extends AbstractSoundObject {
  private _soundFileName = '';
  private _csoundPostCode = '\touts\taChannel1, aChannel1';
  private _useCustomWindowSize = false;
  private _windowSize = 8;

  constructor(other?: AudioFile) {
    super();
    if (other) {
      this.copyFrom(other);
      this._soundFileName = other._soundFileName;
      this._csoundPostCode = other._csoundPostCode;
      this._useCustomWindowSize = other._useCustomWindowSize;
      this._windowSize = other._windowSize;
    }
  }

  getSoundFileName(): string { return this._soundFileName; }
  setSoundFileName(name: string): void { this._soundFileName = name; }

  getCsoundPostCode(): string { return this._csoundPostCode; }
  setCsoundPostCode(code: string): void { this._csoundPostCode = code; }

  useCustomWindowSize(): boolean { return this._useCustomWindowSize; }
  setUseCustomWindowSize(val: boolean): void { this._useCustomWindowSize = val; }

  getWindowSize(): number { return this._windowSize; }
  setWindowSize(size: number): void { this._windowSize = size; }


  override getTimeBehavior(): TimeBehavior {
    return TimeBehavior.NOT_SUPPORTED;
  }

  override generateForCSD(
    context: TimeContext,
    compileData: CompileData,
    _startTime: number,
    _endTime: number,
  ): NoteList {
    if (!this._soundFileName) {
      return new NoteList();
    }

    // Generate instrument code for diskin2
    const channelVars = 'aChannel1';
    const sfName = this._soundFileName.replace(/\\/g, '/');
    const instrText = `${channelVars}\tdiskin2\t"${sfName}", 1, p4\n${this._csoundPostCode}`;

    // Create a generic instrument and add to compilation
    // For Phase 11: generate a simple note with file path as p4
    const notes = new NoteList();
    const subjectiveDur = this._subjectiveDuration.toBeats(context);
    const startTime = this._startTime.toBeats(context);

    const note = new Note();
    note.setPField('FILE_INSTR', 1); // Will be replaced by actual instr ID during compilation
    note.setStartTime(startTime);
    note.setSubjectiveDuration(subjectiveDur);
    note.setPField(`"${sfName}"`, 4);

    notes.push(note);

    // Append instrument text to global orc (simplified — full impl needs GenericInstrument)
    compileData.appendGlobalOrc(`instr FILE_INSTR\n${instrText}\nendin\n`);

    return notes;
  }

  override saveAsXML(_objRefMap?: ObjRefSaveMap): Element {
    const elem = new Element('soundObject');
    elem.setAttribute('type', 'AudioFile');
    elem.addElement('name').setText(this._name);
    elem.addElement('startTime').setText(this._startTime.getValue().toString());
    elem.addElement('subjectiveDuration').setText(this._subjectiveDuration.getValue().toString());
    elem.addElement('timeBehavior').setText(this._timeBehavior);
    elem.addElement('backgroundColor').setText(this._backgroundColor.toString());
    elem.addElement('soundFileName').setText(this._soundFileName);
    elem.addElement('csoundPostCode').setText(this._csoundPostCode);
    return elem;
  }

  static loadFromXML(data: Element, _objRefMap?: ObjRefLoadMap): AudioFile {
    const obj = new AudioFile();
    obj.setName(data.getTextString('name') ?? 'Audio File');

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

    const sf = data.getTextString('soundFileName');
    if (sf !== null) obj._soundFileName = sf;

    const post = data.getTextString('csoundPostCode');
    if (post !== null) obj._csoundPostCode = post;

    return obj;
  }

  override deepCopy(): SoundObject {
    return new AudioFile(this);
  }
}
