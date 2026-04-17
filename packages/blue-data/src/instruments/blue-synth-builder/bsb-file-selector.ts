/**
 * BSBFileSelector — file path selector widget.
 * Implements StringChannelProvider in Java (provides gS_blue_strN globals).
 * When stringChannelEnabled is true, this widget contributes a StringChannel
 * to the CSD output.
 */
import { Element } from '../../serialization/xml-reader';
import { BSBWidget } from './bsb-widget';
import { BSBCompilationUnit } from './bsb-compilation-unit';
import { Parameter } from '../../automation/parameter';

/**
 * StringChannel — represents a string variable in CSD.
 * Used by BSBFileSelector widgets to pass file paths to Csound instruments.
 */
export interface StringChannel {
  objectName: string;
  value: string;
  channelName: string | null; // Set during CSD generation (e.g., "gS_blue_str0")
}

export class BSBFileSelector extends BSBWidget {
  selectedPath = '';
  stringChannelEnabled = false;
  private stringChannel: StringChannel = {
    objectName: '',
    value: '',
    channelName: null,
  };

  loadFromXML(data: Element): void {
    this.loadFromXMLCommon(data);
    // Java stores as <fileName> in the XML
    const fileName = data.getTextString('fileName');
    if (fileName !== null) this.selectedPath = fileName;
    const scEnabled = data.getTextString('stringChannelEnabled');
    if (scEnabled) this.stringChannelEnabled = scEnabled === 'true';
    this.syncStringChannel();
  }

  override loadFromXMLCommon(data: Element): void {
    super.loadFromXMLCommon(data);
    this.syncStringChannel();
  }

  override collectReplacements(
    unit: BSBCompilationUnit,
    _parameters?: Parameter[],
  ): void {
    const fileNameValue = this.selectedPath.replace(/\\/g, '/');

    if (this.stringChannelEnabled && this.stringChannel.channelName) {
      this.stringChannel.value = fileNameValue;
      unit.addReplacementValue(this.objectName, this.stringChannel.channelName);
      return;
    }

    unit.addReplacementValue(this.objectName, fileNameValue);
  }

  /**
   * Get this widget as a StringChannel if enabled.
   */
  getStringChannel(): StringChannel | null {
    if (!this.stringChannelEnabled) return null;
    this.syncStringChannel();
    return this.stringChannel;
  }

  private syncStringChannel(): void {
    this.stringChannel.objectName = this.objectName;
    this.stringChannel.value = this.selectedPath.replace(/\\/g, '/');
  }
}
