/**
 * External — a SoundObject that generates notes by executing an external command.
 * Mirrors the Java External class.
 *
 * Phase 11: Data preservation (load/save XML). Score generation requires
 * executing an external command (e.g., Python script), which is deferred.
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

export class External extends AbstractSoundObject {
  private _commandLine = '';
  private _text = '';
  private _syntaxType = 'Python';

  constructor(other?: External) {
    super();
    if (other) {
      this.copyFrom(other);
      this._commandLine = other._commandLine;
      this._text = other._text;
      this._syntaxType = other._syntaxType;
    }
  }

  getCommandLine(): string { return this._commandLine; }
  setCommandLine(cmd: string): void { this._commandLine = cmd; }

  getText(): string { return this._text; }
  setText(text: string): void { this._text = text; }

  getSyntaxType(): string { return this._syntaxType; }
  setSyntaxType(type: string): void { this._syntaxType = type; }


  override generateForCSD(
    _context: TimeContext,
    _compileData: CompileData,
    _startTime: number,
    _endTime: number,
  ): NoteList {
    // External score generation requires executing a command — deferred
    console.warn('External.generateForCSD skipped: requires external command execution');
    return new NoteList();
  }

  override saveAsXML(_objRefMap?: ObjRefSaveMap): Element {
    const elem = new Element('soundObject');
    elem.setAttribute('type', 'External');
    elem.addElement('name').setText(this._name);
    elem.addElement('startTime').setText(this._startTime.getValue().toString());
    elem.addElement('subjectiveDuration').setText(this._subjectiveDuration.getValue().toString());
    elem.addElement('timeBehavior').setText(this._timeBehavior);
    elem.addElement('backgroundColor').setText(this._backgroundColor.toString());
    elem.addElement('text').setText(this._text);
    elem.addElement('commandLine').setText(this._commandLine);
    elem.addElement('syntaxType').setText(this._syntaxType);
    return elem;
  }

  static loadFromXML(data: Element, _objRefMap?: ObjRefLoadMap): External {
    const obj = new External();
    obj.setName(data.getTextString('name') ?? 'External');

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

    const text = data.getTextString('text');
    if (text !== null) obj._text = text;

    const cmd = data.getTextString('commandLine');
    if (cmd !== null) obj._commandLine = cmd;

    const syntax = data.getTextString('syntaxType');
    if (syntax !== null) obj._syntaxType = syntax;

    return obj;
  }

  override deepCopy(): SoundObject {
    return new External(this);
  }
}
