import { forwardRef } from 'react';
import type { IDockviewPanelProps } from 'dockview';
import { PANEL_MAP } from './panel-registry';
import PlaceholderPanel from './panels/PlaceholderPanel';
import GlobalOrchestraPanel from './panels/GlobalOrchestraPanel';
import GlobalScorePanel from './panels/GlobalScorePanel';
import OrchestraPanel from './panels/OrchestraPanel';
import ProjectPropertiesPanel from './panels/ProjectPropertiesPanel';
import TablesPanel from './panels/TablesPanel';
import UserDefinedOpcodePanel from './panels/UserDefinedOpcodePanel';
import OutputPanel from './panels/output/OutputPanel';

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
          {descriptor.id === 'OrchestraTopComponent' ? (
            <OrchestraPanel />
          ) : descriptor.id === 'GlobalOrchestraTopComponent' ? (
            <GlobalOrchestraPanel />
          ) : descriptor.id === 'GlobalScoreTopComponent' ? (
            <GlobalScorePanel />
          ) : descriptor.id === 'ProjectPropertiesTopComponent' ? (
            <ProjectPropertiesPanel />
          ) : descriptor.id === 'TablesTopComponent' ? (
            <TablesPanel />
          ) : descriptor.id === 'UserDefinedOpcodeTopComponent' ? (
            <UserDefinedOpcodePanel />
          ) : descriptor.id === 'OutputTopComponent' ? (
            <OutputPanel />
          ) : (
            <PlaceholderPanel descriptor={descriptor} showHeader={false} />
          )}
        </div>
      </div>
    );
  },
);

export default DockviewPanel;
