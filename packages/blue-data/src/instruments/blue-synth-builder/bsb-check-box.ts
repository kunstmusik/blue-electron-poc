/**
 * BSBCheckBox — binary on/off control.
 * Mirrors the Java BSBCheckBox class.
 */
import { Element } from '../../serialization/xml-reader';
import { BSBWidget } from './bsb-widget';

export class BSBCheckBox extends BSBWidget {
  checkedVal = 1;
  uncheckedVal = 0;

  loadFromXML(data: Element): void {
    this.loadFromXMLCommon(data);
    const checked = data.getTextString('checkedVal');
    if (checked) this.checkedVal = parseFloat(checked);
    const unchecked = data.getTextString('uncheckedVal');
    if (unchecked) this.uncheckedVal = parseFloat(unchecked);
  }
}
