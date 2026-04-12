/**
 * EffectManager — manages effects across all channels.
 * Mirrors the Java EffectManager class.
 */
import { Channel } from './channel';
import { Effect } from './effect';
import { Element } from '../serialization/xml-reader';
import { BlueDataObject } from '../blue-data-object';

export class EffectManager implements BlueDataObject {
  private _channelEffects = new Map<string, Effect[]>();

  getEffects(channel: Channel): Effect[] {
    return this._channelEffects.get(channel.getName()) ?? [];
  }

  setEffects(channel: Channel, effects: Effect[]): void {
    this._channelEffects.set(channel.getName(), effects);
  }

  saveAsXML(): Element {
    const elem = new Element('effectManager');
    for (const [channelName, effects] of this._channelEffects) {
      const chElem = elem.addElement('channelEffects');
      chElem.setAttribute('channel', channelName);
      for (const effect of effects) {
        chElem.addElement(effect.saveAsXML().setName('effect'));
      }
    }
    return elem;
  }

  static loadFromXML(data: Element): EffectManager {
    const manager = new EffectManager();
    const chEffects = data.getElements('channelEffects');
    while (chEffects.hasMoreElements()) {
      const node = chEffects.next();
      const channelName = node.getAttribute('channel') ?? '';
      const effects: Effect[] = [];
      const effectNodes = node.getElements('effect');
      while (effectNodes.hasMoreElements()) {
        effects.push(Effect.loadFromXML(effectNodes.next()));
      }
      manager._channelEffects.set(channelName, effects);
    }
    return manager;
  }

  deepCopy(): BlueDataObject {
    const copy = new EffectManager();
    for (const [k, v] of this._channelEffects) {
      copy._channelEffects.set(k, v.map((e) => e.deepCopy() as Effect));
    }
    return copy;
  }
}
