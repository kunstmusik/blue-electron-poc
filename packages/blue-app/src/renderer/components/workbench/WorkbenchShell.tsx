import { useCallback, useEffect, useRef } from 'react';
import {
  DockviewReact,
  DockviewReadyEvent,
} from 'dockview';
import 'dockview/dist/styles/dockview.css';
import AuxiliaryRail from './AuxiliaryRail';
import DockviewPanel from './DockviewPanel';
import { useWorkbenchStore } from '../../stores/workbench-store';

const LAYOUT_STORAGE_KEY = 'blue-workbench-layout';

export default function WorkbenchShell() {
  const auxiliary = useWorkbenchStore((s) => s.auxiliary);
  const openPanel = useWorkbenchStore((s) => s.openPanel);
  const setApi = useWorkbenchStore((s) => s.setApi);
  const listenersRef = useRef<Array<{ dispose: () => void }>>([]);

  const disposeListeners = useCallback(() => {
    for (const disposable of listenersRef.current) {
      disposable.dispose();
    }
    listenersRef.current = [];
  }, []);

  const persistLayout = useCallback(() => {
    const layout = useWorkbenchStore.getState().saveLayout();
    if (layout) {
      localStorage.setItem(LAYOUT_STORAGE_KEY, layout);
    }
  }, []);

  const onReady = useCallback(
    (event: DockviewReadyEvent) => {
      disposeListeners();
      setApi(event.api);
      useWorkbenchStore.getState().loadLayout(
        localStorage.getItem(LAYOUT_STORAGE_KEY),
      );
      useWorkbenchStore.getState().syncAuxiliaryLayout();

      listenersRef.current = [
        event.api.onDidLayoutChange(() => {
          persistLayout();
        }),
        event.api.onDidActivePanelChange(() => {
          useWorkbenchStore.getState().syncAuxiliaryLayout();
          persistLayout();
        }),
      ];

      persistLayout();
    },
    [disposeListeners, persistLayout, setApi],
  );

  useEffect(() => {
    function handleBeforeUnload() {
      persistLayout();
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [persistLayout]);

  useEffect(() => {
    return () => {
      disposeListeners();
      setApi(null);
    };
  }, [disposeListeners, setApi]);

  return (
    <div className="workbench-shell">
      <div
        className="workbench-shell__main dv-dockview-theme-abyss"
        style={{
          backgroundColor: 'var(--dv-paneview-active-border-color, #1a1a2e)',
        }}
      >
        <div className="workbench-shell__dockview">
          <DockviewReact
            onReady={onReady}
            components={{ default: DockviewPanel }}
            hideBorders={false}
          />
        </div>
      </div>

      <AuxiliaryRail
        edge="right"
        panelIds={auxiliary.byEdge.right.panelIds}
        activePanelId={auxiliary.byEdge.right.activePanelId}
        onSelect={openPanel}
      />

      <AuxiliaryRail
        edge="bottom"
        panelIds={auxiliary.byEdge.bottom.panelIds}
        activePanelId={auxiliary.byEdge.bottom.activePanelId}
        onSelect={openPanel}
      />

      <div className="workbench-shell__corner" aria-hidden="true" />
    </div>
  );
}
