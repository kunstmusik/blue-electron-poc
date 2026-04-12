/**
 * Send — mixer send level to a channel.
 * Mirrors the Java Send class.
 */
import { Element } from '../serialization/xml-reader';
import { BlueDataObject } from '../blue-data-object';

export class Send implements BlueDataObject {
  private _targetChannelId = '';
  private _level = 1.0;

  getTargetChannelId(): string { return this._targetChannelId; }
  setTargetChannelId(id: string): void { this._targetChannelId = id; }

  getLevel(): number { return this._level; }
  setLevel(level: number): void { this._level = level; }

  saveAsXML(): Element {
    const elem = new Element('send');
    elem.addElement('targetChannelId').setText(this._targetChannelId);
    elem.addElement('level').setText(this._level.toString());
    return elem;
  }

  static loadFromXML(data: Element): Send {
    const send = new Send();
    const targetId = data.getTextString('targetChannelId');
    if (targetId) send._targetChannelId = targetId;
    const levelStr = data.getTextString('level');
    if (levelStr) send._level = parseFloat(levelStr);
    return send;
  }

  deepCopy(): BlueDataObject {
    const copy = new Send();
    copy._targetChannelId = this._targetChannelId;
    copy._level = this._level;
    return copy;
  }
}
