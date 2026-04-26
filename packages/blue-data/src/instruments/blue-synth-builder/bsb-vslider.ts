/**
 * BSBVSlider — vertical slider widget.
 * Mirrors the Java BSBVSlider class.
 */
import { Element } from '../../serialization/xml-reader';
import { BSBWidget } from './bsb-widget';

export class BSBVSlider extends BSBWidget {
  sliderHeight = 100;
  resolution = 0.1;
  valueDisplayEnabled = true;
  randomizable = true;

  loadFromXML(data: Element): void {
    this.loadFromXMLCommon(data);
    const h = data.getTextString('sliderHeight');
    if (h) this.sliderHeight = parseInt(h, 10);
    const res = data.getTextString('bdresolution') ?? data.getTextString('resolution');
    if (res) this.resolution = parseFloat(res);
    const vde = data.getElement('valueDisplayEnabled');
    if (vde) this.valueDisplayEnabled = vde.getTextString() === 'true';
    const rand = data.getElement('randomizable');
    if (rand) this.randomizable = rand.getTextString() === 'true';
  }

  randomize(): void {
    if (!this.randomizable) return;
    const steps = Math.max(1, Math.round((this.maximum - this.minimum) / this.resolution));
    this.value = this.minimum + Math.round(Math.random() * steps) * this.resolution;
  }
}
