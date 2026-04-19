import type { AuxiliaryEdge } from './auxiliary-layout';
import { getAuxiliaryRailLabel } from './auxiliary-layout';
import { getPanel } from './panel-registry';

interface AuxiliaryRailProps {
  edge: AuxiliaryEdge;
  panelIds: string[];
  activePanelId: string;
  onSelect: (panelId: string) => void;
}

export default function AuxiliaryRail({
  edge,
  panelIds,
  activePanelId,
  onSelect,
}: AuxiliaryRailProps) {
  const descriptors = panelIds
    .map((panelId) => getPanel(panelId))
    .filter((panel): panel is NonNullable<typeof panel> => panel != null);

  return (
    <nav
      className={`workbench-edge-rail workbench-edge-rail--${edge}`}
      aria-label={`${edge} auxiliary panels`}
    >
      {descriptors.map((descriptor) => {
        const isActive = descriptor.id === activePanelId;

        return (
          <button
            key={descriptor.id}
            type="button"
            className={[
              'workbench-edge-rail__button',
              `workbench-edge-rail__button--${edge}`,
              isActive ? 'is-active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => onSelect(descriptor.id)}
            title={descriptor.title}
            aria-pressed={isActive}
          >
            <span className="workbench-edge-rail__label">
              {getAuxiliaryRailLabel(descriptor.id)}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
