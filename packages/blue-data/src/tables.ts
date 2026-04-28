import { Element } from './serialization/xml-reader';

export class Tables {
  private _tables = '';

  constructor(other?: Tables) {
    if (other) {
      this._tables = other._tables;
    }
  }

  getTables(): string {
    return this._tables;
  }

  setTables(tables: string): void {
    this._tables = tables;
  }

  getAllTables(): string {
    return this._tables;
  }

  saveAsXML(): Element {
    const elem = new Element('tables');
    elem.setText(this._tables);
    return elem;
  }

  static loadFromXML(data: Element | null): Tables {
    const tables = new Tables();
    if (!data) return tables;

    const fTableChildren = data.getElements('fTable');
    if (fTableChildren.size > 0) {
      const lines: string[] = [];
      while (fTableChildren.hasMoreElements()) {
        const node = fTableChildren.next();
        const def = node.getTextString();
        if (def) lines.push(def);
      }
      tables.setTables(lines.join('\n'));
    } else {
      const text = data.getTextString();
      tables.setTables(text ?? '');
    }

    return tables;
  }
}
