/**
 * BSBSubChannelDropdown — subchannel selection dropdown.
 * Extends BSBObject directly (not automatable).
 * Does not contribute replacement values — visual only.
 */
import { Element } from '../../serialization/xml-reader';
import { BSBWidget } from './bsb-widget';

export class BSBSubChannelDropdown extends BSBWidget {
  loadFromXML(data: Element): void {
    this.loadFromXMLCommon(data);
  }
}
