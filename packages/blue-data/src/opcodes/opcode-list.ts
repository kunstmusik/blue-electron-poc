/**
 * OpcodeList — list of user-defined opcodes (UDOs).
 * Mirrors the Java OpcodeList class.
 */
import { OpcodeDefinition } from './opcode-definition';
import { Element } from '../serialization/xml-reader';

export class OpcodeList {
  private _opcodes: OpcodeDefinition[] = [];
  private _counter = 0;

  addOpcode(opcode: OpcodeDefinition): void {
    this._opcodes.push(opcode);
  }

  size(): number {
    return this._opcodes.length;
  }

  getOpcode(index: number): OpcodeDefinition | null {
    if (index < 0 || index >= this._opcodes.length) return null;
    return this._opcodes[index];
  }

  getOpcodes(): OpcodeDefinition[] {
    return [...this._opcodes];
  }

  /**
   * Find an equivalent UDO in this list and return its name.
   * Returns null if no equivalent is found.
   */
  getNameOfEquivalentCopy(udo: OpcodeDefinition): string | null {
    if (udo == null) return null;
    for (const temp of this._opcodes) {
      if (temp.isEquivalent(udo)) {
        return temp.getName();
      }
    }
    return null;
  }

  isNameUnique(name: string): boolean {
    for (const udo of this._opcodes) {
      if (udo.getName() === name) return false;
    }
    return true;
  }

  getUniqueName(): string {
    let uniqueName = `uniqueUDO${this._counter++}`;
    while (!this.isNameUnique(uniqueName)) {
      uniqueName = `uniqueUDO${this._counter++}`;
    }
    return uniqueName;
  }

  saveAsXML(): Element {
    const elem = new Element('opcodeList');
    for (const opcode of this._opcodes) {
      elem.addElement(opcode.saveAsXML());
    }
    return elem;
  }

  static loadFromXML(data: Element): OpcodeList {
    const list = new OpcodeList();
    const children = data.getElements();
    while (children.hasMoreElements()) {
      const node = children.next();
      const udo = OpcodeDefinition.loadFromXML(node);
      list._opcodes.push(udo);
    }
    return list;
  }

  /**
   * Get all opcodes as a single CSD text block.
   */
  toString(): string {
    if (this._opcodes.length === 0) return '';
    return this._opcodes.map(op => op.generateCode()).join('\n');
  }
}
