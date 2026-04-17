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
  private _enabled = true;
  private _parameter: Parameter;

  constructor() {
    this._parameter = new Parameter();
    this._parameter.setName('Send Amount');
    this._parameter.setMinimum(0.0);
    this._parameter.setMaximum(1.0);
    this._parameter.setFixedValue(1.0);
    this._parameter.setResolution(-1.0);
  }

  getTargetChannelId(): string { return this._targetChannelId; }
  setTargetChannelId(id: string): void { this._targetChannelId = id; }

  getLevel(): number { return this._level; }
  setLevel(level: number): void {
    this._level = level;
    if (!this._parameter.isAutomationEnabled()) {
      this._parameter.setFixedValue(level);
    }
  }

  isEnabled(): boolean { return this._enabled; }
  setEnabled(enabled: boolean): void { this._enabled = enabled; }

  getParameter(): Parameter { return this._parameter; }
  getLevelParameter(): Parameter { return this._parameter; }
  getParameters(): Parameter[] { return [this._parameter]; }

  saveAsXML(): Element {
    const elem = new Element('send');
    elem.addElement('sendChannel').setText(this._targetChannelId);
    elem.addElement('level').setText(this._level.toString());
    elem.addElement('enabled').setText(this._enabled.toString());
    elem.addElement(this._parameter.saveAsXML());
    return elem;
  }

  static loadFromXML(data: Element): Send {
    const send = new Send();
    // Java uses <sendChannel>, not <targetChannelId>
    const sendChannel = data.getTextString('sendChannel') || data.getTextString('targetChannelId');
    if (sendChannel) send._targetChannelId = sendChannel;
    const levelStr = data.getTextString('level');
    if (levelStr) send._level = parseFloat(levelStr);
    const enabledStr = data.getTextString('enabled');
    if (enabledStr) send._enabled = enabledStr === 'true';

    // Load send parameter (Send Amount)
    const paramElem = data.getElement('parameter');
    if (paramElem) {
      send._parameter = Parameter.loadFromXML(paramElem);
    }

    if (!send._parameter.isAutomationEnabled()) {
      send._parameter.setFixedValue(send._level);
    }

    return send;
  }

  deepCopy(): BlueDataObject {
    const copy = new Send();
    copy._targetChannelId = this._targetChannelId;
    copy._level = this._level;
    copy._enabled = this._enabled;
    copy._parameter = this._parameter.deepCopy() as Parameter;
    return copy;
  }
}
