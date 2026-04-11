/**
 * InstrumentLibrary — user's library of instruments.
 * Mirrors the Java InstrumentLibrary class.
 *
 * For Phase 3, this is a simple stub — stores instruments by name.
 * Full category tree support in later phases.
 */
import { Instrument } from './instrument';
import { GenericInstrument } from './generic-instrument';
import { Element } from '../serialization/xml-reader';

export class InstrumentLibrary {
  private instruments = new Map<string, Instrument>();

  getInstrument(name: string): Instrument | undefined {
    return this.instruments.get(name);
  }

  addInstrument(instr: Instrument): void {
    this.instruments.set(instr.getName(), instr);
  }

  getAllInstruments(): Instrument[] {
    return Array.from(this.instruments.values());
  }

  removeInstrument(name: string): boolean {
    return this.instruments.delete(name);
  }

  // ─── XML ───

  saveAsXML(): Element {
    const elem = new Element('instrumentLibrary');
    for (const instr of this.instruments.values()) {
      if (instr instanceof GenericInstrument) {
        elem.addElement(instr.saveAsXML());
      }
    }
    return elem;
  }

  static loadFromXML(data: Element): InstrumentLibrary {
    const lib = new InstrumentLibrary();
    const instrNodes = data.getElements('genericInstrument');
    while (instrNodes.hasMoreElements()) {
      const node = instrNodes.next();
      const instr = GenericInstrument.loadFromXML(node);
      lib.addInstrument(instr);
    }
    return lib;
  }
}
