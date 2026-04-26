import React, { useState, useCallback, useEffect } from 'react';
import type {
  BlueSynthBuilderInstrumentSnapshot,
  BsbInterfacePatch,
  InstrumentPatch,
} from '../../../../../../shared/project-editor';
import BSBInterfaceCanvas from './BSBInterfaceCanvas';
import BSBPropertySheet from './BSBPropertySheet';
import BSBGridSettingsPanel from './BSBGridSettingsPanel';
import BSBPresetBar from './BSBPresetBar';
import BSBWidgetEditor from './BSBWidgetEditor';
import type { BsbWidgetNodeSnapshot } from '../../../../../../shared/project-editor';

interface BSBInterfaceEditorProps {
  instrument: BlueSynthBuilderInstrumentSnapshot;
  onInstrumentPatch: (patch: InstrumentPatch) => void | Promise<void>;
}

type RightPanelTab = 'properties' | 'grid';

export default function BSBInterfaceEditor({
  instrument,
  onInstrumentPatch,
}: BSBInterfaceEditorProps) {
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [rightTab, setRightTab] = useState<RightPanelTab>('properties');

  const editEnabled = instrument.editEnabled;

  const selectedWidget = findWidgetInTree(instrument.widgetTree, selectedWidgetId);

  const dispatchBsbPatch = useCallback(
    (patch: BsbInterfacePatch) => {
      void onInstrumentPatch({ bsbInterface: patch });
    },
    [onInstrumentPatch],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'e' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        dispatchBsbPatch({ type: 'setEditEnabled', value: !instrument.editEnabled });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dispatchBsbPatch, instrument.editEnabled]);

  const hasWidgets = instrument.widgetTree?.children && instrument.widgetTree.children.length > 0;

  return (
    <div className="flex h-full min-h-0 flex-col bg-blue-bg">
      <div className="flex items-center justify-between border-b border-blue-border px-3 py-1">
        <BSBPresetBar instrument={instrument} onBsbInterfacePatch={dispatchBsbPatch} />
        <label className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap text-xs text-gray-100">
          <input
            type="checkbox"
            checked={editEnabled}
            onChange={(e) =>
              dispatchBsbPatch({ type: 'setEditEnabled', value: e.target.checked })
            }
            className="accent-blue-accent"
          />
          Edit Mode
        </label>
      </div>

      {!hasWidgets && (
        <div className="flex-1 p-4">
          <div className="rounded-lg border border-blue-border bg-blue-surface/50 px-4 py-3">
            <div className="text-sm font-medium text-gray-100">Interface</div>
            <div className="mt-1 text-sm text-blue-muted">
              No widgets found in this instrument's graphic interface.
              Use the widget editor below to adjust existing widget values.
            </div>
          </div>
          <BSBWidgetEditor
            widgets={instrument.widgets}
            onInstrumentPatch={onInstrumentPatch}
          />
        </div>
      )}

      {hasWidgets && (
        <div className="flex min-h-0 flex-1">
          <div className="min-w-0 flex-1">
            <BSBInterfaceCanvas
              instrument={instrument}
              selectedWidgetId={selectedWidgetId}
              editEnabled={editEnabled}
              onWidgetSelect={setSelectedWidgetId}
              onBsbInterfacePatch={dispatchBsbPatch}
              onInstrumentPatch={onInstrumentPatch}
            />
          </div>

          {editEnabled && (
            <div className="flex w-56 flex-col border-l border-blue-border bg-[#0d1524]">
              <div className="border-b border-blue-border">
                <div className="flex">
                  <button
                    type="button"
                    className={[
                      'flex-1 border-b-2 px-2 py-1.5 text-[10px] uppercase tracking-[0.12em]',
                      rightTab === 'properties'
                        ? 'border-blue-accent text-gray-100'
                        : 'border-transparent text-blue-muted hover:text-gray-100',
                    ].join(' ')}
                    onClick={() => setRightTab('properties')}
                  >
                    Properties
                  </button>
                  <button
                    type="button"
                    className={[
                      'flex-1 border-b-2 px-2 py-1.5 text-[10px] uppercase tracking-[0.12em]',
                      rightTab === 'grid'
                        ? 'border-blue-accent text-gray-100'
                        : 'border-transparent text-blue-muted hover:text-gray-100',
                    ].join(' ')}
                    onClick={() => setRightTab('grid')}
                  >
                    Grid
                  </button>
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                {rightTab === 'properties' ? (
                  <BSBPropertySheet
                    widget={selectedWidget}
                    editEnabled={editEnabled}
                    onBsbInterfacePatch={dispatchBsbPatch}
                  />
                ) : (
                  <BSBGridSettingsPanel
                    gridSettings={instrument.gridSettings}
                    onBsbInterfacePatch={dispatchBsbPatch}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function findWidgetInTree(
  tree: import('../../../../../../shared/project-editor').BsbWidgetNodeSnapshot | null,
  widgetId: string | null,
): BsbWidgetNodeSnapshot | null {
  if (!tree || !widgetId) return null;

  const visit = (node: import('../../../../../../shared/project-editor').BsbWidgetNodeSnapshot): BsbWidgetNodeSnapshot | null => {
    if (node.id === widgetId) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = visit(child);
        if (found) return found;
      }
    }
    return null;
  };

  if (tree.children) {
    for (const child of tree.children) {
      const found = visit(child);
      if (found) return found;
    }
  }
  return null;
}
