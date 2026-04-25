/**
 * BSBHSlider — horizontal slider widget.
 * Mirrors the Java BSBHSlider class.
 */
import { Element } from '../../serialization/xml-reader';
import { BSBWidget } from './bsb-widget';

export class BSBHSlider extends BSBWidget {
  sliderWidth = 100;
  resolution = 0.1;
  valueDisplayEnabled = true;
  randomizable = true;

  loadFromXML(data: Element): void {
    this.loadFromXMLCommon(data);
    const w = data.getTextString('sliderWidth');
    if (w) this.sliderWidth = parseInt(w, 10);
    const res = data.getTextString('bdresolution') ?? data.getTextString('resolution');
    if (res) this.resolution = parseFloat(res);
    const vde = data.getElement('valueDisplayEnabled');
    if (vde) this.valueDisplayEnabled = vde.getTextString() === 'true';
    const rand = data.getElement('randomizable');
    if (rand) this.randomizable = rand.getTextString() === 'true';
  }
}
