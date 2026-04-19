import type {
  AuxiliaryEdge,
  MinimizedTabState,
} from './auxiliary-layout';
import { getAuxiliaryRailLabel } from './auxiliary-layout';

interface AuxiliaryRailProps {
  edge: AuxiliaryEdge;
  tabs: MinimizedTabState[];
  onSelect: (panelId: string) => void;
}

export default function AuxiliaryRail({
  edge,
  tabs,
  onSelect,
}: AuxiliaryRailProps) {
  return (
    <nav
      className={`workbench-edge-rail workbench-edge-rail--${edge}`}
      aria-label={`${edge} minimized auxiliary tabs`}
    >
      {tabs.map((tab) => (
        <button
          key={`${tab.groupId}:${tab.panelId}`}
          type="button"
          className={[
            'workbench-edge-rail__button',
            `workbench-edge-rail__button--${edge}`,
            tab.isActivePanel ? 'is-active' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={() => onSelect(tab.panelId)}
          title={getAuxiliaryRailLabel(tab.panelId)}
          aria-pressed={tab.isActivePanel}
        >
          <span className="workbench-edge-rail__label">
            {getAuxiliaryRailLabel(tab.panelId)}
          </span>
        </button>
      ))}
    </nav>
  );
}
