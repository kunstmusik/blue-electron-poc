/**
 * EffectsChain — ordered list of effects for a channel.
 * Mirrors the Java EffectsChain class.
 */
import { Effect } from './effect';
import { Element } from '../serialization/xml-reader';
import { BlueDataObject } from '../blue-data-object';

export class EffectsChain extends Array<Effect> implements BlueDataObject {
  saveAsXML(): Element {
    const elem = new Element('effectsChain');
    for (const effect of this) {
      elem.addElement(effect.saveAsXML());
    }
    return elem;
  }

  static loadFromXML(data: Element): EffectsChain {
    const chain = new EffectsChain();
    const effects = data.getElements('effect');
    while (effects.hasMoreElements()) {
      chain.push(Effect.loadFromXML(effects.next()));
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
