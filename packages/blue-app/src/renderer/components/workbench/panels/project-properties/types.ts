import type { ProjectPropertiesSnapshot } from '../../../../../shared/project-editor';

export interface ProjectPropertiesTabProps {
  disabled: boolean;
  properties: ProjectPropertiesSnapshot;
  updateProjectProperties: (
    patch: Partial<ProjectPropertiesSnapshot>,
  ) => void | Promise<void>;
}
