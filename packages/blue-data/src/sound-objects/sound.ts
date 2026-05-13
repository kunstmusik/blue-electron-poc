/**
 * Sound — a SoundObject with a BlueSynthBuilder (BSB) instrument.
 * Mirrors the Java Sound class.
 *
 * Phase 11: Data preservation (load/save XML). BSB CSD generation
 * requires the full BSB system (Phase 11 BSB sub-task).
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
import { initBasicFromXML, getBasicXML } from './sound-object-utilities';
import { BlueSynthBuilder } from '../instruments/blue-synth-builder';

export class Sound extends AbstractSoundObject {
  private _comment = '';
  private _bsbInstrumentText = '';

  constructor(other?: Sound) {
    super();
    this.setName('Sound');
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
    context: TimeContext,
    compileData: CompileData,
    startTime: number,
    endTime: number,
  ): NoteList {
    const bsb = this.loadBlueSynthBuilder();
    if (!bsb) {
      return new NoteList();
    }

    // Java parity: clear compilation variable names for score Sound objects
    // so widget values resolve directly (not gk automation vars from arrangement scope).
    const soundStart = this._startTime.toBeats(context);
    const soundDuration = this._subjectiveDuration.toBeats(context);
    for (const parameter of bsb.getParameters()) {
      parameter.setCompilationVarName('');
      parameter.setPoints(
        parameter.getPoints().map((point) => ({
          time: soundStart + (point.time * soundDuration),
          value: point.value,
        })),
      );
    }

    const instrumentNumber = compileData.addInstrument(bsb);
    return this.generateNotes(context, instrumentNumber, startTime, endTime);
  }

  private generateNotes(
    context: TimeContext,
    instrumentNumber: number,
    renderStart: number,
    renderEnd: number,
  ): NoteList {
    const notes = new NoteList();

    const subjectiveDuration = this._subjectiveDuration.toBeats(context);
    let noteDuration = subjectiveDuration;
    if (renderEnd > 0 && renderEnd < subjectiveDuration) {
      noteDuration = renderEnd;
    }
    noteDuration -= renderStart;

    if (!Number.isFinite(noteDuration) || noteDuration <= 0) {
      return notes;
    }

    const note = new Note();
    note.setPField(String(instrumentNumber), 1);
    note.setStartTime(this._startTime.toBeats(context) + renderStart);
    note.setSubjectiveDuration(noteDuration);
    notes.add(note);

    return notes;
  }

  private loadBlueSynthBuilder(): BlueSynthBuilder | null {
    const bsbXml = this._bsbInstrumentText.trim();
    if (!bsbXml) {
      return new BlueSynthBuilder();
    }

    try {
      const root = Element.parse(bsbXml);
      if (root.getName() === 'instrument') {
        return BlueSynthBuilder.loadFromXML(root);
      }
      const nestedInstrument = root.getElement('instrument');
      if (nestedInstrument) {
        return BlueSynthBuilder.loadFromXML(nestedInstrument);
      }
    } catch {
      // Fall through to legacy plain-text migration behavior.
    }

    const legacy = new BlueSynthBuilder();
    legacy.setInstrumentText(this._bsbInstrumentText);
    return legacy;
  }

  override saveAsXML(_objRefMap?: ObjRefSaveMap): Element {
    const elem = getBasicXML(this, 'blue.soundObject.Sound');
    if (this._bsbInstrumentText.trim().length > 0) {
      try {
        const instrElem = Element.parse(this._bsbInstrumentText);
        elem.addElement(instrElem);
      } catch {
        elem.addElement('instrumentText').setText(this._bsbInstrumentText);
      }
    } else {
      elem.addElement(new BlueSynthBuilder().saveAsXML());
    }
    elem.addElement('comment').setText(this._comment);
    return elem;
  }

  static loadFromXML(data: Element, _objRefMap?: ObjRefLoadMap): Sound {
    const obj = new Sound();
    initBasicFromXML(obj, data);

    const instrElem = data.getElement('instrument');
    if (instrElem !== null) {
      obj._bsbInstrumentText = instrElem.toXml();
    } else {
      const instrText = data.getTextString('instrumentText');
      if (instrText !== null) {
        const migratedInstrument = new BlueSynthBuilder();
        migratedInstrument.setInstrumentText(instrText);
        obj._bsbInstrumentText = migratedInstrument.saveAsXML().toXml();
      }
    }

    const comment = data.getTextString('comment');
    if (comment !== null) obj._comment = comment;

    return obj;
  }

  override deepCopy(): SoundObject {
    return new Sound(this);
  }
}
