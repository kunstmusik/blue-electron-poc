/**
 * BSBGraphicInterface — root container for the BSB widget tree.
 * Mirrors the Java BSBGraphicInterface class.
 *
 * Holds the root BSBGroup and delegates replacement collection to it.
 */
import { Element } from "../../serialization/xml-reader";
import { BSBCompilationUnit } from "./bsb-compilation-unit";
import { BSBGroup, loadBsbWidgetFromXML } from "./bsb-group";
import { BSBWidget } from "./bsb-widget";
import { Parameter } from "../../automation/parameter";

export type GridStyle = "NONE" | "DOT" | "LINE";

export interface GridSettingsData {
  enabled: boolean;
  snapEnabled: boolean;
  width: number;
  height: number;
  gridStyle: GridStyle;
}

function createDefaultGridSettings(): GridSettingsData {
  return { enabled: false, snapEnabled: true, width: 10, height: 10, gridStyle: "DOT" };
}

let _nextWidgetId = 1;

function assignWidgetIds(widgets: BSBWidget[]): void {
  for (const w of widgets) {
    if (!w.id) w.id = `w${_nextWidgetId++}`;
    if (w instanceof BSBGroup) {
      assignWidgetIds(w.getChildren());
    }
  }
}

export class BSBGraphicInterface {
  rootGroup = new BSBGroup();
  gridSettingsRaw = "";
  gridSettingsData: GridSettingsData = createDefaultGridSettings();
  editEnabled = true;

  getRootGroup(): BSBGroup {
    return this.rootGroup;
  }

  getGridSettings(): GridSettingsData {
    return this.gridSettingsData;
  }

  setGridSettings(settings: Partial<GridSettingsData>): void {
    this.gridSettingsData = { ...this.gridSettingsData, ...settings };
    this.gridSettingsRaw = "";
  }

  isEditEnabled(): boolean {
    return this.editEnabled;
  }

  setEditEnabled(enabled: boolean): void {
    this.editEnabled = enabled;
  }

  collectReplacements(
    unit: BSBCompilationUnit,
    parameters?: Parameter[],
  ): void {
    this.rootGroup.collectReplacements(unit, parameters);
  }

  loadFromXML(data: Element): void {
    const editEnabledAttr = data.getAttribute("editEnabled");
    if (editEnabledAttr !== null) this.editEnabled = editEnabledAttr === "true";

    this.loadGridSettings(data);

    const bsbObjects = data.getElements("bsbObject");
    while (bsbObjects.hasMoreElements()) {
      const objElem = bsbObjects.next();
      const widget = loadBsbWidgetFromXML(objElem);
      if (widget) {
        if (widget instanceof BSBGroup) {
          this.rootGroup = widget;
        } else {
          this.rootGroup.addChild(widget);
        }
      }
    }
    assignWidgetIds(this.rootGroup.getChildren());
  }

  private loadGridSettings(data: Element): void {
    const gsElem = data.getElement("gridSettings");
    if (!gsElem) {
      this.gridSettingsData = createDefaultGridSettings();
      this.gridSettingsRaw = "";
      return;
    }

    this.gridSettingsRaw = gsElem.toXml();

    const width = gsElem.getTextString("width");
    const height = gsElem.getTextString("height");
    const snapEnabled = gsElem.getTextString("snapGridEnabled");
    const gridStyle = gsElem.getTextString("gridStyle");

    this.gridSettingsData = {
      enabled: gridStyle ? gridStyle !== "NONE" : false,
      snapEnabled: snapEnabled === "true",
      width: width ? parseInt(width, 10) : 10,
      height: height ? parseInt(height, 10) : 10,
      gridStyle: (gridStyle as GridStyle) || "NONE",
    };
  }

  saveAsXML(): Element {
    const elem = new Element("graphicInterface");
    elem.setAttribute("editEnabled", this.editEnabled.toString());

    if (this.gridSettingsRaw) {
      elem.addElement(Element.parse(this.gridSettingsRaw));
    } else {
      const gsElem = new Element("gridSettings");
      gsElem.addElement("width").setText(String(this.gridSettingsData.width));
      gsElem.addElement("height").setText(String(this.gridSettingsData.height));
      gsElem.addElement("gridStyle").setText(this.gridSettingsData.gridStyle);
      gsElem.addElement("snapGridEnabled").setText(this.gridSettingsData.snapEnabled.toString());
      elem.addElement(gsElem);
    }

    elem.addElement(this.rootGroup.saveAsXML());
    return elem;
  }

  findWidgetById(id: string): BSBWidget | null {
    const visit = (widgets: BSBWidget[]): BSBWidget | null => {
      for (const w of widgets) {
        if (w.id === id) return w;
        if (w instanceof BSBGroup) {
          const found = visit(w.getChildren());
          if (found) return found;
        }
      }
      return null;
    };
    return visit(this.rootGroup.getChildren());
  }
}
