/**
 * ProjectUpgrader — abstract base class for version migrations.
 * Mirrors the Java ProjectUpgrader class.
 *
 * Each upgrader specifies the version it upgrades TO, and operates
 * on the raw XML Element before BlueData deserialization.
 */
import { Element } from '../serialization/xml-reader';
import { ProjectVersion } from './project-version';

export abstract class ProjectUpgrader {
  readonly version: ProjectVersion;

  /**
   * @param versionString The version this upgrader migrates TO.
   */
  constructor(versionString: string) {
    this.version = ProjectVersion.parse(versionString);
  }

  /**
   * Perform the upgrade by modifying the XML element in place.
   * @param data The root XML element to modify.
   * @returns true if any modifications were made.
   */
  abstract performUpgrade(data: Element): boolean;
}
