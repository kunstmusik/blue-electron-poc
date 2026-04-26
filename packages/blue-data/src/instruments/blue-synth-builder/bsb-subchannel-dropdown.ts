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

  override getPresetValue(): string {
    return this.channelOutput;
  }

  override setPresetValue(val: string): void {
    if (val.startsWith('ver2:')) {
      this.channelOutput = val.substring(5);
    } else {
      this.channelOutput = val;
    }
  }

  override collectReplacements(unit: BSBCompilationUnit): void {
    unit.addReplacementValue(this.objectName, this.channelOutput);
  }

  loadFromXML(data: Element): void {
    this.loadFromXMLCommon(data);
    const co = data.getTextString('channelOutput');
    if (co) this.channelOutput = co;
  }
}
