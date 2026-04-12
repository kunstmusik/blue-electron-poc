/**
 * ParameterTimeManager — manages parameter automation over time.
 * Mirrors the Java ParameterTimeManager class.
 */
import { Parameter } from './parameter';

export class ParameterTimeManager {
  private _parameters: Parameter[] = [];

  getParameters(): Parameter[] {
    return [...this._parameters];
  }

  addParameter(param: Parameter): void {
    this._parameters.push(param);
  }

  removeParameter(param: Parameter): void {
    const idx = this._parameters.indexOf(param);
    if (idx !== -1) this._parameters.splice(idx, 1);
  }

  /**
   * Get the automated value at a given time.
   * Interpolates between automation points based on curve type.
   */
  getValueAtTime(param: Parameter, time: number): number {
    const points = param.getPoints();
    if (points.length === 0) return 0;
    if (points.length === 1) return points[0].value;
    if (time <= points[0].time) return points[0].value;
    if (time >= points[points.length - 1].time) return points[points.length - 1].value;

    // Find surrounding points
    let i = 0;
    while (i < points.length - 1 && points[i + 1].time < time) i++;

    const p0 = points[i];
    const p1 = points[i + 1];
    const t = (time - p0.time) / (p1.time - p0.time);

    switch (param.getCurve()) {
      case 'STEP':
        return p0.value;
      case 'LINEAR':
        return p0.value + t * (p1.value - p0.value);
      case 'EXPONENTIAL': {
        const v0 = p0.value || 0.0001;
        const v1 = p1.value || 0.0001;
        return v0 * Math.pow(v1 / v0, t);
      }
      default:
        return p0.value + t * (p1.value - p0.value);
    }
  }
}
