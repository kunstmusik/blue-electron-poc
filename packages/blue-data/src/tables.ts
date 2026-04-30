import { Element } from './serialization/xml-reader';

export class Tables {
  private _tables = '';
  private _compilationVariables = new Map<unknown, unknown>();
  private _ftableNumberSet: Set<number> | null = null;

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
    this._ftableNumberSet = null;
  }

  getAllTables(): string {
    return this._tables;
  }

  getOpenFTableNumber(): number {
    if (!this._ftableNumberSet) {
      this._ftableNumberSet = getFtableNumberSet(this._tables);
    }

    let counter = 1;
    while (this._ftableNumberSet.has(counter)) {
      counter++;
    }
    this._ftableNumberSet.add(counter);
    return counter;
  }

  addFtgenNumber(ftgenNum: number): void {
    if (!this._ftableNumberSet) {
      this._ftableNumberSet = getFtableNumberSet(this._tables);
    }
    this._ftableNumberSet.add(ftgenNum);
  }

  getCompilationVariable(key: unknown): unknown {
    return this._compilationVariables.get(key);
  }

  setCompilationVariable(key: unknown, value: unknown): void {
    this._compilationVariables.set(key, value);
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

function getFtableNumberSet(ftableText: string): Set<number> {
  const ftableNumbers = new Set<number>();
  const lines = ftableText.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('f')) {
      continue;
    }

    const parts = trimmed.split(/\s+/);
    if (parts.length < 2) {
      continue;
    }

    const num = parseInt(parts[1], 10);
    if (!Number.isNaN(num)) {
      ftableNumbers.add(num);
    }
  }

  return ftableNumbers;
}
