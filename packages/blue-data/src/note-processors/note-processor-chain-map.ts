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

  getNoteProcessorChain(name: string): NoteProcessorChain | undefined {
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
      const npcNode = new Element('npc');
      npcNode.setAttribute('name', name);
      npcNode.addElement(chain.saveAsXML());
      elem.addElement(npcNode);
    }
    return elem;
  }

  static loadFromXML(data: Element): NoteProcessorChainMap {
    const map = new NoteProcessorChainMap();

    const npcNodes = data.getElements('npc');
    while (npcNodes.hasMoreElements()) {
      const npcNode = npcNodes.next();
      const name = npcNode.getAttribute('name') ?? '';
      const chainElem = npcNode.getElement('noteProcessorChain');
      if (name && chainElem) {
        const chain = NoteProcessorChain.loadFromXML(chainElem);
        map.chains.set(name, chain);
      }
    }

    const legacyChainNodes = data.getElements('noteProcessorChain');
    while (legacyChainNodes.hasMoreElements()) {
      const node = legacyChainNodes.next();
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
