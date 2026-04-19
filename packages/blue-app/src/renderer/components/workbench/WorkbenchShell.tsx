import { useCallback, useEffect, useRef, type CSSProperties } from 'react';
import {
  DockviewReact,
  DockviewReadyEvent,
} from 'dockview';
import 'dockview/dist/styles/dockview.css';
import AuxiliaryRail from './AuxiliaryRail';
import AuxiliaryHeaderActions from './AuxiliaryHeaderActions';
import AuxiliarySlideout from './AuxiliarySlideout';
import DockviewPanel from './DockviewPanel';
import {
  getAuxiliarySlideoutForEdge,
  getMinimizedTabsForEdge,
} from './auxiliary-layout';
import { useWorkbenchStore } from '../../stores/workbench-store';

const LAYOUT_STORAGE_KEY = 'blue-workbench-layout';

export default function WorkbenchShell() {
  const auxiliary = useWorkbenchStore((s) => s.auxiliary);
  const toggleAuxiliaryPanel = useWorkbenchStore((s) => s.toggleAuxiliaryPanel);
  const dockAuxiliaryPanel = useWorkbenchStore((s) => s.dockAuxiliaryPanel);
  const hideAllAuxiliarySlideouts = useWorkbenchStore(
    (s) => s.hideAllAuxiliarySlideouts,
  );
  const hideAuxiliarySlideout = useWorkbenchStore(
    (s) => s.hideAuxiliarySlideout,
  );
  const resizeAuxiliarySlideout = useWorkbenchStore(
    (s) => s.resizeAuxiliarySlideout,
  );
  const restoreAuxiliaryGroup = useWorkbenchStore((s) => s.restoreAuxiliaryGroup);
  const setApi = useWorkbenchStore((s) => s.setApi);
  const leftTabs = getMinimizedTabsForEdge(auxiliary, 'left');
  const rightTabs = getMinimizedTabsForEdge(auxiliary, 'right');
  const bottomTabs = getMinimizedTabsForEdge(auxiliary, 'bottom');
  const leftSlideout = getAuxiliarySlideoutForEdge(auxiliary, 'left');
  const rightSlideout = getAuxiliarySlideoutForEdge(auxiliary, 'right');
  const bottomSlideout = getAuxiliarySlideoutForEdge(auxiliary, 'bottom');
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
    if (useWorkbenchStore.getState().api) {
      persistLayout();
    }
  }, [auxiliary, persistLayout]);

  useEffect(() => {
    if (!leftSlideout && !rightSlideout && !bottomSlideout) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (
        target?.closest('[data-auxiliary-slideout="true"]') ||
        target?.closest('[data-auxiliary-rail="true"]')
      ) {
        return;
      }

      hideAllAuxiliarySlideouts();
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [
    bottomSlideout,
    hideAllAuxiliarySlideouts,
    leftSlideout,
    rightSlideout,
  ]);

  useEffect(() => {
    return () => {
      disposeListeners();
      setApi(null);
    };
  }, [disposeListeners, setApi]);

  return (
    <div
      className="workbench-shell"
      style={
        {
          '--workbench-left-rail-width': leftTabs.length > 0 ? '40px' : '0px',
          '--workbench-right-rail-width': rightTabs.length > 0 ? '40px' : '0px',
          '--workbench-bottom-rail-height':
            bottomTabs.length > 0 ? '36px' : '0px',
        } as CSSProperties
      }
    >
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
            rightHeaderActionsComponent={AuxiliaryHeaderActions}
            hideBorders={false}
          />
        </div>
      </div>

      {leftSlideout ? (
        <AuxiliarySlideout
          slideout={leftSlideout}
          onClose={() => hideAuxiliarySlideout('left')}
          onDock={() => dockAuxiliaryPanel(leftSlideout.panelId)}
          onResize={(size) => resizeAuxiliarySlideout(leftSlideout.panelId, size)}
        />
      ) : null}

      {rightSlideout ? (
        <AuxiliarySlideout
          slideout={rightSlideout}
          onClose={() => hideAuxiliarySlideout('right')}
          onDock={() => dockAuxiliaryPanel(rightSlideout.panelId)}
          onResize={(size) =>
            resizeAuxiliarySlideout(rightSlideout.panelId, size)
          }
        />
      ) : null}

      {bottomSlideout ? (
        <AuxiliarySlideout
          slideout={bottomSlideout}
          onClose={() => hideAuxiliarySlideout('bottom')}
          onDock={() => dockAuxiliaryPanel(bottomSlideout.panelId)}
          onResize={(size) =>
            resizeAuxiliarySlideout(bottomSlideout.panelId, size)
          }
        />
      ) : null}

      {leftTabs.length > 0 ? (
        <AuxiliaryRail
          edge="left"
          tabs={leftTabs}
          onSelect={toggleAuxiliaryPanel}
          onRestoreGroup={restoreAuxiliaryGroup}
        />
      ) : null}

      {rightTabs.length > 0 ? (
        <AuxiliaryRail
          edge="right"
          tabs={rightTabs}
          onSelect={toggleAuxiliaryPanel}
          onRestoreGroup={restoreAuxiliaryGroup}
        />
      ) : null}

      {bottomTabs.length > 0 ? (
        <AuxiliaryRail
          edge="bottom"
          tabs={bottomTabs}
          onSelect={toggleAuxiliaryPanel}
          onRestoreGroup={restoreAuxiliaryGroup}
        />
      ) : null}

      {rightTabs.length > 0 && bottomTabs.length > 0 ? (
        <div className="workbench-shell__corner" aria-hidden="true" />
      ) : null}
    </div>
  );
}
