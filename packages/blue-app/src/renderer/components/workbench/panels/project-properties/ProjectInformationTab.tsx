import React from 'react';
import { FieldRow, InputBase, SectionCard, TextAreaBase } from './ProjectPropertyFields';
import type { ProjectPropertiesTabProps } from './types';

export default function ProjectInformationTab({
  disabled,
  properties,
  updateProjectProperties,
}: ProjectPropertiesTabProps): React.ReactElement {
  return (
    <div className="space-y-4">
      <SectionCard
        title="Project Information"
        description="Basic metadata for the current project."
      >
        <FieldRow label="Title">
          <InputBase
            disabled={disabled}
            value={properties.title}
            onChange={(title) => updateProjectProperties({ title })}
          />
        </FieldRow>
        <FieldRow label="Author">
          <InputBase
            disabled={disabled}
            value={properties.author}
            onChange={(author) => updateProjectProperties({ author })}
          />
        </FieldRow>
        <FieldRow label="Notes">
          <TextAreaBase
            disabled={disabled}
            value={properties.notes}
            onChange={(notes) => updateProjectProperties({ notes })}
            placeholder="Project notes"
          />
        </FieldRow>
      </SectionCard>
    </div>
  );
}
