/**
 * PianoRoll — generates notes from a piano roll grid.
 * Mirrors the Java PianoRoll class.
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
import { replaceAll } from '../utilities/text';
import { Scale } from './piano-roll/scale';
import { PianoNote } from './piano-roll/piano-note';
import { FieldDef } from './piano-roll/field-def';
import { initBasicFromXML } from './sound-object-utilities';
import { applyTimeBehavior, setScoreStart } from '../utilities/score';

const GENERATE_FREQUENCY = 0;
const GENERATE_PCH = 1;
const GENERATE_MIDI = 2;

export class PianoRoll extends AbstractSoundObject {
  private _scale = new Scale();
  private _notes: PianoNote[] = [];
  private _noteTemplate = 'i <INSTR_ID> <START> <DUR> <FREQ> <AMP>';
  private _instrumentId = '1';
  private _pchGenerationMethod = GENERATE_FREQUENCY;
  private _transposition = 0;
  private _fieldDefinitions: FieldDef[] = [];

  constructor(other?: PianoRoll) {
    super();
    if (other) {
      this.copyFrom(other);
      this._scale = new Scale(other._scale);
      this._notes = other._notes.map((n) => new PianoNote(n));
      this._noteTemplate = other._noteTemplate;
      this._instrumentId = other._instrumentId;
      this._pchGenerationMethod = other._pchGenerationMethod;
      this._transposition = other._transposition;
      this._fieldDefinitions = other._fieldDefinitions.map((fd) => {
        const clone = new FieldDef();
        clone.setFieldName(fd.getFieldName());
        clone.setFieldType(fd.getFieldType());
        clone.setMinValue(fd.getMinValue());
        clone.setMaxValue(fd.getMaxValue());
        clone.setDefaultValue(fd.getDefaultValue());
        return clone;
      });
    }
  }

  getScale(): Scale { return this._scale; }
  setScale(s: Scale): void { this._scale = s; }

  getNotes(): PianoNote[] { return [...this._notes]; }
  addNote(note: PianoNote): void { this._notes.push(note); }

  getNoteTemplate(): string { return this._noteTemplate; }
  setNoteTemplate(t: string): void { this._noteTemplate = t; }

  getInstrumentId(): string { return this._instrumentId; }
  setInstrumentId(id: string): void { this._instrumentId = id; }

  getPchGenerationMethod(): number { return this._pchGenerationMethod; }
  setPchGenerationMethod(m: number): void { this._pchGenerationMethod = m; }

  getTransposition(): number { return this._transposition; }
  setTransposition(t: number): void { this._transposition = t; }

  getFieldDefinitions(): FieldDef[] { return [...this._fieldDefinitions]; }
  addFieldDef(fd: FieldDef): void { this._fieldDefinitions.push(fd); }

  override getTimeBehavior(): TimeBehavior {
    return TimeBehavior.REPEAT;
  }

  override generateForCSD(
    context: TimeContext,
    compileData: CompileData,
    _startTime: number,
    _endTime: number,
  ): NoteList {
    // Generate a default oscillator instrument if this instrumentId isn't already defined
    const instrNum = this._instrumentId;
    const instrMarker = `__instr_${instrNum}__`;
    if (compileData.getCompilationVariable(instrMarker) === undefined) {
      compileData.setCompilationVariable(instrMarker, true);

      // Generate orchestra header once (first instrument only)
      if (compileData.getCompilationVariable('__orch_header__') === undefined) {
        compileData.setCompilationVariable('__orch_header__', true);
        compileData.appendGlobalOrc(`sr=44100
ksmps=64
nchnls=2
0dbfs=1

`);
      }

      // Generate a simple oscillator instrument for the given instrument number
      const orc = `instr ${instrNum}
  ifreq = p4
  iamp = p5
  aenv madsr 0.01, 0.1, 0.8, 0.1
  aout poscil aenv * iamp, ifreq
  outch 1, aout, 2, aout
endin
`;
      compileData.appendGlobalOrc(orc);
    }
    const nl = new NoteList();
    let instrId = this._instrumentId.trim();

    // Quote if not numeric
    if (isNaN(parseInt(instrId, 10))) {
      instrId = `"${instrId}"`;
    }

    for (const note of this._notes) {
      let freq = '';
      let octave = note.octave;
      let scaleDegree = note.scaleDegree + this._transposition;
      const numScaleDegrees = this._pchGenerationMethod === GENERATE_MIDI
        ? 12
        : this._scale.getNumScaleDegrees();

      // Normalize scale degree
      if (scaleDegree >= numScaleDegrees) {
        octave += Math.floor(scaleDegree / numScaleDegrees);
        scaleDegree = scaleDegree % numScaleDegrees;
      }
      if (scaleDegree < 0) {
        const octaveDiff = Math.floor((scaleDegree * -1) / numScaleDegrees) + 1;
        scaleDegree = scaleDegree % numScaleDegrees;
        octave -= octaveDiff;
        scaleDegree = numScaleDegrees + scaleDegree;
      }

      // Calculate frequency
      switch (this._pchGenerationMethod) {
        case GENERATE_FREQUENCY:
          freq = this._scale.getFrequency(octave, scaleDegree).toString();
          break;
        case GENERATE_PCH:
          freq = `${octave}.${scaleDegree}`;
          break;
        case GENERATE_MIDI:
          freq = ((octave * 12) + scaleDegree).toString();
          break;
      }

      let template = note.noteTemplate || this._noteTemplate;
      template = replaceAll(template, '<INSTR_ID>', instrId);
      template = replaceAll(template, '<INSTR_NAME>', this._instrumentId);
      template = replaceAll(template, '<START>', note.start.toString());
      template = replaceAll(template, '<DUR>', note.duration.toString());
      template = replaceAll(template, '<FREQ>', freq);

      // Substitute custom field values
      for (const field of note.getFields()) {
        const fieldDef = field.getFieldDef();
        const key = `<${fieldDef.getFieldName()}>`;
        const val = fieldDef.getFieldType() === 'DISCRETE'
          ? Math.round(field.getValue()).toString()
          : field.getValue().toString();
        template = replaceAll(template, key, val);
      }

      try {
        const parsed = Note.createNoteFromText(template);
        if (parsed) nl.push(parsed);
      } catch {
        console.warn(`[PianoRoll] Failed to parse note: ${template}`);
      }
    }

    nl.sortByStartTime();

    // Apply note processor chain
    const npc = this.getNoteProcessorChain();
    npc.apply(nl);

    // Apply time behavior and start time offset (mirrors Java PianoRoll.generateNotes)
    const duration = this._subjectiveDuration.toBeats(context);
    const rpBeats = this._repeatPoint ? this._repeatPoint.toBeats(context) : -1;
    applyTimeBehavior(nl, this._timeBehavior, duration, rpBeats);

    const startTime = this._startTime.toBeats(context);
    setScoreStart(nl, startTime);

    return nl;
  }

  override saveAsXML(_objRefMap?: ObjRefSaveMap): Element {
    const elem = new Element('soundObject');
    elem.setAttribute('type', 'PianoRoll');
    elem.addElement('name').setText(this._name);
    elem.addElement('startTime').setText(this._startTime.getValue().toString());
    elem.addElement('subjectiveDuration').setText(this._subjectiveDuration.getValue().toString());
    elem.addElement('timeBehavior').setText(this._timeBehavior);
    elem.addElement('backgroundColor').setText(this._backgroundColor.toString());
    elem.addElement('noteTemplate').setText(this._noteTemplate);
    elem.addElement('instrumentId').setText(this._instrumentId);
    elem.addElement('scale').setText('');
    elem.addElement(this._scale.saveAsXML().setName('scale'));
    elem.addElement('pchGenerationMethod').setText(this._pchGenerationMethod.toString());
    elem.addElement('transposition').setText(this._transposition.toString());

    for (const fd of this._fieldDefinitions) {
      elem.addElement(fd.saveAsXML().setName('fieldDef'));
    }
    for (const note of this._notes) {
      elem.addElement(note.saveAsXML().setName('pianoNote'));
    }
    return elem;
  }

  static loadFromXML(data: Element, _objRefMap?: ObjRefLoadMap): PianoRoll {
    const pr = new PianoRoll();
    pr._fieldDefinitions = [];
    pr._notes = [];

    initBasicFromXML(pr, data);

    const fieldTypes = new Map<string, FieldDef>();

    const nodes = data.getElements();
    while (nodes.hasMoreElements()) {
      const node = nodes.next();
      switch (node.getName()) {
        case 'noteTemplate':
          pr._noteTemplate = node.getTextString();
          break;
        case 'instrumentId':
          pr._instrumentId = node.getTextString();
          break;
        case 'scale':
          pr._scale = Scale.loadFromXML(node);
          break;
        case 'fieldDef': {
          const fd = FieldDef.loadFromXML(node);
          fieldTypes.set(fd.getFieldName(), fd);
          pr._fieldDefinitions.push(fd);
          break;
        }
        case 'pianoNote': {
          const pn = PianoNote.loadFromXML(node, fieldTypes);
          // Clear note template if it matches the default
          if (pn.getNoteTemplate() === pr._noteTemplate) {
            pn.setNoteTemplate(null);
          }
          pr._notes.push(pn);
          break;
        }
        case 'pchGenerationMethod':
          pr._pchGenerationMethod = parseInt(node.getTextString(), 10);
          break;
        case 'transposition':
          pr._transposition = parseInt(node.getTextString(), 10);
          break;
      }
    }

    return pr;
  }

  override deepCopy(): SoundObject {
    return new PianoRoll(this);
  }
}
