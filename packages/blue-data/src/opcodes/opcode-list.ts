/**
 * OpcodeList — list of user-defined opcodes (UDOs).
 * Mirrors the Java OpcodeList class.
 */
import { OpcodeDefinition } from './opcode-definition';
import { Element } from '../serialization/xml-reader';

export class OpcodeList {
  private _opcodes: OpcodeDefinition[] = [];

  addOpcode(opcode: OpcodeDefinition): void {
    this._opcodes.push(opcode);
  }

  getOpcodes(): OpcodeDefinition[] {
    return [...this._opcodes];
  }

  saveAsXML(): Element {
    const elem = new Element('opcodeList');
    for (const opcode of this._opcodes) {
      elem.addElement(opcode.saveAsXML().setName('opcode'));
    }
    return elem;
  }

  static loadFromXML(data: Element): OpcodeList {
    const list = new OpcodeList();
    const opcodes = data.getElements('opcode');
    while (opcodes.hasMoreElements()) {
      list._opcodes.push(OpcodeDefinition.loadFromXML(opcodes.next()));
    }
    return list;
  }
}
