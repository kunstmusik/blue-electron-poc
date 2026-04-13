/**
 * BSBVSlider — vertical slider widget.
 * Mirrors the Java BSBVSlider class.
 */
import { Element } from '../../serialization/xml-reader';
import { BSBWidget } from './bsb-widget';

export class BSBVSlider extends BSBWidget {
  sliderHeight = 100;

  loadFromXML(data: Element): void {
    this.loadFromXMLCommon(data);
    const h = data.getTextString('sliderHeight');
    if (h) this.sliderHeight = parseInt(h, 10);
  }
}
