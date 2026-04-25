/**
 * BSBVSliderBank — bank of multiple vertical sliders in one widget.
 * Mirrors the Java BSBVSliderBank class.
 */
import { Element } from '../../serialization/xml-reader';
import { BSBWidget } from './bsb-widget';
import { BSBCompilationUnit } from './bsb-compilation-unit';
import { BSBVSlider } from './bsb-vslider';
import { formatBlueNumber } from '../../utilities/number-format';

export class BSBVSliderBank extends BSBWidget {
  sliderHeight = 100;
  gap = 5;
  resolution = 0.1;
  valueDisplayEnabled = true;
  randomizable = true;
  sliders: BSBVSlider[] = [];

  get numberOfSliders(): number {
    return this.sliders.length;
  }

  set numberOfSliders(count: number) {
    while (this.sliders.length < count) {
      this.sliders.push(new BSBVSlider());
    }
    while (this.sliders.length > count) {
      this.sliders.pop();
    }
  }

  override collectReplacements(unit: BSBCompilationUnit): void {
    for (let i = 0; i < this.sliders.length; i++) {
      const key = `${this.objectName}_${i}`;
      unit.addReplacementValue(key, formatBlueNumber(this.sliders[i].value));
    }
  }

  loadFromXML(data: Element): void {
    this.loadFromXMLCommon(data);
    const h = data.getTextString('sliderHeight');
    if (h) this.sliderHeight = parseInt(h, 10);
    const g = data.getTextString('gap');
    if (g) this.gap = parseInt(g, 10);
    const res = data.getTextString('bdresolution') ?? data.getTextString('resolution');
    if (res) this.resolution = parseFloat(res);
    const vde = data.getElement('valueDisplayEnabled');
    if (vde) this.valueDisplayEnabled = vde.getTextString() === 'true';
    const rand = data.getElement('randomizable');
    if (rand) this.randomizable = rand.getTextString() === 'true';

    this.sliders = [];
    const childElems = data.getElements('bsbObject');
    while (childElems.hasMoreElements()) {
      const childElem = childElems.next();
      const slider = new BSBVSlider();
      slider.loadFromXML(childElem);
      this.sliders.push(slider);
    }
    if (this.sliders.length === 0) {
      this.sliders.push(new BSBVSlider());
    }
  }
}
