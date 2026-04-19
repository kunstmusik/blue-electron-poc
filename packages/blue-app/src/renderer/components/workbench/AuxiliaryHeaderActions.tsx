import type { IDockviewHeaderActionsProps } from 'dockview';
import { PinOff } from 'lucide-react';
import { getAuxiliaryGroupIdForPanel } from './auxiliary-layout';
import { useWorkbenchStore } from '../../stores/workbench-store';

export default function AuxiliaryHeaderActions(
  props: IDockviewHeaderActionsProps,
) {
  const minimizeAuxiliaryGroup = useWorkbenchStore(
    (state) => state.minimizeAuxiliaryGroup,
  );

  const activePanelId = props.activePanel?.id;
  const groupId = activePanelId
    ? getAuxiliaryGroupIdForPanel(activePanelId)
    : undefined;

  if (!groupId) {
    return null;
  }

  return (
    <div className="workbench-aux-header-actions">
      <button
        type="button"
        className="workbench-aux-header-action"
        title="Minimize tool window group"
        aria-label="Minimize tool window group"
        onClick={() => minimizeAuxiliaryGroup(groupId)}
      >
        <PinOff size={14} strokeWidth={1.9} />
      </button>
    </div>
  );
}
