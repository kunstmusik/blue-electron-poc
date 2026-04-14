/**
 * BSBGraphicInterface — root container for the BSB widget tree.
 * Mirrors the Java BSBGraphicInterface class.
 *
 * Holds the root BSBGroup and delegates replacement collection to it.
 */
import { Element } from '../../serialization/xml-reader';
import { BSBCompilationUnit } from './bsb-compilation-unit';
import { BSBGroup } from './bsb-group';
import { Parameter } from '../../automation/parameter';

export class BSBGraphicInterface {
  rootGroup = new BSBGroup();
  gridSettings = '';

  getRootGroup(): BSBGroup { return this.rootGroup; }

  /**
   * Walk the entire widget tree and collect all replacement values.
   */
  collectReplacements(unit: BSBCompilationUnit, parameters?: Parameter[]): void {
    this.rootGroup.collectReplacements(unit, parameters);
  }

  async loadFromXML(data: Element): Promise<void> {
    const gridSettings = data.getTextString('gridSettings');
    if (gridSettings) this.gridSettings = gridSettings;

    // The root group is stored as a nested <bsbObject type="BSBGroup">
    const bsbObjects = data.getElements('bsbObject');
    while (bsbObjects.hasMoreElements()) {
      const objElem = bsbObjects.next();
      await this.rootGroup.loadFromXML(objElem);
    }
  }
}
