/**
 * PythonObject — a SoundObject that generates notes via Jython/Python code.
 * Mirrors the Java PythonObject class.
 *
 * Phase 8: Data preservation only (load/save XML).
 * CSD generation is skipped in browser; Java subprocess in Node.js.
 */
import { AbstractSoundObject } from './abstract-sound-object';
import { NoteList } from './note-list';
import { TimeContext } from '../time/time-context';
import { CompileData } from '../compile-data';
import { Element } from '../serialization/xml-reader';
import { ObjRefSaveMap, ObjRefLoadMap } from '../serialization/obj-ref-map';
import { SoundObject } from './sound-object';
import { initBasicFromXML, getBasicXML } from './sound-object-utilities';

export class PythonObject extends AbstractSoundObject {
  private _pythonCode = '';
  private _onLoadProcessable = false;

  constructor() {
    super();
    this.setName('PythonObject');
    this._pythonCode = 'score = "i1 0 2 3 4 5"';
    this._backgroundColor = 0x404040;
  }

  getPythonCode(): string { return this._pythonCode; }
  setPythonCode(code: string): void { this._pythonCode = code; }

  isOnLoadProcessable(): boolean { return this._onLoadProcessable; }
  setOnLoadProcessable(val: boolean): void { this._onLoadProcessable = val; }

  override generateForCSD(
    _context: TimeContext,
    _compileData: CompileData,
    _startTime: number,
    _endTime: number,
  ): NoteList {
    // JVM-dependent — skip in pure TS environment.
    // In Node.js, a Java subprocess would be used (Phase 8+).
    console.warn('PythonObject.generateForCSD skipped: requires Java subprocess');
    return new NoteList();
  }

  // ─── XML ───

  override saveAsXML(_objRefMap?: ObjRefSaveMap): Element {
    const elem = getBasicXML(this, 'blue.soundObject.PythonObject');
    elem.addElement('pythonCode').setText(this._pythonCode);
    elem.setAttribute('onLoadProcessable', this._onLoadProcessable.toString());
    return elem;
  }

  static loadFromXML(data: Element, _objRefMap?: ObjRefLoadMap): PythonObject {
    const obj = new PythonObject();
    initBasicFromXML(obj, data);

    const code = data.getTextString('pythonCode');
    if (code !== null) obj.setPythonCode(code);

    const olp = data.getAttribute('onLoadProcessable');
    if (olp) obj.setOnLoadProcessable(olp.toLowerCase() === 'true');

    return obj;
  }

  override deepCopy(): SoundObject {
    const copy = new PythonObject();
    copy.copyFrom(this);
    copy._pythonCode = this._pythonCode;
    copy._onLoadProcessable = this._onLoadProcessable;
    return copy;
  }
}
