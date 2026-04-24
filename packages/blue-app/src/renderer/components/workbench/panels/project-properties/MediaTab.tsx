import React from 'react';
import { CheckboxBase, FieldRow, InputBase, SectionCard } from './ProjectPropertyFields';
import type { ProjectPropertiesTabProps } from './types';

export default function MediaTab({
  disabled,
  properties,
  updateProjectProperties,
}: ProjectPropertiesTabProps): React.ReactElement {
  return (
    <div className="space-y-4">
      <SectionCard
        title="Media"
        description="Media folder settings used by imported audio and referenced assets."
      >
        <FieldRow label="Media Folder">
          <InputBase
            disabled={disabled}
            value={properties.mediaFolder}
            onChange={(mediaFolder) => updateProjectProperties({ mediaFolder })}
            placeholder="media"
          />
        </FieldRow>
        <FieldRow label="Copy Imported Media">
          <CheckboxBase
            disabled={disabled}
            checked={properties.copyToMediaFileOnImport}
            onChange={(copyToMediaFileOnImport) =>
              updateProjectProperties({ copyToMediaFileOnImport })
            }
          />
        </FieldRow>
      </SectionCard>
    </div>
  );
}
