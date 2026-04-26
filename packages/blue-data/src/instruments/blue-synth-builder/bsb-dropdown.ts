/**
 * BSBDropdown — dropdown selection list widget.
 * Mirrors the Java BSBDropdown class.
 */
import { Element } from '../../serialization/xml-reader';
import { BSBWidget } from './bsb-widget';
import { BSBCompilationUnit } from './bsb-compilation-unit';

export interface BSBDropdownItem {
  name: string;
  value: string;
  uniqueId: string;
}

export class BSBDropdown extends BSBWidget {
  selectedIndex = 0;
  fontSize = 12;
  randomizable = true;
  dropdownItems: BSBDropdownItem[] = [];

  override getPresetValue(): string {
    return `ver2:${this.selectedIndex}`;
  }

  override setPresetValue(val: string): void {
    if (val.startsWith("ver2:")) {
      const parsed = parseInt(val.substring(5), 10);
      if (Number.isFinite(parsed)) {
        this.setValue(parsed);
      }
    } else {
      // Legacy Java Blue: search for item by value
      const idx = this.dropdownItems.findIndex(item => item.value === val);
      if (idx !== -1) {
        this.setValue(idx);
      }
    }
  }

  override setValue(val: number): void {
    this.value = val;
    this.selectedIndex = Math.floor(val);
  }

  override collectReplacements(unit: BSBCompilationUnit): void {
    if (this.dropdownItems.length === 0) {
      unit.addReplacementValue(this.objectName, '0');
      return;
    }
    if (this.automationAllowed) {
      unit.addReplacementValue(this.objectName, String(this.selectedIndex));
      return;
    }
    const item = this.dropdownItems[this.selectedIndex] ?? this.dropdownItems[0];
    unit.addReplacementValue(this.objectName, item?.value ?? '0');
  }

  loadFromXML(data: Element): void {
    this.loadFromXMLCommon(data);
    const idx = data.getTextString('selectedIndex');
    if (idx) this.selectedIndex = parseInt(idx, 10);
    const fs = data.getTextString('fontSize');
    if (fs) this.fontSize = parseInt(fs, 10);
    const rand = data.getElement('randomizable');
    if (rand) this.randomizable = rand.getTextString() === 'true';
    const listElem = data.getElement('bsbDropdownItemList');
    if (listElem) {
      const items = listElem.getElements('bsbDropdownItem');
      while (items.hasMoreElements()) {
        const itemElem = items.next();
        this.dropdownItems.push({
          name: itemElem.getTextString('name') ?? 'name',
          value: itemElem.getTextString('value') ?? 'value',
          uniqueId: itemElem.getAttribute('uniqueId') ?? '',
        });
      }
    }
  }

  randomize(): void {
    if (!this.randomizable || this.dropdownItems.length === 0) return;
    this.selectedIndex = Math.floor(Math.random() * this.dropdownItems.length);
  }
}
