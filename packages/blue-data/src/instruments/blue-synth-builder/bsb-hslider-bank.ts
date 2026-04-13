/**
 * BSBHSliderBank — bank of multiple horizontal sliders in one widget.
 * Mirrors the Java BSBHSliderBank class.
 */
import { Element } from '../../serialization/xml-reader';
import { BSBWidget } from './bsb-widget';
import { BSBCompilationUnit } from './bsb-compilation-unit';

export class BSBHSliderBank extends BSBWidget {
  sliderCount = 1;
  sliderWidth = 100;

  loadFromXML(data: Element): void {
    this.loadFromXMLCommon(data);
    const count = data.getTextString('sliderCount');
    if (count) this.sliderCount = parseInt(count, 10);
    const w = data.getTextString('sliderWidth');
    if (w) this.sliderWidth = parseInt(w, 10);
  }
}
