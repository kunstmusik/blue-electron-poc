import { Element } from "../../serialization/xml-reader";
import { Preset } from "./preset";

export class PresetGroup {
  presetGroupName = "Presets";
  subGroups: PresetGroup[] = [];
  presets: Preset[] = [];
  currentPresetUniqueId = "";
  currentPresetModified = false;

  getPresetGroupName(): string {
    return this.presetGroupName;
  }

  setPresetGroupName(name: string): void {
    this.presetGroupName = name;
  }

  getSubGroups(): PresetGroup[] {
    return [...this.subGroups];
  }

  getPresets(): Preset[] {
    return [...this.presets];
  }

  getCurrentPresetUniqueId(): string {
    return this.currentPresetUniqueId;
  }

  setCurrentPresetUniqueId(id: string): void {
    this.currentPresetUniqueId = id;
  }

  isCurrentPresetModified(): boolean {
    return this.currentPresetModified;
  }

  setCurrentPresetModified(modified: boolean): void {
    this.currentPresetModified = modified;
  }

  findPresetByUniqueId(uniqueId: string): Preset | null {
    for (const preset of this.presets) {
      if (preset.getUniqueId() === uniqueId) return preset;
    }
    for (const sub of this.subGroups) {
      const found = sub.findPresetByUniqueId(uniqueId);
      if (found) return found;
    }
    return null;
  }

  saveAsXML(): Element {
    const elem = new Element("presetGroup");
    elem.setAttribute("name", this.presetGroupName);
    if (this.currentPresetUniqueId) {
      elem.setAttribute("currentPresetUniqueId", this.currentPresetUniqueId);
    }
    elem.setAttribute("currentPresetModified", this.currentPresetModified.toString());
    for (const preset of this.presets) {
      elem.addElement(preset.saveAsXML());
    }
    for (const subGroup of this.subGroups) {
      elem.addElement(subGroup.saveAsXML());
    }
    return elem;
  }

  static loadFromXML(data: Element): PresetGroup {
    const group = new PresetGroup();
    group.presetGroupName = data.getAttribute("name") ?? "Presets";
    group.currentPresetUniqueId = data.getAttribute("currentPresetUniqueId") ?? "";
    const modified = data.getAttribute("currentPresetModified");
    group.currentPresetModified = modified === "true";

    const presetElems = data.getElements("preset");
    while (presetElems.hasMoreElements()) {
      group.presets.push(Preset.loadFromXML(presetElems.next()));
    }

    const subGroupElems = data.getElements("presetGroup");
    while (subGroupElems.hasMoreElements()) {
      group.subGroups.push(PresetGroup.loadFromXML(subGroupElems.next()));
    }

    return group;
  }
}
