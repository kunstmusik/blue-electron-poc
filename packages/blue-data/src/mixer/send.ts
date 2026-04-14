/**
 * Send — mixer send level to a channel.
 * Mirrors the Java Send class.
 */
import { Element } from '../serialization/xml-reader';
import { BlueDataObject } from '../blue-data-object';
import { Parameter } from '../automation/parameter';

export class Send implements BlueDataObject {
  private _targetChannelId = '';
  private _level = 1.0;
  private _parameter: Parameter | null = null;

  getTargetChannelId(): string { return this._targetChannelId; }
  setTargetChannelId(id: string): void { this._targetChannelId = id; }

  getLevel(): number { return this._level; }
  setLevel(level: number): void { this._level = level; }

  getParameter(): Parameter | null { return this._parameter; }

  saveAsXML(): Element {
    const elem = new Element('send');
    elem.addElement('sendChannel').setText(this._targetChannelId);
    return elem;
  }

  static loadFromXML(data: Element): Send {
    const send = new Send();
    // Java uses <sendChannel>, not <targetChannelId>
    const sendChannel = data.getTextString('sendChannel') || data.getTextString('targetChannelId');
    if (sendChannel) send._targetChannelId = sendChannel;
    const levelStr = data.getTextString('level');
    if (levelStr) send._level = parseFloat(levelStr);

    // Load send parameter (Send Amount)
    const paramElem = data.getElement('parameter');
    if (paramElem) {
      const param = new Parameter();
      const pName = paramElem.getAttribute('name');
      if (pName) param.setName(pName);
      const pVal = paramElem.getAttribute('value');
      if (pVal) param.setFixedValue(parseFloat(pVal));
      const pMin = paramElem.getAttribute('min');
      if (pMin) param.setMinimum(parseFloat(pMin));
      const pMax = paramElem.getAttribute('max');
      if (pMax) param.setMaximum(parseFloat(pMax));
      send._parameter = param;
    }

    return send;
  }

  deepCopy(): BlueDataObject {
    const copy = new Send();
    copy._targetChannelId = this._targetChannelId;
    copy._level = this._level;
    return copy;
  }
}
