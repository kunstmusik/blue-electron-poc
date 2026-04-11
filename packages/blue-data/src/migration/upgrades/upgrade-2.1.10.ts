/**
 * ProjectUpgrader_2_1_10 — upgrades projects to version 2.1.10.
 * Changes: Parse 0dbfs from global orc and set properties in projectProperties node.
 * Mirrors the Java ProjectUpgrader_2_1_10 class.
 */
import { Element } from '../../serialization/xml-reader';
import { ProjectUpgrader } from '../upgrader';
import { stripSingleLineComments } from '../../utilities/text';

export class ProjectUpgrader_2_1_10 extends ProjectUpgrader {
  constructor() {
    super('2.1.10');
  }

  override performUpgrade(data: Element): boolean {
    const globalOrcScoNode = data.getElement('globalOrcSco');
    const projectPropsNode = data.getElement('projectProperties');

    if (!globalOrcScoNode || !projectPropsNode) {
      return false;
    }

    const globalOrcNode = globalOrcScoNode.getElement('globalOrc');
    if (!globalOrcNode) {
      return false;
    }

    const globalOrc = globalOrcNode.getTextString();
    if (!globalOrc || !globalOrc.includes('0dbfs')) {
      return false;
    }

    const buffer: string[] = [];
    const lines = globalOrc.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('0dbfs') && trimmed.includes('=')) {
        const stripped = stripSingleLineComments(trimmed);
        const eqIdx = stripped.indexOf('=');
        if (eqIdx !== -1) {
          // Extract value and trim any trailing whitespace/semicolons
          let value = stripped.substring(eqIdx + 1).trim();
          // Remove inline comments that might remain
          const commentIdx = value.indexOf(';');
          if (commentIdx !== -1) {
            value = value.substring(0, commentIdx).trim();
          }
          projectPropsNode.addElement('useZeroDbFS').setText('true');
          projectPropsNode.addElement('zeroDbFS').setText(value);
          projectPropsNode.addElement('diskUseZeroDbFS').setText('true');
          projectPropsNode.addElement('diskZeroDbFS').setText(value);
        }
      } else {
        buffer.push(line);
      }
    }

    globalOrcNode.setText(buffer.join('\n'));
    return true;
  }
}
