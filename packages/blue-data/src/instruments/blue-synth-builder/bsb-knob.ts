/**
 * BSBKnob — rotary control widget.
 * Mirrors the Java BSBKnob class.
 */
import { Element } from '../../serialization/xml-reader';
import { BSBWidget } from './bsb-widget';

export interface BSBFont {
  name: string;
  size: number;
  style: number;
}

export function loadFontFromXML(data: Element | null): BSBFont {
  const font: BSBFont = { name: 'Roboto', size: 12, style: 0 };
  if (!data) return font;
  const name = data.getTextString('name');
  if (name) font.name = name;
  const size = data.getTextString('size');
  if (size) font.size = parseFloat(size);
  const style = data.getTextString('style');
  if (style) font.style = parseInt(style, 10);
  return font;
}

export function saveFontToXML(font: BSBFont): Element {
  const elem = new Element('font');
  elem.addElement('name').setText(font.name);
  elem.addElement('size').setText(String(font.size));
  elem.addElement('style').setText(String(font.style));
  return elem;
}

export class BSBKnob extends BSBWidget {
  knobWidth = 60;
  valueDisplayEnabled = true;
  randomizable = true;
  label = 'label';
  labelEnabled = false;
  labelFont: BSBFont = { name: 'Roboto', size: 12, style: 0 };

  loadFromXML(data: Element): void {
    this.loadFromXMLCommon(data);
    const w = data.getTextString('knobWidth');
    if (w) this.knobWidth = parseInt(w, 10);
    const vde = data.getElement('valueDisplayEnabled');
    if (vde) this.valueDisplayEnabled = vde.getTextString() === 'true';
    const rand = data.getElement('randomizable');
    if (rand) this.randomizable = rand.getTextString() === 'true';
    const lbl = data.getTextString('label');
    if (lbl !== null) this.label = lbl;
    const le = data.getElement('labelEnabled');
    if (le) this.labelEnabled = le.getTextString() === 'true';
    const fontElem = data.getElement('font');
    if (fontElem) this.labelFont = loadFontFromXML(fontElem);
  }

  randomize(): void {
    if (!this.randomizable) return;
    this.value = this.minimum + Math.random() * (this.maximum - this.minimum);
  }
}
