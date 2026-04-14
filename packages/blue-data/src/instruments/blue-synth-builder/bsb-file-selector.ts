/**
 * BSBFileSelector — file path selector widget.
 * Implements StringChannelProvider in Java (provides gS_blue_strN globals).
 * When stringChannelEnabled is true, this widget contributes a StringChannel
 * to the CSD output.
 */
import { Element } from '../../serialization/xml-reader';
import { BSBWidget } from './bsb-widget';

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

  loadFromXML(data: Element): void {
    this.loadFromXMLCommon(data);
    // Java stores as <fileName> in the XML
    const fileName = data.getTextString('fileName');
    if (fileName !== null) this.selectedPath = fileName;
    const scEnabled = data.getTextString('stringChannelEnabled');
    if (scEnabled) this.stringChannelEnabled = scEnabled === 'true';
  }

  /**
   * Get this widget as a StringChannel if enabled.
   */
  getStringChannel(): StringChannel | null {
    if (!this.stringChannelEnabled) return null;
    return {
      objectName: this.objectName,
      value: this.selectedPath,
      channelName: null,
    };
  }
}
