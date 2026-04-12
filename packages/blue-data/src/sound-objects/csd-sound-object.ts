/**
 * CSDSoundObject — a SoundObject containing an embedded CSD file.
 * Mirrors the Java CSDSoundObject class.
 *
 * Phase 8: Data preservation (load/save XML). CSD generation extracts
 * orchestra/score sections from the embedded CSD.
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

export class CSDSoundObject extends AbstractSoundObject {
  private _csdText = '';

  getCsdText(): string { return this._csdText; }
  setCsdText(text: string): void { this._csdText = text; }

  override generateForCSD(
    _context: TimeContext,
    _compileData: CompileData,
    _startTime: number,
    _endTime: number,
  ): NoteList {
    // For Phase 8: return empty. Full CSD extraction in Phase 9.
    return new NoteList();
  }

  override saveAsXML(_objRefMap?: ObjRefSaveMap): Element {
    const elem = new Element('soundObject');
    elem.setAttribute('type', 'CSDSoundObject');
    elem.addElement('name').setText(this._name);
    elem.addElement('startTime').setText(this._startTime.getValue().toString());
    elem.addElement('subjectiveDuration').setText(this._subjectiveDuration.getValue().toString());
    elem.addElement('timeBehavior').setText(this._timeBehavior);
    elem.addElement('backgroundColor').setText(this._backgroundColor.toString());
    elem.addElement('csdText').setText(this._csdText);
    return elem;
  }

  static loadFromXML(data: Element, _objRefMap?: ObjRefLoadMap): CSDSoundObject {
    const obj = new CSDSoundObject();
    obj.setName(data.getTextString('name') ?? 'CSDSoundObject');
    const dur = data.getTextString('subjectiveDuration');
    if (dur) obj.setSubjectiveDuration(TimeDuration.beats(parseFloat(dur)));
    const tb = data.getTextString('timeBehavior');
    if (tb) obj.setTimeBehavior(tb as TimeBehavior);
    const color = data.getTextString('backgroundColor');
    if (color) obj.setBackgroundColor(parseInt(color, 10));
    const csd = data.getTextString('csdText');
    if (csd !== null) obj.setCsdText(csd);
    return obj;
  }

  override deepCopy(): SoundObject {
    const copy = new CSDSoundObject();
    copy.copyFrom(this);
    copy._csdText = this._csdText;
    return copy;
  }
}
