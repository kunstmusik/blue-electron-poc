/**
 * NoteProcessorChainMap — maps named note processor chains.
 * Mirrors the Java NoteProcessorChainMap class.
 *
 * Stores named note processor chains that can be referenced by score objects.
 */
import { Element } from '../serialization/xml-reader';
import { BlueDataObject } from '../blue-data-object';
import { NoteProcessorChain } from './note-processor-chain';

export class NoteProcessorChainMap implements BlueDataObject {
  private chains = new Map<string, NoteProcessorChain>();

  constructor(other?: NoteProcessorChainMap) {
    if (other) {
      for (const [name, chain] of other.chains) {
        this.chains.set(name, chain.deepCopy());
      }
    }
  }

  getChain(name: string): NoteProcessorChain | undefined {
    return this.chains.get(name);
  }

  setChain(name: string, chain: NoteProcessorChain): void {
    this.chains.set(name, chain);
  }

  getChainNames(): string[] {
    return Array.from(this.chains.keys());
  }

  saveAsXML(): Element {
    const elem = new Element('noteProcessorChainMap');
    for (const [name, chain] of this.chains) {
      const chainElem = chain.saveAsXML();
      chainElem.setAttribute('name', name);
      elem.addElement(chainElem);
    }
    return elem;
  }

  static loadFromXML(data: Element): NoteProcessorChainMap {
    const map = new NoteProcessorChainMap();
    const children = data.getElements('noteProcessorChain');
    while (children.hasMoreElements()) {
      const node = children.next();
      const name = node.getAttribute('name') ?? '';
      if (name) {
        const chain = NoteProcessorChain.loadFromXML(node);
        map.chains.set(name, chain);
      }
    }
    return map;
  }

  deepCopy(): BlueDataObject {
    return new NoteProcessorChainMap(this);
  }
}
