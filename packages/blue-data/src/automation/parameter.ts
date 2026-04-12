/**
 * Parameter — an automation parameter with points and curve type.
 * Mirrors the Java Parameter class.
 */
import { Element } from '../serialization/xml-reader';
import { BlueDataObject } from '../blue-data-object';

export interface AutomationPoint {
  time: number;
  value: number;
}

export enum AutomationCurve {
  STEP = 'STEP',
  LINEAR = 'LINEAR',
  EXPONENTIAL = 'EXPONENTIAL',
}

export class Parameter implements BlueDataObject {
  private _name = '';
  private _curve: AutomationCurve = AutomationCurve.LINEAR;
  private _points: AutomationPoint[] = [];
  private _enabled = true;
  private _resolution = 0;
  private _resolutionScale = 1.0;
  private _highPrecision = false;

  getName(): string { return this._name; }
  setName(name: string): void { this._name = name; }

  getCurve(): AutomationCurve { return this._curve; }
  setCurve(c: AutomationCurve): void { this._curve = c; }

  getPoints(): AutomationPoint[] { return [...this._points]; }
  setPoints(points: AutomationPoint[]): void { this._points = [...points]; }

  addPoint(time: number, value: number): void {
    this._points.push({ time, value });
    this._points.sort((a, b) => a.time - b.time);
  }

  isEnabled(): boolean { return this._enabled; }
  setEnabled(e: boolean): void { this._enabled = e; }

  getResolution(): number { return this._resolution; }
  setResolution(r: number): void { this._resolution = r; }

  getResolutionScale(): number { return this._resolutionScale; }
  setResolutionScale(s: number): void { this._resolutionScale = s; }

  isHighPrecision(): boolean { return this._highPrecision; }
  setHighPrecision(h: boolean): void { this._highPrecision = h; }

  saveAsXML(): Element {
    const elem = new Element('parameter');
    elem.setAttribute('name', this._name);
    elem.setAttribute('curve', this._curve);
    elem.setAttribute('enabled', this._enabled.toString());
    elem.addElement('resolution').setText(this._resolution.toString());
    elem.addElement('resolutionScale').setText(this._resolutionScale.toString());
    elem.addElement('highPrecision').setText(this._highPrecision.toString());

    const pointsElem = elem.addElement('points');
    for (const pt of this._points) {
      const ptElem = pointsElem.addElement('point');
      ptElem.setAttribute('time', pt.time.toString());
      ptElem.setAttribute('value', pt.value.toString());
    }

    return elem;
  }

  static loadFromXML(data: Element): Parameter {
    const param = new Parameter();
    param._name = data.getAttribute('name') ?? '';
    const curve = data.getAttribute('curve');
    if (curve && Object.values(AutomationCurve).includes(curve as AutomationCurve)) {
      param._curve = curve as AutomationCurve;
    }
    param._enabled = data.getAttribute('enabled') !== 'false';

    const res = data.getTextString('resolution');
    if (res) param._resolution = parseFloat(res);

    const scale = data.getTextString('resolutionScale');
    if (scale) param._resolutionScale = parseFloat(scale);

    const hp = data.getTextString('highPrecision');
    if (hp) param._highPrecision = hp.toLowerCase() === 'true';

    const pointsNode = data.getElement('points');
    if (pointsNode) {
      const pts = pointsNode.getElements('point');
      while (pts.hasMoreElements()) {
        const pt = pts.next();
        param._points.push({
          time: parseFloat(pt.getAttribute('time') ?? '0'),
          value: parseFloat(pt.getAttribute('value') ?? '0'),
        });
      }
    }

    return param;
  }

  deepCopy(): BlueDataObject {
    const copy = new Parameter();
    copy._name = this._name;
    copy._curve = this._curve;
    copy._points = [...this._points];
    copy._enabled = this._enabled;
    copy._resolution = this._resolution;
    copy._resolutionScale = this._resolutionScale;
    copy._highPrecision = this._highPrecision;
    return copy;
  }
}
