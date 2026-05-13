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
  resolution?: string;
  rightBound?: boolean;
  endPointsLinked?: boolean;
  points: LinePoint[];
}

function colorIntToCss(color: number): string {
  const rgb = (color >>> 0) & 0x00ffffff;
  return `#${rgb.toString(16).padStart(6, '0')}`;
}

function cssColorToJavaInt(color: string): string {
  const normalized = color.trim();
  if (/^-?\d+$/.test(normalized)) return normalized;
  if (/^#[0-9a-fA-F]{6}$/.test(normalized)) {
    const rgb = parseInt(normalized.substring(1), 16);
    const argbUnsigned = (0xff000000 | rgb) >>> 0;
    return (argbUnsigned > 0x7fffffff ? argbUnsigned - 0x100000000 : argbUnsigned).toString();
  }
  return '-8355712';
}

export function normalizeBsbLineColor(color: string | number | undefined): string {
  if (typeof color === 'number' && Number.isFinite(color)) {
    return colorIntToCss(color);
  }
  if (typeof color !== 'string') {
    return '#808080';
  }
  const trimmed = color.trim();
  if (/^-?\d+$/.test(trimmed)) {
    return colorIntToCss(parseInt(trimmed, 10));
  }
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed;
  }
  return '#808080';
}

export function parseBsbLineFromXml(lineElem: Element, fallbackName: string): Line {
  const xmlName = lineElem.getAttribute('name')?.trim() ?? '';
  const xmlVarName = lineElem.getAttribute('varName')?.trim() ?? '';
  const varName = xmlName || xmlVarName || fallbackName;
  const min = parseFloat(lineElem.getAttribute('min') ?? '0');
  const max = parseFloat(lineElem.getAttribute('max') ?? '1');
  const resolution = lineElem.getAttribute('bdresolution') ?? lineElem.getAttribute('resolution') ?? '-1';
  const rightBound = (lineElem.getAttribute('rightBound') ?? 'false') === 'true';
  const endPointsLinked = (lineElem.getAttribute('endPointsLinked') ?? 'false') === 'true';
  const color = normalizeBsbLineColor(lineElem.getAttribute('color') ?? '#808080');
  const points: LinePoint[] = [];

  const pointElems = lineElem.getElements('linePoint');
  while (pointElems.hasMoreElements()) {
    const pointElem = pointElems.next();
    points.push({
      x: parseFloat(pointElem.getAttribute('x') ?? '0'),
      y: parseFloat(pointElem.getAttribute('y') ?? '0'),
    });
  }

  if (points.length === 0) {
    const legacyPoints = lineElem.getTextString('points');
    if (legacyPoints) {
      for (const pointStr of legacyPoints.trim().split(/\s+/)) {
        const [xRaw, yRaw] = pointStr.split(',');
        const x = parseFloat(xRaw ?? '');
        const y = parseFloat(yRaw ?? '');
        if (Number.isFinite(x) && Number.isFinite(y)) {
          points.push({ x, y });
        }
      }
    }
  }

  if (points.length === 0) {
    points.push(
      { x: 0, y: (min + max) * 0.5 },
      { x: 1, y: (min + max) * 0.5 },
    );
  }

  return {
    varName,
    min,
    max,
    color,
    resolution,
    rightBound,
    endPointsLinked,
    points,
  };
}

export function writeBsbLineToXml(linesElem: Element, line: Line): void {
  const lineElem = linesElem.addElement('line');
  lineElem.setAttribute('name', line.varName);
  lineElem.setAttribute('varName', line.varName);
  lineElem.setAttribute('version', '2');
  lineElem.setAttribute('max', String(line.max));
  lineElem.setAttribute('min', String(line.min));
  lineElem.setAttribute('bdresolution', line.resolution ?? '-1');
  lineElem.setAttribute('color', cssColorToJavaInt(line.color));
  lineElem.setAttribute('rightBound', String(line.rightBound ?? false));
  lineElem.setAttribute('endPointsLinked', String(line.endPointsLinked ?? false));

  for (const point of line.points) {
    const pointElem = lineElem.addElement('linePoint');
    pointElem.setAttribute('x', String(point.x));
    pointElem.setAttribute('y', String(point.y));
  }
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

  override getPresetValue(): string {
    const encodedLines = this.lines.map((line) => {
      const parts = [line.varName];
      for (const point of line.points) {
        parts.push(String(point.x), String(point.y));
      }
      return parts.join(':');
    });

    return ['version=2', ...encodedLines].join('@_@');
  }

  override setPresetValue(val: string): void {
    const parts = val.split('@_@');

    let version = 1;
    let startIndex = 0;
    if (parts[0]?.startsWith('version=')) {
      version = parseInt(parts[0].substring(8), 10) || 1;
      startIndex = 1;
    }

    for (let index = startIndex; index < parts.length; index++) {
      const lineStr = parts[index];
      const values = lineStr.split(':');
      const lineName = values[0];
      const line = this.lines.find((candidate) => candidate.varName === lineName);
      if (!line) continue;

      line.points = [];
      const range = line.max - line.min;

      for (let valueIndex = 1; valueIndex < values.length; valueIndex += 2) {
        const nextX = parseFloat(values[valueIndex]);
        const nextY = parseFloat(values[valueIndex + 1]);
        if (!Number.isFinite(nextX) || !Number.isFinite(nextY)) continue;

        line.points.push({
          x: nextX,
          y: version === 1 ? (nextY * range) + line.min : nextY,
        });
      }
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
    if (st === 'NONE' || st === 'None') this.separatorType = 'None';
    if (st === 'COMMA' || st === 'Comma') this.separatorType = 'Comma';
    if (st === 'SINGLE_QUOTE' || st === 'Single Quote') this.separatorType = 'Single Quote';
    const cs = data.getElement('commaSeparated');
    if (cs && cs.getTextString() === 'true') this.separatorType = 'Comma';
    this.lines = [];
    const linesElem = data.getElement('lines');
    if (linesElem) {
      const lineElems = linesElem.getElements('line');
      while (lineElems.hasMoreElements()) {
        const lineElem = lineElems.next();
        this.lines.push(parseBsbLineFromXml(lineElem, ''));
      }
    }
  }
}
