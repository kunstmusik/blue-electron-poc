import React, { useMemo, useState } from 'react';
import { useProjectStore } from '../../../stores/project-store';
import type { ProjectPropertiesTabProps } from './project-properties/types';
import ProjectInformationTab from './project-properties/ProjectInformationTab';
import RealtimeRenderTab from './project-properties/RealtimeRenderTab';
import DiskRenderTab from './project-properties/DiskRenderTab';
import MediaTab from './project-properties/MediaTab';

type ProjectPropertiesTabKey = 'information' | 'realtime' | 'disk' | 'media';

const TAB_ORDER: Array<{
  key: ProjectPropertiesTabKey;
  label: string;
}> = [
  { key: 'information', label: 'Project Information' },
  { key: 'realtime', label: 'Realtime' },
  { key: 'disk', label: 'Disk Render' },
  { key: 'media', label: 'Media' },
];

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}): React.ReactElement {
  return (
    <button
      type="button"
      className={[
        'border-b-2 px-4 py-2 text-sm transition-colors',
        active
          ? 'border-blue-accent text-gray-100'
          : 'border-transparent text-blue-muted hover:text-gray-100',
      ].join(' ')}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function EmptyProjectPropertiesState(): React.ReactElement {
  return (
    <div className="flex h-full items-center justify-center bg-blue-bg px-6 text-center text-blue-muted">
      <div className="max-w-md rounded-lg border border-blue-border bg-blue-surface/70 px-6 py-5">
        <div className="text-sm font-medium text-gray-100">No project loaded</div>
        <div className="mt-2 text-sm">
          Open a project to edit project information, render settings, and media paths.
        </div>
      </div>
    </div>
  );
}

function TabContent({
  tab,
  props,
}: {
  tab: ProjectPropertiesTabKey;
  props: ProjectPropertiesTabProps;
}): React.ReactElement {
  switch (tab) {
    case 'information':
      return <ProjectInformationTab {...props} />;
    case 'realtime':
      return <RealtimeRenderTab {...props} />;
    case 'disk':
      return <DiskRenderTab {...props} />;
    case 'media':
      return <MediaTab {...props} />;
  }
}

export default function ProjectPropertiesPanel(): React.ReactElement {
  const loaded = useProjectStore((state) => state.loaded);
  const projectProperties = useProjectStore((state) => state.projectProperties);
  const updateProjectProperties = useProjectStore(
    (state) => state.updateProjectProperties,
  );
  const [activeTab, setActiveTab] = useState<ProjectPropertiesTabKey>('information');

  const tabProps = useMemo<ProjectPropertiesTabProps>(
    () => ({
      disabled: !loaded,
      properties: projectProperties,
      updateProjectProperties,
    }),
    [loaded, projectProperties, updateProjectProperties],
  );

  if (!loaded) {
    return <EmptyProjectPropertiesState />;
  }

  return (
    <div className="flex h-full flex-col bg-blue-bg text-gray-100">
      <div className="border-b border-blue-border bg-[#10192a]">
        <div className="flex items-center gap-1 overflow-x-auto px-2">
          {TAB_ORDER.map((tab) => (
            <TabButton
              key={tab.key}
              active={activeTab === tab.key}
              label={tab.label}
              onClick={() => setActiveTab(tab.key)}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto p-4">
        <TabContent tab={activeTab} props={tabProps} />
      </div>
    </div>
  );
}
