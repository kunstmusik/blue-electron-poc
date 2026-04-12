/**
 * ChannelList — ordered list of mixer channels.
 * Mirrors the Java ChannelList class.
 */
import { Channel } from './channel';
import { Element } from '../serialization/xml-reader';
import { BlueDataObject } from '../blue-data-object';

export class ChannelList extends Array<Channel> implements BlueDataObject {
  saveAsXML(): Element {
    const elem = new Element('channelList');
    for (const channel of this) {
      elem.addElement(channel.saveAsXML().setName('channel'));
    }
    return elem;
  }

  static loadFromXML(data: Element): ChannelList {
    const list = new ChannelList();
    const channels = data.getElements('channel');
    while (channels.hasMoreElements()) {
      list.push(Channel.loadFromXML(channels.next()));
    }
    return list;
  }

  deepCopy(): BlueDataObject {
    const copy = new ChannelList();
    for (const ch of this) {
      copy.push(ch.deepCopy() as Channel);
    }
    return copy;
  }
}
