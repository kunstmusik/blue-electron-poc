/**
 * BSBGraphicInterface — root container for the BSB widget tree.
 * Mirrors the Java BSBGraphicInterface class.
 *
 * Holds the root BSBGroup and delegates replacement collection to it.
 */
import { Element } from "../../serialization/xml-reader";
import { BSBCompilationUnit } from "./bsb-compilation-unit";
import { BSBGroup, loadBsbWidgetFromXML } from "./bsb-group";
import { Parameter } from "../../automation/parameter";

export class BSBGraphicInterface {
  rootGroup = new BSBGroup();
  gridSettings = "";

  getRootGroup(): BSBGroup {
    return this.rootGroup;
  }

  /**
   * Walk the entire widget tree and collect all replacement values.
   */
  collectReplacements(
    unit: BSBCompilationUnit,
    parameters?: Parameter[],
  ): void {
    this.rootGroup.collectReplacements(unit, parameters);
  }

  loadFromXML(data: Element): void {
    const gridSettings = data.getTextString("gridSettings");
    if (gridSettings) this.gridSettings = gridSettings;

    const bsbObjects = data.getElements("bsbObject");
    while (bsbObjects.hasMoreElements()) {
      const objElem = bsbObjects.next();
      const widget = loadBsbWidgetFromXML(objElem);
      if (widget) {
        this.rootGroup.addChild(widget);
      }
    }
  }

  saveAsXML(): Element {
    const elem = new Element("graphicInterface");
    if (this.gridSettings) {
      elem.addElement("gridSettings").setText(this.gridSettings);
    }
    for (const child of this.rootGroup.getChildren()) {
      elem.addElement(child instanceof BSBGroup ? child.saveAsXML() : this.saveWidget(child));
    }
    return elem;
  }

  private saveWidget(widget: import("./bsb-widget").BSBWidget): Element {
    const tempGroup = new BSBGroup();
    tempGroup.addChild(widget);
    return tempGroup.saveAsXML().getElement("bsbObject") ?? new Element("bsbObject");
  }
}
