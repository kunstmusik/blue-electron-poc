/**
 * Mixer — the complete mixer with channels, subchannels, effects, and routing.
 * Mirrors the Java Mixer class.
 */
import { Channel } from './channel';
import { ChannelList } from './channel-list';
import { Element } from '../serialization/xml-reader';
import { BlueDataObject } from '../blue-data-object';

export class Mixer implements BlueDataObject {
  private _enabled = true;
  private _channels = new ChannelList();
  private _subChannels = new ChannelList();

  isEnabled(): boolean { return this._enabled; }
  setEnabled(e: boolean): void { this._enabled = e; }

  getChannels(): ChannelList { return this._channels; }
  getSubChannels(): ChannelList { return this._subChannels; }

  /**
   * Get Csound variable name for a channel output.
   */
  static getChannelVar(channelId: number, outputIndex: number): string {
    return `ch${channelId}_${outputIndex}`;
  }

  /**
   * Get Csound variable name for a subchannel output.
   */
  static getSubChannelVar(name: string, outputIndex: number): string {
    return `sub_${name}_${outputIndex}`;
  }

  addSubChannelDependency(_name: string): void {
    // Phase 9: stub — full dependency tracking in Phase 10
  }

  getAllSourceChannels(): Channel[] {
    return Array.from(this._channels);
  }

  saveAsXML(): Element {
    const elem = new Element('mixer');
    elem.setAttribute('enabled', this._enabled.toString());
    elem.addElement(this._channels.saveAsXML().setName('channels'));
    elem.addElement(this._subChannels.saveAsXML().setName('subChannels'));
    return elem;
  }

  static loadFromXML(data: Element): Mixer {
    const mixer = new Mixer();
    mixer._enabled = data.getAttribute('enabled') !== 'false';

    const chNode = data.getElement('channels');
    if (chNode) mixer._channels = ChannelList.loadFromXML(chNode);

    const subChNode = data.getElement('subChannels');
    if (subChNode) mixer._subChannels = ChannelList.loadFromXML(subChNode);

    return mixer;
  }

  deepCopy(): BlueDataObject {
    const copy = new Mixer();
    copy._enabled = this._enabled;
    copy._channels = this._channels.deepCopy() as ChannelList;
    copy._subChannels = this._subChannels.deepCopy() as ChannelList;
    return copy;
  }
}
