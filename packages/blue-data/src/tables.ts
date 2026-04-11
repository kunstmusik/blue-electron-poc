/**
 * Tables — holds F-table definitions for CSD generation.
 * Mirrors the Java Tables class.
 */
import { Element } from './serialization/xml-reader';

export class Tables {
  private _tables = new Map<string, string>();

  constructor(other?: Tables) {
    if (other) {
      for (const [k, v] of other._tables) {
        this._tables.set(k, v);
      }
    }
  }

  addTable(name: string, definition: string): void {
    this._tables.set(name, definition);
  }

  getTable(name: string): string | undefined {
    return this._tables.get(name);
  }

  getAllTables(): string {
    return Array.from(this._tables.values()).join('\n');
  }

  clear(): void {
    this._tables.clear();
  }

  // ─── XML ───

  saveAsXML(): Element {
    const elem = new Element('tables');
    for (const [name, def] of this._tables) {
      const tElem = elem.addElement('fTable');
      tElem.setAttribute('name', name);
      tElem.setText(def);
    }
    return elem;
  }

  static loadFromXML(data: Element | null): Tables {
    const tables = new Tables();
    if (!data) return tables;

    const fTables = data.getElements('fTable');
    while (fTables.hasMoreElements()) {
      const node = fTables.next();
      const name = node.getAttribute('name') ?? '';
      const def = node.getTextString();
      if (name) tables.addTable(name, def);
    }

    return tables;
  }
}
