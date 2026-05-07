import { AbstractSoundObject } from './abstract-sound-object';
import { NoteList } from './note-list';
import { TimeContext } from '../time/time-context';
import { CompileData } from '../compile-data';
import { Element } from '../serialization/xml-reader';
import { ObjRefSaveMap, ObjRefLoadMap } from '../serialization/obj-ref-map';
import { SoundObject } from './sound-object';
import { initBasicFromXML, getBasicXML } from './sound-object-utilities';

export interface ZakLinePoint {
  x: number;
  y: number;
}

export interface ZakLineData {
  channel: number;
  color: number;
  points: ZakLinePoint[];
}

export class ZakLineObject extends AbstractSoundObject {
  private _zakSpace = 0;
  private _lines: ZakLineData[] = [];

  constructor(other?: ZakLineObject) {
    super();
    this.setName('ZakLineObject');
    if (other) {
      this.copyFrom(other);
      this._zakSpace = other._zakSpace;
      this._lines = other._lines.map((l) => ({
        ...l,
        points: [...l.points],
      }));
    }
  }

  getZakSpace(): number {
    return this._zakSpace;
  }
  setZakSpace(space: number): void {
    this._zakSpace = space;
  }

  getLines(): ZakLineData[] {
    return [...this._lines];
  }
  addLine(line: ZakLineData): void {
    this._lines.push(line);
  }

  override generateForCSD(
    _context: TimeContext,
    _compileData: CompileData,
    _startTime: number,
    _endTime: number,
  ): NoteList {
    console.warn(
      'ZakLineObject.generateForCSD skipped: requires Zak memory system',
    );
    return new NoteList();
  }

  override saveAsXML(_objRefMap?: ObjRefSaveMap): Element {
    const elem = getBasicXML(this, 'blue.soundObject.ZakLineObject');
    elem.addElement('zakSpace').setText(this._zakSpace.toString());
    for (const line of this._lines) {
      const lineElem = elem.addElement('zakline');
      lineElem.setAttribute('channel', line.channel.toString());
      lineElem.setAttribute('color', line.color.toString());
      lineElem
        .addElement('points')
        .setText(line.points.map((p) => `${p.x},${p.y}`).join(' '));
    }
    return elem;
  }

  static loadFromXML(data: Element, _objRefMap?: ObjRefLoadMap): ZakLineObject {
    const obj = new ZakLineObject();
    initBasicFromXML(obj, data);

    const zak = data.getTextString('zakSpace');
    if (zak) obj._zakSpace = parseInt(zak, 10);

    const lineNodes = data.getElements();
    while (lineNodes.hasMoreElements()) {
      const node = lineNodes.next();
      if (node.getName() === 'zakline') {
        const line: ZakLineData = {
          channel: parseInt(node.getAttribute('channel') ?? '1', 10),
          color: parseInt(node.getAttribute('color') ?? '0', 10),
          points: [],
        };
        const pointsStr = node.getTextString('points');
        if (pointsStr) {
          for (const pair of pointsStr.split(' ')) {
            const [x, y] = pair.split(',').map(Number);
            if (!isNaN(x) && !isNaN(y)) {
              line.points.push({ x, y });
            }
          }
        }
        obj._lines.push(line);
      }
    }

    return obj;
  }

  override deepCopy(): SoundObject {
    return new ZakLineObject(this);
  }
}
