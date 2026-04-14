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
  private _extraRenderTime = 0;

  isEnabled(): boolean { return this._enabled; }
  setEnabled(e: boolean): void { this._enabled = e; }

  getExtraRenderTime(): number { return this._extraRenderTime; }
  setExtraRenderTime(t: number): void { this._extraRenderTime = t; }

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

  /**
   * Generate Csound init statements for all mixer channels.
   * Mirrors Java's Mixer.getInitStatements().
   *
   * Output format:
   *   ga_bluemix_0_0 init 0
   *   ga_bluemix_0_1 init 0
   *   ...
   *   ga_bluesub_Reverb_0 init 0
   *   ...
   *   ga_bluesub_Master_0 init 0
   */
  getInitStatements(channelIdAssignments: Map<Channel, number>, nchnls: number): string {
    const lines: string[] = [];

    // Source channels: ga_bluemix_{id}_{ch}
    for (const channel of this._channels) {
      const id = channelIdAssignments.get(channel);
      if (id === undefined) continue;
      for (let ch = 0; ch < nchnls; ch++) {
        lines.push(`ga_bluemix_${id}_${ch}\tinit\t0`);
      }
    }

    // Sub channels: ga_bluesub_{name}_{ch}
    for (const subChannel of this._subChannels) {
      const id = channelIdAssignments.get(subChannel);
      if (id === undefined) continue;
      const name = subChannel.getName().replace(/\s+/g, '_');
      for (let ch = 0; ch < nchnls; ch++) {
        lines.push(`ga_bluesub_${name}_${ch}\tinit\t0`);
      }
    }

    // Master channel: ga_bluesub_Master_{ch}
    // Master is the last channel in the assignments
    const masterId = channelIdAssignments.size;
    for (let ch = 0; ch < nchnls; ch++) {
      lines.push(`ga_bluesub_Master_${ch}\tinit\t0`);
    }

    return lines.join('\n');
  }

  /**
   * Check if the mixer has sub channel dependencies that need rendering.
   */
  hasSubChannelDependencies(): boolean {
    return this._subChannels.length > 0;
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

    // Java Blue uses <channelList listName='...' list='channels'>
    // but we also support direct <channels> element
    const chNode = data.getElement('channels') || data.getElement('channelList');
    if (chNode) {
      // channelList contains <channel> elements directly
      mixer._channels = ChannelList.loadFromXML(chNode);
    }

    const subChNode = data.getElement('subChannels') || data.getElement('subChannelList');
    if (subChNode) {
      mixer._subChannels = ChannelList.loadFromXML(subChNode);
    }

    const extraTime = data.getTextString('extraRenderTime');
    if (extraTime) mixer._extraRenderTime = parseFloat(extraTime);

    return mixer;
  }

  deepCopy(): BlueDataObject {
    const copy = new Mixer();
    copy._enabled = this._enabled;
    copy._channels = this._channels.deepCopy() as ChannelList;
    copy._subChannels = this._subChannels.deepCopy() as ChannelList;
    copy._extraRenderTime = this._extraRenderTime;
    return copy;
  }
}
