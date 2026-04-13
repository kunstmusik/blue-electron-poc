/**
 * BSBDropdown — dropdown selection list widget.
 * Mirrors the Java BSBDropdown class.
 */
import { Element } from '../../serialization/xml-reader';
import { BSBWidget } from './bsb-widget';

export class BSBDropdown extends BSBWidget {
  /** Index of the currently selected item */
  selectedIndex = 0;

  loadFromXML(data: Element): void {
    this.loadFromXMLCommon(data);
    const idx = data.getTextString('selectedIndex');
    if (idx) this.selectedIndex = parseInt(idx, 10);
    // BSBDropdownItemList would be loaded here if needed for compilation
    // For CSD generation, only the selected index value matters
  }
}
