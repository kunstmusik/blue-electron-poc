/**
 * Effect — a single mixer effect (reverb, delay, etc.).
 * Mirrors the Java Effect class.
 */
import { Element } from '../serialization/xml-reader';
import { BlueDataObject } from '../blue-data-object';

export class Effect implements BlueDataObject {
  private _type = '';
  private _enabled = true;
  private _parameters = new Map<string, number>();

  getType(): string { return this._type; }
  setType(type: string): void { this._type = type; }

  isEnabled(): boolean { return this._enabled; }
  setEnabled(enabled: boolean): void { this._enabled = enabled; }

  getParameter(name: string): number { return this._parameters.get(name) ?? 0; }
  setParameter(name: string, value: number): void { this._parameters.set(name, value); }

  saveAsXML(): Element {
    const elem = new Element('effect');
    elem.setAttribute('type', this._type);
    elem.setAttribute('enabled', this._enabled.toString());
    for (const [name, value] of this._parameters) {
      const param = elem.addElement('parameter');
      param.setAttribute('name', name);
      param.setAttribute('value', value.toString());
    }
    return elem;
  }

  static loadFromXML(data: Element): Effect {
    const effect = new Effect();
    effect._type = data.getAttribute('type') ?? '';
    effect._enabled = data.getAttribute('enabled') !== 'false';

    const params = data.getElements('parameter');
    while (params.hasMoreElements()) {
      const param = params.next();
      const name = param.getAttribute('name') ?? '';
      const value = parseFloat(param.getAttribute('value') ?? '0');
      effect._parameters.set(name, value);
    }
    return effect;
  }

  deepCopy(): BlueDataObject {
    const copy = new Effect();
    copy._type = this._type;
    copy._enabled = this._enabled;
    for (const [k, v] of this._parameters) {
      copy._parameters.set(k, v);
    }
    return copy;
  }
}
