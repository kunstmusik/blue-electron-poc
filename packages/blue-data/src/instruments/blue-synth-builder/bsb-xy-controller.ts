/**
 * BSBXYController — 2D XY pad controller.
 * Mirrors the Java BSBXYController class.
 */
import { Element } from '../../serialization/xml-reader';
import { BSBWidget } from './bsb-widget';
import { BSBCompilationUnit } from './bsb-compilation-unit';
import { formatBlueNumber } from '../../utilities/number-format';

export class BSBXYController extends BSBWidget {
  xValue = 0.5;
  yValue = 0.5;
  xMinimum = 0;
  xMaximum = 1;
  yMinimum = 0;
  yMaximum = 1;

  /** XY controllers contribute two replacement values: X and Y */
  override collectReplacements(unit: BSBCompilationUnit): void {
    const xName = this.parameterName ? `${this.parameterName}_X` : `${this.objectName}_X`;
    const yName = this.parameterName ? `${this.parameterName}_Y` : `${this.objectName}_Y`;
    unit.addReplacementValue(xName, formatBlueNumber(this.xValue));
    unit.addReplacementValue(yName, formatBlueNumber(this.yValue));
  }

  loadFromXML(data: Element): void {
    this.loadFromXMLCommon(data);
    const xv = data.getTextString('xValue');
    if (xv) this.xValue = parseFloat(xv);
    const yv = data.getTextString('yValue');
    if (yv) this.yValue = parseFloat(yv);
    const xmin = data.getTextString('xMinimum');
    if (xmin) this.xMinimum = parseFloat(xmin);
    const xmax = data.getTextString('xMaximum');
    if (xmax) this.xMaximum = parseFloat(xmax);
    const ymin = data.getTextString('yMinimum');
    if (ymin) this.yMinimum = parseFloat(ymin);
    const ymax = data.getTextString('yMaximum');
    if (ymax) this.yMaximum = parseFloat(ymax);
  }
}
