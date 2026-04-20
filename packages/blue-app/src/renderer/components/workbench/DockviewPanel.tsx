import { forwardRef } from 'react';
import type { IDockviewPanelProps } from 'dockview';
import { PANEL_MAP } from './panel-registry';
import PlaceholderPanel from './panels/PlaceholderPanel';
import GlobalOrchestraPanel from './panels/GlobalOrchestraPanel';
import GlobalScorePanel from './panels/GlobalScorePanel';
import ProjectPropertiesPanel from './panels/ProjectPropertiesPanel';

const DockviewPanel = forwardRef<HTMLDivElement, IDockviewPanelProps>(
  function DockviewPanel(props, ref) {
    const descriptor = PANEL_MAP.get(props.api.id);

    if (!descriptor) {
      return (
        <div ref={ref} className="h-full bg-blue-bg flex items-center justify-center text-blue-muted">
          Unknown panel: {props.api.title}
        </div>
      );
    }

    return (
      <div ref={ref} className="workbench-panel-shell">
        <div className="workbench-panel-shell__content">
          {descriptor.id === 'GlobalOrchestraTopComponent' ? (
            <GlobalOrchestraPanel />
          ) : descriptor.id === 'GlobalScoreTopComponent' ? (
            <GlobalScorePanel />
          ) : descriptor.id === 'ProjectPropertiesTopComponent' ? (
            <ProjectPropertiesPanel />
          ) : (
            <PlaceholderPanel descriptor={descriptor} showHeader={false} />
          )}
        </div>
      </div>
    );
  },
);

export default DockviewPanel;
