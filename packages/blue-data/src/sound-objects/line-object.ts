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
import { initBasicFromXML, getBasicXML } from './sound-object-utilities';

export class LineObject extends AbstractSoundObject {
  private _lines: LineData[] = [];

  constructor(other?: LineObject) {
    super();
    this.setName('LineObject');
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
    const elem = getBasicXML(this, 'blue.soundObject.LineObject');
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
    initBasicFromXML(obj, data);

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
