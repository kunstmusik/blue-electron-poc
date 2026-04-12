/**
 * PatternObject — generates notes from pattern grids.
 * Mirrors the Java PatternObject class.
 *
 * Phase 11: Data preservation (load/save XML). Full pattern CSD generation
 * requires the Pattern sub-system.
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

export class PatternObject extends AbstractSoundObject {
  private _beats = 4;
  private _subDivisions = 4;
  private _patterns: boolean[][] = [];

  constructor(other?: PatternObject) {
    super();
    if (other) {
      this.copyFrom(other);
      this._beats = other._beats;
      this._subDivisions = other._subDivisions;
      this._patterns = other._patterns.map((p) => [...p]);
    }
  }

  getBeats(): number { return this._beats; }
  setBeats(b: number): void { this._beats = b; }

  getSubDivisions(): number { return this._subDivisions; }
  setSubDivisions(s: number): void { this._subDivisions = s; }

  getPatterns(): boolean[][] { return this._patterns.map((p) => [...p]); }
  addPattern(pattern: boolean[]): void { this._patterns.push(pattern); }


  override generateForCSD(
    _context: TimeContext,
    _compileData: CompileData,
    _startTime: number,
    _endTime: number,
  ): NoteList {
    console.warn('PatternObject.generateForCSD skipped: requires Pattern sub-system');
    return new NoteList();
  }

  override saveAsXML(_objRefMap?: ObjRefSaveMap): Element {
    const elem = new Element('soundObject');
    elem.setAttribute('type', 'PatternObject');
    elem.addElement('name').setText(this._name);
    elem.addElement('startTime').setText(this._startTime.getValue().toString());
    elem.addElement('subjectiveDuration').setText(this._subjectiveDuration.getValue().toString());
    elem.addElement('timeBehavior').setText(this._timeBehavior);
    elem.addElement('backgroundColor').setText(this._backgroundColor.toString());
    elem.addElement('beats').setText(this._beats.toString());
    elem.addElement('subDivisions').setText(this._subDivisions.toString());

    const patternsElem = elem.addElement('patterns');
    for (const pattern of this._patterns) {
      const pElem = patternsElem.addElement('pattern');
      pElem.setText(pattern.map((b) => b ? '1' : '0').join(''));
    }

    return elem;
  }

  static loadFromXML(data: Element, _objRefMap?: ObjRefLoadMap): PatternObject {
    const obj = new PatternObject();
    obj.setName(data.getTextString('name') ?? 'Pattern');

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

    const beats = data.getTextString('beats');
    if (beats) obj._beats = parseInt(beats, 10);

    const subDiv = data.getTextString('subDivisions');
    if (subDiv) obj._subDivisions = parseInt(subDiv, 10);

    const patternsNode = data.getElement('patterns');
    if (patternsNode) {
      const pNodes = patternsNode.getElements('pattern');
      while (pNodes.hasMoreElements()) {
        const pStr = pNodes.next().getTextString();
        obj._patterns.push(pStr.split('').map((c) => c === '1'));
      }
    }

    return obj;
  }

  override deepCopy(): SoundObject {
    return new PatternObject(this);
  }
}
