import { Element } from "../../serialization/xml-reader";

export class Preset {
  presetName = "";
  uniqueId = "";
  private _valuesMap = new Map<string, string>();

  getPresetName(): string {
    return this.presetName;
  }

  setPresetName(name: string): void {
    this.presetName = name;
  }

  getUniqueId(): string {
    return this.uniqueId;
  }

  getValuesMap(): Map<string, string> {
    return new Map(this._valuesMap);
  }

  setValuesMap(values: Map<string, string>): void {
    this._valuesMap = new Map(values);
  }

  getValue(objectName: string): string | undefined {
    return this._valuesMap.get(objectName);
  }

  setValue(objectName: string, value: string): void {
    this._valuesMap.set(objectName, value);
  }

  updatePresets(gInterface: any): void {
    this._valuesMap.clear();
    const visit = (widgets: any[]): void => {
      for (const widget of widgets) {
        if (widget.objectName) {
          const value = typeof widget.getPresetValue === 'function' 
            ? widget.getPresetValue() 
            : (widget.value !== undefined ? String(widget.value) : null);
          if (value !== null && value !== undefined) {
            this._valuesMap.set(widget.objectName, value);
          }
        }
        if (widget.getChildren && typeof widget.getChildren === 'function') {
          visit(widget.getChildren());
        }
      }
    };
    visit(gInterface.getRootGroup().getChildren());
  }

  saveAsXML(): Element {
    const elem = new Element("preset");
    elem.setAttribute("name", this.presetName);
    elem.setAttribute("uniqueId", this.uniqueId);
    const sortedKeys = [...this._valuesMap.keys()].sort();
    for (const key of sortedKeys) {
      const setting = elem.addElement("setting");
      setting.setAttribute("name", key);
      setting.setText(this._valuesMap.get(key) ?? "");
    }
    return elem;
  }

  static loadFromXML(data: Element): Preset {
    const preset = new Preset();
    preset.presetName = data.getAttribute("name") ?? "";
    preset.uniqueId = data.getAttribute("uniqueId") ?? "";
    const settings = data.getElements("setting");
    while (settings.hasMoreElements()) {
      const setting = settings.next();
      const name = setting.getAttribute("name");
      const value = setting.getTextString();
      if (name) {
        preset._valuesMap.set(name, value ?? "");
      }
    }
    return preset;
  }
}
