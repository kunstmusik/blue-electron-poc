/**
 * BSBVSliderBank — bank of multiple vertical sliders in one widget.
 * Mirrors the Java BSBVSliderBank class.
 */
import { Element } from '../../serialization/xml-reader';
import { BSBWidget } from './bsb-widget';

export class BSBVSliderBank extends BSBWidget {
  sliderCount = 1;
  sliderHeight = 100;

  loadFromXML(data: Element): void {
    this.loadFromXMLCommon(data);
    const count = data.getTextString('sliderCount');
    if (count) this.sliderCount = parseInt(count, 10);
    const h = data.getTextString('sliderHeight');
    if (h) this.sliderHeight = parseInt(h, 10);
  }
}
