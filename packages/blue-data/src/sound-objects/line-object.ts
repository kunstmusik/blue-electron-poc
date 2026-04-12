/**
 * LineObject — generates notes from user-drawn lines.
 * Mirrors the Java LineObject class.
 *
 * Phase 11: Data preservation (load/save XML). Full line rendering
 * and CSD generation requires the Line component system.
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

export class LineObject extends AbstractSoundObject {
  private _lines: LineData[] = [];

  constructor(other?: LineObject) {
    super();
    if (other) {
      this.copyFrom(other);
      this._lines = other._lines.map((l) => ({ ...l }));
    }
  }

  getLines(): LineData[] { return [...this._lines]; }
  addLine(line: LineData): void { this._lines.push(line); }


  override generateForCSD(
    _context: TimeContext,
    _compileData: CompileData,
    _startTime: number,
    _endTime: number,
  ): NoteList {
    // Full line-based CSD generation requires Line component system
    console.warn('LineObject.generateForCSD skipped: requires Line component system');
    return new NoteList();
  }

  override saveAsXML(_objRefMap?: ObjRefSaveMap): Element {
    const elem = new Element('soundObject');
    elem.setAttribute('type', 'LineObject');
    elem.addElement('name').setText(this._name);
    elem.addElement('startTime').setText(this._startTime.getValue().toString());
    elem.addElement('subjectiveDuration').setText(this._subjectiveDuration.getValue().toString());
    elem.addElement('timeBehavior').setText(this._timeBehavior);
    elem.addElement('backgroundColor').setText(this._backgroundColor.toString());
    for (const line of this._lines) {
      const lineElem = elem.addElement('line');
      lineElem.setAttribute('varName', line.varName);
      lineElem.setAttribute('color', line.color.toString());
      lineElem.addElement('points').setText(line.points.map((p) => `${p.x},${p.y}`).join(' '));
    }
    return elem;
  }

  static loadFromXML(data: Element, _objRefMap?: ObjRefLoadMap): LineObject {
    const obj = new LineObject();
    obj.setName(data.getTextString('name') ?? 'LineObject');

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

    const lineNodes = data.getElements('line');
    let counter = 0;
    while (lineNodes.hasMoreElements()) {
      const node = lineNodes.next();
      const line: LineData = {
        varName: node.getAttribute('varName') ?? `line${counter}`,
        color: parseInt(node.getAttribute('color') ?? '0', 10),
        points: [],
      };
      const pointsStr = node.getTextString('points');
      if (pointsStr) {
        for (const pair of pointsStr.split(' ')) {
          const [x, y] = pair.split(',').map(Number);
          line.points.push({ x, y });
        }
      }
      obj._lines.push(line);
      counter++;
    }

    return obj;
  }

  override deepCopy(): SoundObject {
    return new LineObject(this);
  }
}

export interface LinePoint {
  x: number;
  y: number;
}

export interface LineData {
  varName: string;
  color: number;
  points: LinePoint[];
}
