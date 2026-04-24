import React from 'react';
import type {
  BlueSynthBuilderInstrumentSnapshot,
  BsbInterfacePatch,
  InstrumentPatch,
} from '../../../../../../shared/project-editor';

interface BSBInterfaceCanvasProps {
  instrument: BlueSynthBuilderInstrumentSnapshot;
  selectedWidgetId: string | null;
  editEnabled: boolean;
  onWidgetSelect: (widgetId: string | null) => void;
  onBsbInterfacePatch: (patch: BsbInterfacePatch) => void;
  onInstrumentPatch: (patch: InstrumentPatch) => void | Promise<void>;
}

export default function BSBInterfaceCanvas({
  instrument,
  selectedWidgetId,
  editEnabled,
  onWidgetSelect,
  onBsbInterfacePatch,
}: BSBInterfaceCanvasProps): React.ReactElement {
  if (!instrument.widgetTree) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-blue-muted">
        No interface widgets available.
      </div>
    );
  }

  return (
    <div
      className="relative h-full w-full overflow-auto bg-[#0a0f1a]"
      onClick={() => onWidgetSelect(null)}
    >
      <div className="relative" style={{ minHeight: 400, minWidth: 600 }}>
        {renderWidgetNodes(
          instrument.widgetTree,
          selectedWidgetId,
          editEnabled,
          onWidgetSelect,
          onBsbInterfacePatch,
        )}
      </div>
    </div>
  );
}

function renderWidgetNodes(
  node: import('../../../../../../shared/project-editor').BsbWidgetNodeSnapshot,
  selectedWidgetId: string | null,
  editEnabled: boolean,
  onWidgetSelect: (id: string) => void,
  onBsbInterfacePatch: (patch: BsbInterfacePatch) => void,
): React.ReactNode {
  const children: React.ReactNode[] = [];

  const visit = (n: import('../../../../../../shared/project-editor').BsbWidgetNodeSnapshot): void => {
    const isSelected = n.id === selectedWidgetId;
    const isPreserved = n.preservedOnly;

    children.push(
      <div
        key={n.id}
        data-widget-id={n.id}
        data-widget-type={n.type}
        className={[
          'absolute cursor-default select-none',
          isSelected && editEnabled ? 'ring-2 ring-blue-accent' : '',
          isPreserved ? 'opacity-60' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          left: n.x,
          top: n.y,
          width: n.width || 60,
          height: n.height || 24,
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (editEnabled) onWidgetSelect(n.id);
        }}
        title={isPreserved ? `[Preserved] ${n.objectName || n.type}` : n.objectName || n.type}
      >
        <div className="pointer-events-none flex h-full w-full items-center justify-center overflow-hidden rounded border border-blue-border/40 bg-blue-surface/30 text-[10px] text-blue-muted">
          {n.objectName || n.type}
          {isPreserved && <span className="ml-1 text-yellow-500">[?]</span>}
        </div>
      </div>,
    );

    if (n.children) {
      for (const child of n.children) {
        visit(child);
      }
    }
  };

  if (node.children) {
    for (const child of node.children) {
      visit(child);
    }
  }

  return <>{children}</>;
}
