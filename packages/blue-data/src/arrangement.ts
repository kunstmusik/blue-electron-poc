/**
 * Arrangement — maps instruments to instrument IDs for CSD generation.
 * Mirrors the Java Arrangement class.
 *
 * The Arrangement holds a list of InstrumentAssignments, each linking an
 * instrument from the InstrumentLibrary to a specific instrument ID in the
 * generated CSD.
 */
import { InstrumentAssignment } from './instruments/instrument-assignment';
import { Instrument } from './instruments/instrument';
import { CompileData } from './compile-data';
import { replaceAll } from './utilities/text';
import { Element } from './serialization/xml-reader';

export class Arrangement {
  private arrangement: InstrumentAssignment[] = [];

  constructor(other?: Arrangement) {
    if (other) {
      for (const ia of other.arrangement) {
        this.arrangement.push(new InstrumentAssignment(ia));
      }
    }
  }

  // ─── Instrument management ───

  addInstrument(instrument: Instrument, instrumentId?: string): number {
    const id = instrumentId || '0';
    const ia = new InstrumentAssignment();
    ia.arrangementId = id;
    ia.instr = instrument;
    this.arrangement.push(ia);
    this.sort();
    return this.arrangement.length;
  }

  size(): number {
    return this.arrangement.length;
  }

  getInstrumentId(index: number): string {
    return this.arrangement[index]?.arrangementId ?? '';
  }

  getInstrument(index: number): Instrument {
    return this.arrangement[index]?.instr;
  }

  getInstrumentById(id: string): Instrument | undefined {
    return this.arrangement.find((ia) => ia.arrangementId === id)?.instr;
  }

  getArrangement(): InstrumentAssignment[] {
    return [...this.arrangement];
  }

  removeInstrument(index: number): Instrument | null {
    return this.arrangement.splice(index, 1)[0]?.instr ?? null;
  }

  private sort(): void {
    this.arrangement.sort((a, b) => a.compareTo(b));
  }

  // ─── CSD Generation ───

  /**
   * Generate the orchestra section from all enabled instruments.
   * Skips assignments where the instrument reference is not resolved
   * (this happens when loading from XML without a library second-pass).
   */
  generateOrchestra(compileData: CompileData): string {
    const buffer: string[] = [];

    for (const ia of this.arrangement) {
      if (!ia.enabled) continue;
      if (!ia.instr) continue; // Skip unresolved instrument references

      const instrumentText = ia.instr.generateInstrument();
      if (!instrumentText) continue;

      // Transform instrument text with arrangement ID substitution
      let transformed = this.replaceInstrumentId(ia.arrangementId, instrumentText);

      // Handle blueMixerOut → outc conversion
      transformed = this.convertBlueMixerOut(compileData, ia.arrangementId, transformed);

      buffer.push(`\tinstr ${ia.arrangementId}\t;${ia.instr.getName()}\n`);
      buffer.push(transformed);
      buffer.push('\tendin\n\n');
    }

    return buffer.join('');
  }

  /**
   * Generate global orchestra code from all instruments.
   */
  generateGlobalOrc(compileData: CompileData): string {
    const buffer: string[] = [];

    for (const ia of this.arrangement) {
      if (!ia.enabled) continue;
      if (!ia.instr) continue; // Skip unresolved instrument references
      const globalOrc = ia.instr.generateGlobalOrc();
      if (globalOrc) {
        buffer.push(this.replaceInstrumentId(ia.arrangementId, globalOrc));
      }
    }

    return buffer.join('\n');
  }

  private replaceInstrumentId(arrangementId: string, input: string): string {
    let replacementId: string;
    const numId = parseInt(arrangementId, 10);
    if (!isNaN(numId)) {
      replacementId = numId.toString();
    } else {
      replacementId = `"${arrangementId}"`;
    }

    let transformed = replaceAll(input, '<INSTR_ID>', replacementId);
    transformed = replaceAll(transformed, '<INSTR_NAME>', arrangementId);
    return transformed;
  }

  private convertBlueMixerOut(_compileData: CompileData, _arrangementId: string, input: string): string {
    if (!input.includes('blueMixerOut') && !input.includes('blueMixerIn')) {
      return input;
    }

    // For Phase 3: replace blueMixerOut with outc (mixer disabled)
    // Full implementation with channel routing in Phase 9
    return input
      .replace(/blueMixerOut/g, 'outc')
      .replace(/blueMixerIn/g, '// blueMixerIn');
  }

  // ─── XML Serialization ───

  saveAsXML(): Element {
    const elem = new Element('arrangement');
    for (const ia of this.arrangement) {
      const iaElem = new Element('instrumentAssignment');
      iaElem.setAttribute('id', ia.arrangementId);
      iaElem.setAttribute('enabled', ia.enabled.toString());
      // Instrument reference is stored separately in InstrumentLibrary
      elem.addElement(iaElem);
    }
    return elem;
  }

  static loadFromXML(data: Element): Arrangement {
    const arr = new Arrangement();
    const items = data.getElements('instrumentAssignment');

    while (items.hasMoreElements()) {
      const elem = items.next();
      const ia = new InstrumentAssignment();
      ia.arrangementId = elem.getAttribute('id') ?? '0';
      ia.enabled = elem.getAttribute('enabled') !== 'false';
      arr.arrangement.push(ia);
    }

    return arr;
  }

  static loadFromXMLWithLibrary(data: Element, _iLibrary: unknown): Arrangement {
    // Legacy format with embedded instrument library
    return Arrangement.loadFromXML(data);
  }
}
