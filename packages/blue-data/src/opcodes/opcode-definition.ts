/**
 * OpcodeDefinition — a single user-defined opcode.
 * Mirrors the Java OpcodeDefinition class.
 */
import { Element } from '../serialization/xml-reader';
import { BlueDataObject } from '../blue-data-object';

export class OpcodeDefinition implements BlueDataObject {
  private _name = '';
  private _code = '';

  getName(): string { return this._name; }
  setName(name: string): void { this._name = name; }

  getCode(): string { return this._code; }
  setCode(code: string): void { this._code = code; }

  saveAsXML(): Element {
    const elem = new Element('opcode');
    elem.addElement('name').setText(this._name);
    elem.addElement('code').setText(this._code);
    return elem;
  }

  static loadFromXML(data: Element): OpcodeDefinition {
    const opcode = new OpcodeDefinition();
    const name = data.getTextString('name');
    if (name) opcode._name = name;
    const code = data.getTextString('code');
    if (code !== null) opcode._code = code;
    return opcode;
  }

  deepCopy(): BlueDataObject {
    const copy = new OpcodeDefinition();
    copy._name = this._name;
    copy._code = this._code;
    return copy;
  }
}
