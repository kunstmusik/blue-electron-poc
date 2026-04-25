/**
 * BSBLineObject — line/drawing element.
 * Does not contribute replacement values — visual only.
 */
import { Element } from '../../serialization/xml-reader';
import { BSBWidget } from './bsb-widget';
import { BSBCompilationUnit } from './bsb-compilation-unit';
import { formatBlueNumber } from '../../utilities/number-format';

export type SeparatorType = 'None' | 'Comma' | 'Single Quote';

export interface LinePoint {
  x: number;
  y: number;
}

export interface Line {
  varName: string;
  min: number;
  max: number;
  color: string;
  points: LinePoint[];
}

export class BSBLineObject extends BSBWidget {
  canvasWidth = 200;
  canvasHeight = 160;
  xMax = 1.0;
  relativeXValues = true;
  leadingZero = true;
  separatorType: SeparatorType = 'None';
  locked = false;
  lines: Line[] = [];

  override collectReplacements(unit: BSBCompilationUnit): void {
    for (const line of this.lines) {
      const key = `${this.objectName}_${line.varName}`;
      unit.addReplacementValue(key, this.getLineString(line));
    }
  }

  private getLineString(line: Line): string {
    if (line.points.length === 0) return '';

    const xVals = line.points.map(p => p.x * this.xMax);
    const yVals = line.points.map(p => p.y);

    if (this.relativeXValues) {
      for (let i = xVals.length - 1; i > 0; i--) {
        xVals[i] = xVals[i] - xVals[i - 1];
      }
    }

    const spacer = this.getSeparatorString();
    let buf = '';

    if (this.leadingZero) {
      buf += '0.0' + spacer;
    }

    buf += yVals[0];
    for (let i = 1; i < xVals.length; i++) {
      buf += spacer + formatBlueNumber(xVals[i]);
      buf += spacer + formatBlueNumber(yVals[i]);
    }

    return buf;
  }

  private getSeparatorString(): string {
    switch (this.separatorType) {
      case 'Comma': return ', ';
      case 'Single Quote': return "' ";
      default: return ' ';
    }
  }

  loadFromXML(data: Element): void {
    this.loadFromXMLCommon(data);
    const cw = data.getTextString('canvasWidth');
    if (cw) this.canvasWidth = parseInt(cw, 10);
    const ch = data.getTextString('canvasHeight');
    if (ch) this.canvasHeight = parseInt(ch, 10);
    const xm = data.getTextString('xMax');
    if (xm) this.xMax = parseFloat(xm);
    const rxv = data.getElement('relativeXValues');
    if (rxv) this.relativeXValues = rxv.getTextString() === 'true';
    const lz = data.getElement('leadingZero');
    if (lz) this.leadingZero = lz.getTextString() === 'true';
    const lk = data.getElement('locked');
    if (lk) this.locked = lk.getTextString() === 'true';
    const st = data.getTextString('separatorType');
    if (st) this.separatorType = st as SeparatorType;
    const cs = data.getElement('commaSeparated');
    if (cs && cs.getTextString() === 'true') this.separatorType = 'Comma';
    const linesElem = data.getElement('lines');
    if (linesElem) {
      const lineElems = linesElem.getElements('line');
      while (lineElems.hasMoreElements()) {
        const lineElem = lineElems.next();
        const line: Line = {
          varName: lineElem.getAttribute('varName') ?? `line${this.lines.length}`,
          min: parseFloat(lineElem.getAttribute('min') ?? '0'),
          max: parseFloat(lineElem.getAttribute('max') ?? '1'),
          color: lineElem.getAttribute('color') ?? '#000000',
          points: [],
        };
        const ptElems = lineElem.getElements('linePoint');
        while (ptElems.hasMoreElements()) {
          const ptElem = ptElems.next();
          line.points.push({
            x: parseFloat(ptElem.getAttribute('x') ?? '0'),
            y: parseFloat(ptElem.getAttribute('y') ?? '0'),
          });
        }
        this.lines.push(line);
      }
    }
  }
}
