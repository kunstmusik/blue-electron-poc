/**
 * BSBKnob — rotary control widget.
 * Mirrors the Java BSBKnob class.
 */
import { Element } from '../../serialization/xml-reader';
import { BSBWidget } from './bsb-widget';

export class BSBKnob extends BSBWidget {
  knobWidth = 60;
  knobHeight = 60;

  loadFromXML(data: Element): void {
    this.loadFromXMLCommon(data);
    const w = data.getTextString('knobWidth');
    if (w) this.knobWidth = parseInt(w, 10);
    const h = data.getTextString('knobHeight');
    if (h) this.knobHeight = parseInt(h, 10);
  }
}
