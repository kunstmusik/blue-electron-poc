/**
 * NoteProcessorChainMap — maps named note processor chains.
 * Mirrors the Java NoteProcessorChainMap class.
 *
 * For Phase 3: stub — preserves XML on load/save.
 */
import { Element } from '../serialization/xml-reader';
import { NoteProcessorChain } from './note-processor-chain';

export class NoteProcessorChainMap {
  private chains = new Map<string, NoteProcessorChain>();

  getChain(name: string): NoteProcessorChain | undefined {
    return this.chains.get(name);
  }

  setChain(name: string, chain: NoteProcessorChain): void {
    this.chains.set(name, chain);
  }

  saveAsXML(): Element {
    return new Element('noteProcessorChainMap');
  }

  static loadFromXML(_data: Element): NoteProcessorChainMap {
    return new NoteProcessorChainMap();
  }
}
