/**
 * BSBLineObject — line/drawing element.
 * Does not contribute replacement values — visual only.
 */
import { Element } from '../../serialization/xml-reader';
import { BSBWidget } from './bsb-widget';

export class BSBLineObject extends BSBWidget {
  x2 = 0;
  y2 = 0;
  lineColor = 0x000000;
  lineWidth = 1;

  loadFromXML(data: Element): void {
    this.loadFromXMLCommon(data);
    const x2 = data.getTextString('x2');
    if (x2) this.x2 = parseInt(x2, 10);
    const y2 = data.getTextString('y2');
    if (y2) this.y2 = parseInt(y2, 10);
    const color = data.getTextString('lineColor');
    if (color) this.lineColor = parseInt(color, 10);
    const width = data.getTextString('lineWidth');
    if (width) this.lineWidth = parseInt(width, 10);
  }
}
