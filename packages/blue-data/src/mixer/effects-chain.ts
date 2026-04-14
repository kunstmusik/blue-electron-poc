/**
 * EffectsChain — ordered list of effects for a channel.
 * Mirrors the Java EffectsChain class.
 */
import { Effect } from './effect';
import { Send } from './send';
import { Element } from '../serialization/xml-reader';
import { BlueDataObject } from '../blue-data-object';

export class EffectsChain extends Array<Effect> implements BlueDataObject {
  /** Sends nested within this effects chain (post chains can contain <send> elements). */
  sends: Send[] = [];

  saveAsXML(): Element {
    const elem = new Element('effectsChain');
    for (const effect of this) {
      elem.addElement(effect.saveAsXML());
    }
    return elem;
  }

  static loadFromXML(data: Element): EffectsChain {
    const chain = new EffectsChain();

    // Load effects
    const effects = data.getElements('effect');
    while (effects.hasMoreElements()) {
      chain.push(Effect.loadFromXML(effects.next()));
    }

    // Load sends (found in post effects chains)
    const sendNodes = data.getElements('send');
    while (sendNodes.hasMoreElements()) {
      chain.sends.push(Send.loadFromXML(sendNodes.next()));
    }

    return chain;
  }

  deepCopy(): BlueDataObject {
    const copy = new EffectsChain();
    for (const effect of this) {
      copy.push(effect.deepCopy() as Effect);
    }
    return copy;
  }
}
