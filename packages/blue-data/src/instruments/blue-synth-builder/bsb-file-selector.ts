/**
 * BSBFileSelector — file path selector widget.
 * Implements StringChannelProvider in Java (provides gS_blue_strN globals).
 * For now, stores the selected file path but doesn't contribute to BSB replacements.
 */
import { Element } from '../../serialization/xml-reader';
import { BSBWidget } from './bsb-widget';

export class BSBFileSelector extends BSBWidget {
  selectedPath = '';

  loadFromXML(data: Element): void {
    this.loadFromXMLCommon(data);
    const path = data.getTextString('selectedPath');
    if (path) this.selectedPath = path;
  }
}
