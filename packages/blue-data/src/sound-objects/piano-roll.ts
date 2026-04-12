/**
 * PianoRoll — generates notes from a piano roll editor.
 * Mirrors the Java PianoRoll class.
 *
 * Phase 11: Data preservation (load/save XML). Full piano roll CSD generation
 * requires PianoNote, Scale, and Field sub-systems.
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

export interface PianoNoteData {
  pitch: number;
  start: number;
  duration: number;
  velocity: number;
  fields: Map<string, number>;
}

export class PianoRoll extends AbstractSoundObject {
  private _notes: PianoNoteData[] = [];
  private _instrumentId = '';
  private _noteTemplate = 'i<INSTR_ID> <START> <DUR> <PCH>';
  private _transposition = 0;
  private _pixelSecond = 100;
  private _noteHeight = 10;

  constructor(other?: PianoRoll) {
    super();
    if (other) {
      this.copyFrom(other);
      this._notes = other._notes.map((n) => ({ ...n, fields: new Map(n.fields) }));
      this._instrumentId = other._instrumentId;
      this._noteTemplate = other._noteTemplate;
      this._transposition = other._transposition;
      this._pixelSecond = other._pixelSecond;
      this._noteHeight = other._noteHeight;
    }
  }

  getNotes(): PianoNoteData[] { return [...this._notes]; }
  setNotes(notes: PianoNoteData[]): void { this._notes = [...notes]; }
  addNote(note: PianoNoteData): void { this._notes.push(note); }

  getInstrumentId(): string { return this._instrumentId; }
  setInstrumentId(id: string): void { this._instrumentId = id; }

  getNoteTemplate(): string { return this._noteTemplate; }
  setNoteTemplate(template: string): void { this._noteTemplate = template; }

  getTransposition(): number { return this._transposition; }
  setTransposition(t: number): void { this._transposition = t; }

  getPixelSecond(): number { return this._pixelSecond; }
  setPixelSecond(p: number): void { this._pixelSecond = p; }

  getNoteHeight(): number { return this._noteHeight; }
  setNoteHeight(h: number): void { this._noteHeight = h; }


  override generateForCSD(
    _context: TimeContext,
    _compileData: CompileData,
    _startTime: number,
    _endTime: number,
  ): NoteList {
    console.warn('PianoRoll.generateForCSD skipped: requires PianoNote/Scale/Field sub-systems');
    return new NoteList();
  }

  override saveAsXML(_objRefMap?: ObjRefSaveMap): Element {
    const elem = new Element('soundObject');
    elem.setAttribute('type', 'PianoRoll');
    elem.addElement('name').setText(this._name);
    elem.addElement('startTime').setText(this._startTime.getValue().toString());
    elem.addElement('subjectiveDuration').setText(this._subjectiveDuration.getValue().toString());
    elem.addElement('timeBehavior').setText(this._timeBehavior);
    elem.addElement('backgroundColor').setText(this._backgroundColor.toString());
    elem.addElement('instrumentId').setText(this._instrumentId);
    elem.addElement('noteTemplate').setText(this._noteTemplate);
    elem.addElement('transposition').setText(this._transposition.toString());
    elem.addElement('pixelSecond').setText(this._pixelSecond.toString());
    elem.addElement('noteHeight').setText(this._noteHeight.toString());

    const notesElem = elem.addElement('notes');
    for (const note of this._notes) {
      const nElem = notesElem.addElement('note');
      nElem.setAttribute('pitch', note.pitch.toString());
      nElem.setAttribute('start', note.start.toString());
      nElem.setAttribute('duration', note.duration.toString());
      nElem.setAttribute('velocity', note.velocity.toString());
    }

    return elem;
  }

  static loadFromXML(data: Element, _objRefMap?: ObjRefLoadMap): PianoRoll {
    const obj = new PianoRoll();
    obj.setName(data.getTextString('name') ?? 'PianoRoll');

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

    const instrId = data.getTextString('instrumentId');
    if (instrId !== null) obj._instrumentId = instrId;

    const template = data.getTextString('noteTemplate');
    if (template !== null) obj._noteTemplate = template;

    const trans = data.getTextString('transposition');
    if (trans) obj._transposition = parseInt(trans, 10);

    const px = data.getTextString('pixelSecond');
    if (px) obj._pixelSecond = parseInt(px, 10);

    const nh = data.getTextString('noteHeight');
    if (nh) obj._noteHeight = parseInt(nh, 10);

    const notesElem = data.getElement('notes');
    if (notesElem) {
      const nNodes = notesElem.getElements('note');
      while (nNodes.hasMoreElements()) {
        const nNode = nNodes.next();
        obj._notes.push({
          pitch: parseInt(nNode.getAttribute('pitch') ?? '60', 10),
          start: parseFloat(nNode.getAttribute('start') ?? '0'),
          duration: parseFloat(nNode.getAttribute('duration') ?? '1'),
          velocity: parseFloat(nNode.getAttribute('velocity') ?? '100'),
          fields: new Map(),
        });
      }
    }

    return obj;
  }

  override deepCopy(): SoundObject {
    return new PianoRoll(this);
  }
}
