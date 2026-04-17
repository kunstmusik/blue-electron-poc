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
  private _label = '';
  private _minimum = 0;
  private _maximum = 1;
  private _curve: AutomationCurve = AutomationCurve.LINEAR;
  private _points: AutomationPoint[] = [];
  private _enabled = false;
  private _resolution = 0;
  private _resolutionScale = 1.0;
  private _highPrecision = false;
  private _compilationVarName: string | null = null;
  private _fixedValue = 0;

  getName(): string { return this._name; }
  setName(name: string): void { this._name = name; }

  getLabel(): string { return this._label; }
  setLabel(label: string): void { this._label = label; }

  getMinimum(): number { return this._minimum; }
  setMinimum(v: number): void { this._minimum = v; }

  getMaximum(): number { return this._maximum; }
  setMaximum(v: number): void { this._maximum = v; }

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

  /**
   * Set automation enabled state.
   */
  setAutomationEnabled(e: boolean): void { this._enabled = e; }

  getResolution(): number { return this._resolution; }
  setResolution(r: number): void { this._resolution = r; }

  getResolutionScale(): number { return this._resolutionScale; }
  setResolutionScale(s: number): void { this._resolutionScale = s; }

  isHighPrecision(): boolean { return this._highPrecision; }
  setHighPrecision(h: boolean): void { this._highPrecision = h; }

  /**
   * Compilation variable name (e.g., "gk_blue_auto0").
   * Set during CSD generation by assignParameterNames().
   */
  getCompilationVarName(): string | null { return this._compilationVarName; }
  setCompilationVarName(name: string): void { this._compilationVarName = name; }

  /**
   * Fixed value for non-automated parameters.
   */
  getFixedValue(): number { return this._fixedValue; }
  setFixedValue(v: number): void { this._fixedValue = v; }

  /**
   * Check if this parameter has automation enabled (has points).
   */
  isAutomationEnabled(): boolean {
    return this._enabled;
  }

  /**
   * Get the parameter's value at a specific time.
   * Returns the first point's value if no automation is enabled.
   */
  getValue(time: number): number {
    if (!this.isAutomationEnabled()) {
      return this._fixedValue;
    }

    // Find the value at the given time by interpolating between points
    if (this._points.length === 0) return this._fixedValue;
    if (this._points.length === 1) return this._points[0].value;

    // Before first point
    if (time <= this._points[0].time) return this._points[0].value;
    // After last point
    if (time >= this._points[this._points.length - 1].time) {
      return this._points[this._points.length - 1].value;
    }

    // Find surrounding points
    for (let i = 0; i < this._points.length - 1; i++) {
      const p1 = this._points[i];
      const p2 = this._points[i + 1];
      if (time >= p1.time && time <= p2.time) {
        const t = (time - p1.time) / (p2.time - p1.time);
        switch (this._curve) {
          case AutomationCurve.STEP:
            return p1.value;
          case AutomationCurve.LINEAR:
            return p1.value + (p2.value - p1.value) * t;
          case AutomationCurve.EXPONENTIAL:
            // Exponential interpolation (avoid log(0))
            const v1 = Math.max(p1.value, 0.0001);
            const v2 = Math.max(p2.value, 0.0001);
            return v1 * Math.pow(v2 / v1, t);
        }
      }
    }

    return this._fixedValue;
  }

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
    param._label = data.getAttribute('label') ?? '';

    const curve = data.getAttribute('curve');
    if (curve && Object.values(AutomationCurve).includes(curve as AutomationCurve)) {
      param._curve = curve as AutomationCurve;
    }

    const min = data.getAttribute('min');
    if (min) param._minimum = parseFloat(min);

    const max = data.getAttribute('max');
    if (max) param._maximum = parseFloat(max);

    const legacyRes = data.getAttribute('resolution');
    if (legacyRes) param._resolution = parseFloat(legacyRes);

    const bdResolution = data.getAttribute('bdresolution');
    if (bdResolution) param._resolution = parseFloat(bdResolution);

    const automationEnabled = data.getAttribute('automationEnabled');
    if (automationEnabled !== null) {
      param._enabled = automationEnabled === 'true';
    } else {
      param._enabled = data.getAttribute('enabled') === 'true';
    }

    const fixedValue = data.getAttribute('value');
    if (fixedValue !== null) {
      param._fixedValue = parseFloat(fixedValue);
    }

    const res = data.getTextString('resolution');
    if (res) param._resolution = parseFloat(res);

    const scale = data.getTextString('resolutionScale');
    if (scale) param._resolutionScale = parseFloat(scale);

    const hp = data.getTextString('highPrecision');
    if (hp) param._highPrecision = hp.toLowerCase() === 'true';

    const lineNode = data.getElement('line');
    if (lineNode) {
      const lineResolution = lineNode.getAttribute('bdresolution')
        ?? lineNode.getAttribute('resolution');
      if (lineResolution && param._resolution === 0) {
        param._resolution = parseFloat(lineResolution);
      }

      const curveType = lineNode.getAttribute('curveType');
      if (curveType === 'CONSTANT') {
        param._curve = AutomationCurve.STEP;
      } else if (curveType === 'LINEAR') {
        param._curve = AutomationCurve.LINEAR;
      } else if (curveType === 'EXPONENTIAL') {
        param._curve = AutomationCurve.EXPONENTIAL;
      }

      const linePoints = lineNode.getElements('linePoint');
      while (linePoints.hasMoreElements()) {
        const pt = linePoints.next();
        param._points.push({
          time: parseFloat(pt.getAttribute('x') ?? '0'),
          value: parseFloat(pt.getAttribute('y') ?? '0'),
        });
      }
    }

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

    param._points.sort((a, b) => a.time - b.time);

    if (fixedValue === null && param._points.length > 0) {
      param._fixedValue = param._points[0].value;
    }

    return param;
  }

  deepCopy(): BlueDataObject {
    const copy = new Parameter();
    copy._name = this._name;
    copy._label = this._label;
    copy._minimum = this._minimum;
    copy._maximum = this._maximum;
    copy._curve = this._curve;
    copy._points = [...this._points];
    copy._enabled = this._enabled;
    copy._resolution = this._resolution;
    copy._resolutionScale = this._resolutionScale;
    copy._highPrecision = this._highPrecision;
    copy._compilationVarName = this._compilationVarName;
    copy._fixedValue = this._fixedValue;
    return copy;
  }
}
