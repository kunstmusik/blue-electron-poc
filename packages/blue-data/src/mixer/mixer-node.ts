/**
 * MixerNode — a node in the mixer graph (visual representation).
 * Mirrors the Java MixerNode class.
 *
 * Phase 9: stub — preserves position and state data.
 */
import { Element } from '../serialization/xml-reader';
import { BlueDataObject } from '../blue-data-object';

export class MixerNode implements BlueDataObject {
  private _channelName = '';
  private _x = 0;
  private _y = 0;
  private _collapsed = false;

  getChannelName(): string { return this._channelName; }
  setChannelName(name: string): void { this._channelName = name; }

  getX(): number { return this._x; }
  setX(x: number): void { this._x = x; }

  getY(): number { return this._y; }
  setY(y: number): void { this._y = y; }

  isCollapsed(): boolean { return this._collapsed; }
  setCollapsed(c: boolean): void { this._collapsed = c; }

  saveAsXML(): Element {
    const elem = new Element('mixerNode');
    elem.addElement('channelName').setText(this._channelName);
    elem.addElement('x').setText(this._x.toString());
    elem.addElement('y').setText(this._y.toString());
    elem.addElement('collapsed').setText(this._collapsed.toString());
    return elem;
  }

  static loadFromXML(data: Element): MixerNode {
    const node = new MixerNode();
    const ch = data.getTextString('channelName');
    if (ch) node._channelName = ch;
    const x = data.getTextString('x');
    if (x) node._x = parseFloat(x);
    const y = data.getTextString('y');
    if (y) node._y = parseFloat(y);
    const c = data.getTextString('collapsed');
    if (c) node._collapsed = c.toLowerCase() === 'true';
    return node;
  }

  deepCopy(): BlueDataObject {
    const copy = new MixerNode();
    copy._channelName = this._channelName;
    copy._x = this._x;
    copy._y = this._y;
    copy._collapsed = this._collapsed;
    return copy;
  }
}
