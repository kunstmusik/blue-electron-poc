import { forwardRef } from 'react';
import type { IDockviewPanelProps } from 'dockview';
import {
  getAuxiliaryGroupIdForPanel,
  getAuxiliaryRailLabel,
} from './auxiliary-layout';
import { PANEL_MAP } from './panel-registry';
import PlaceholderPanel from './panels/PlaceholderPanel';
import { useWorkbenchStore } from '../../stores/workbench-store';

const DockviewPanel = forwardRef<HTMLDivElement, IDockviewPanelProps>(
  function DockviewPanel(props, ref) {
    const descriptor = PANEL_MAP.get(props.api.id);
    const auxiliary = useWorkbenchStore((s) => s.auxiliary);
    const minimizeAuxiliaryGroup = useWorkbenchStore(
      (s) => s.minimizeAuxiliaryGroup,
    );
    const maximizeAuxiliaryGroup = useWorkbenchStore(
      (s) => s.maximizeAuxiliaryGroup,
    );
    const restoreAuxiliaryGroup = useWorkbenchStore(
      (s) => s.restoreAuxiliaryGroup,
    );
    const groupId = getAuxiliaryGroupIdForPanel(props.api.id);
    const session = groupId ? auxiliary.groups[groupId] : undefined;

    if (!descriptor) {
      return (
        <div ref={ref} className="h-full bg-blue-bg flex items-center justify-center text-blue-muted">
          Unknown panel: {props.api.title}
        </div>
      );
    }

    return (
      <div ref={ref} className="workbench-panel-shell">
        {session ? (
          <div className="workbench-aux-panel__chrome">
            <div className="workbench-aux-panel__meta">
              <span className="workbench-aux-panel__label">
                {getAuxiliaryRailLabel(descriptor.id)}
              </span>
              <span className="workbench-aux-panel__state">
                {session.presentation}
              </span>
            </div>

            <div className="workbench-aux-panel__actions">
              {session.presentation === 'floating' ||
              session.presentation === 'maximized' ? (
                <button
                  type="button"
                  className="workbench-aux-panel__action"
                  onClick={() => restoreAuxiliaryGroup(groupId)}
                >
                  Restore
                </button>
              ) : null}

              {session.presentation !== 'maximized' ? (
                <button
                  type="button"
                  className="workbench-aux-panel__action"
                  onClick={() => maximizeAuxiliaryGroup(groupId)}
                >
                  Maximize
                </button>
              ) : null}

              <button
                type="button"
                className="workbench-aux-panel__action"
                onClick={() => minimizeAuxiliaryGroup(groupId)}
              >
                Minimize
              </button>
            </div>
          </div>
        ) : null}

        <div className="workbench-panel-shell__content">
          <PlaceholderPanel descriptor={descriptor} />
        </div>
      </div>
    );
  },
);

export default DockviewPanel;
