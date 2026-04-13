/**
 * BSBLabel — static text label.
 * Does not contribute replacement values — visual only.
 */
import { Element } from '../../serialization/xml-reader';
import { BSBWidget } from './bsb-widget';

export class BSBLabel extends BSBWidget {
  labelText = '';

  loadFromXML(data: Element): void {
    this.loadFromXMLCommon(data);
    const text = data.getTextString('labelText');
    if (text) this.labelText = text;
  }
}
