/**
 * OpcodeDefinition — a single user-defined opcode.
 * Mirrors the Java OpcodeDefinition class.
 */
import { Element } from '../serialization/xml-reader';
import { BlueDataObject } from '../blue-data-object';

export class OpcodeDefinition implements BlueDataObject {
  private _name = '';
  private _outTypes = '';
  private _inTypes = '';
  private _code = '';

  getName(): string { return this._name; }
  setName(name: string): void { this._name = name; }

  getOutTypes(): string { return this._outTypes; }
  setOutTypes(types: string): void { this._outTypes = types; }

  getInTypes(): string { return this._inTypes; }
  setInTypes(types: string): void { this._inTypes = types; }

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
    // Handle both formats:
    // Standard: <name>...</name> <code>...</code>
    // BSB format: <opcodeName>...</opcodeName> <outTypes>...</outTypes> <inTypes>...</inTypes> <codeBody>...</codeBody>
    const name = data.getTextString('name') || data.getTextString('opcodeName');
    if (name) opcode._name = name;

    const outTypes = data.getTextString('outTypes');
    if (outTypes) opcode._outTypes = outTypes;

    const inTypes = data.getTextString('inTypes');
    if (inTypes) opcode._inTypes = inTypes;

    const code = data.getTextString('code') || data.getTextString('codeBody');
    if (code !== null) opcode._code = code;
    return opcode;
  }

  deepCopy(): BlueDataObject {
    const copy = new OpcodeDefinition();
    copy._name = this._name;
    copy._outTypes = this._outTypes;
    copy._inTypes = this._inTypes;
    copy._code = this._code;
    return copy;
  }

  /**
   * Get the opcode as CSD text, wrapped with opcode/endop.
   */
  toCSD(): string {
    if (!this._code) return '';
    return `opcode ${this._name},${this._outTypes},${this._inTypes}\n${this._code}\nendop`;
  }
}
