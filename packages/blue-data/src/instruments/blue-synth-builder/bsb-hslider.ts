/**
 * BSBHSlider — horizontal slider widget.
 * Mirrors the Java BSBHSlider class.
 */
import { Element } from '../../serialization/xml-reader';
import { BSBWidget } from './bsb-widget';

export class BSBHSlider extends BSBWidget {
  sliderWidth = 100;

  loadFromXML(data: Element): void {
    this.loadFromXMLCommon(data);
    const w = data.getTextString('sliderWidth');
    if (w) this.sliderWidth = parseInt(w, 10);
  }
}
