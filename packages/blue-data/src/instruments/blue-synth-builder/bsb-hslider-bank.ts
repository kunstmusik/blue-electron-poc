/**
 * BSBHSliderBank — bank of multiple horizontal sliders in one widget.
 * Mirrors the Java BSBHSliderBank class.
 */
import { Element } from '../../serialization/xml-reader';
import { BSBWidget } from './bsb-widget';
import { BSBCompilationUnit } from './bsb-compilation-unit';
import { BSBHSlider } from './bsb-hslider';
import { Parameter } from '../../automation/parameter';
import { formatBlueNumber } from '../../utilities/number-format';

export class BSBHSliderBank extends BSBWidget {
  sliderWidth = 100;
  gap = 5;
  resolution = 0.1;
  valueDisplayEnabled = true;
  randomizable = true;
  sliders: BSBHSlider[] = [];

  get numberOfSliders(): number {
    return this.sliders.length;
  }

  set numberOfSliders(count: number) {
    while (this.sliders.length < count) {
      this.sliders.push(new BSBHSlider());
    }
    while (this.sliders.length > count) {
      this.sliders.pop();
    }
  }

  override collectReplacements(
    unit: BSBCompilationUnit,
    parameters?: Parameter[],
  ): void {
    for (let i = 0; i < this.sliders.length; i++) {
      const key = `${this.objectName}_${i}`;
      this.addCompilationReplacement(unit, key, formatBlueNumber(this.sliders[i].value), parameters);
    }
  }

  override getPresetValue(): string {
    return this.sliders.map((slider) => String(slider.value)).join(':');
  }

  override setPresetValue(val: string): void {
    const values = val.split(':');
    const size = Math.min(this.sliders.length, values.length);
    for (let index = 0; index < size; index++) {
      const parsed = parseFloat(values[index]);
      if (Number.isFinite(parsed)) {
        this.sliders[index].setValue(parsed);
      }
    }
  }

  loadFromXML(data: Element): void {
    this.loadFromXMLCommon(data);
    const w = data.getTextString('sliderWidth');
    if (w) this.sliderWidth = parseInt(w, 10);
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
      const slider = new BSBHSlider();
      slider.loadFromXML(childElem);
      this.sliders.push(slider);
    }
    if (this.sliders.length === 0) {
      this.sliders.push(new BSBHSlider());
    }
  }

  randomize(): void {
    if (!this.randomizable) return;
    for (const s of this.sliders) s.randomize();
  }
}
