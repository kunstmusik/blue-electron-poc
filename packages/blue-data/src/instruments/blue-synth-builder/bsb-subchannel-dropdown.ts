/**
 * BSBSubChannelDropdown — subchannel selection dropdown.
 * Extends BSBObject directly (not automatable).
 * Does not contribute replacement values — visual only.
 */
import { Element } from '../../serialization/xml-reader';
import { BSBWidget } from './bsb-widget';
import { BSBCompilationUnit } from './bsb-compilation-unit';

export class BSBSubChannelDropdown extends BSBWidget {
  channelOutput = 'Master';

  override collectReplacements(unit: BSBCompilationUnit): void {
    unit.addReplacementValue(this.objectName, this.channelOutput);
  }

  loadFromXML(data: Element): void {
    this.loadFromXMLCommon(data);
    const co = data.getTextString('channelOutput');
    if (co) this.channelOutput = co;
  }
}
