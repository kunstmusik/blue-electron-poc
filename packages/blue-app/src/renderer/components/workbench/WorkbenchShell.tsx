import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import {
  DockviewReact,
  DockviewReadyEvent,
} from 'dockview';
import 'dockview/dist/styles/dockview.css';
import AuxiliaryRail from './AuxiliaryRail';
import AuxiliaryHeaderActions from './AuxiliaryHeaderActions';
import AuxiliarySlideout from './AuxiliarySlideout';
import AuxiliaryTab from './AuxiliaryTab';
import DockviewPanel from './DockviewPanel';
import {
  getAuxiliarySlideoutForEdge,
  getMinimizedTabsForEdge,
  isAuxiliaryPanelId,
  type AuxiliaryEdge,
} from './auxiliary-layout';
import { getAuxiliaryEdgeDropTarget } from './auxiliary-drag';
import { useWorkbenchStore } from '../../stores/workbench-store';

const LAYOUT_STORAGE_KEY = 'blue-workbench-layout';
const AUXILIARY_DRAG_THRESHOLD = 8;

interface PendingAuxiliaryDrag {
  kind: 'edge' | 'panel';
  groupInstanceId?: string;
  panelId?: string;
  sourceEdge: AuxiliaryEdge;
  startX: number;
  startY: number;
}

interface ActiveAuxiliaryDrag extends PendingAuxiliaryDrag {
  targetEdge?: AuxiliaryEdge;
}

const AUXILIARY_EDGES: AuxiliaryEdge[] = ['left', 'right', 'bottom'];

function isAuxiliaryEdge(value: string | undefined): value is AuxiliaryEdge {
  return value !== undefined && AUXILIARY_EDGES.includes(value as AuxiliaryEdge);
}

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
  const moveAuxiliaryEdge = useWorkbenchStore((s) => s.moveAuxiliaryEdge);
  const movePanelToEdge = useWorkbenchStore((s) => s.movePanelToEdge);
  const setApi = useWorkbenchStore((s) => s.setApi);
  const leftTabs = getMinimizedTabsForEdge(auxiliary, 'left');
  const rightTabs = getMinimizedTabsForEdge(auxiliary, 'right');
  const bottomTabs = getMinimizedTabsForEdge(auxiliary, 'bottom');
  const leftSlideout = getAuxiliarySlideoutForEdge(auxiliary, 'left');
  const rightSlideout = getAuxiliarySlideoutForEdge(auxiliary, 'right');
  const bottomSlideout = getAuxiliarySlideoutForEdge(auxiliary, 'bottom');
  const shellRef = useRef<HTMLDivElement | null>(null);
  const listenersRef = useRef<Array<{ dispose: () => void }>>([]);
  const pendingDragRef = useRef<PendingAuxiliaryDrag | null>(null);
  const activeDragRef = useRef<ActiveAuxiliaryDrag | null>(null);
  const [activeDrag, setActiveDrag] = useState<ActiveAuxiliaryDrag | null>(null);

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
          useWorkbenchStore.getState().syncAuxiliaryLayout();
          persistLayout();
        }),
        event.api.onDidActivePanelChange(() => {
          useWorkbenchStore.getState().syncAuxiliaryLayout();
          persistLayout();
        }),
        event.api.onWillDragGroup((dragEvent) => {
          if (dragEvent.group.panels.some((panel) => isAuxiliaryPanelId(panel.id))) {
            dragEvent.nativeEvent.preventDefault();
          }
        }),
        event.api.onWillDragPanel((dragEvent) => {
          if (isAuxiliaryPanelId(dragEvent.panel.id)) {
            dragEvent.nativeEvent.preventDefault();
          }
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
    const shell = shellRef.current;
    if (!shell) {
      return;
    }

    function clearDragState() {
      pendingDragRef.current = null;
      activeDragRef.current = null;
      setActiveDrag(null);
    }

    function handlePointerDown(event: PointerEvent) {
      if (event.button !== 0) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (!target || target.closest('[data-aux-drag-ignore="true"]')) {
        return;
      }

      const slideoutHandle = target.closest<HTMLElement>(
        '[data-aux-slideout-drag-handle="true"]',
      );
      if (slideoutHandle) {
        const panelId = slideoutHandle.dataset.auxPanelId;
        const sourceEdge = slideoutHandle.dataset.auxEdge;

        if (panelId && isAuxiliaryEdge(sourceEdge)) {
          pendingDragRef.current = {
            kind: 'panel',
            panelId,
            sourceEdge,
            startX: event.clientX,
            startY: event.clientY,
          };
        }
        return;
      }

      const groupElement = target.closest<HTMLElement>('[data-aux-edge]');
      const inHeader = target.closest('.dv-tabs-and-actions-container');
      const onTab = target.closest('.dv-tab');
      const tabCount = Number(groupElement?.dataset.auxGroupTabCount ?? '0');
      const allowFromTab = tabCount === 1;

      if (groupElement && inHeader && (!onTab || allowFromTab)) {
        const sourceEdge = groupElement.dataset.auxEdge;

        if (isAuxiliaryEdge(sourceEdge)) {
          pendingDragRef.current = {
            kind: 'edge',
            sourceEdge,
            startX: event.clientX,
            startY: event.clientY,
          };
        }
      }
    }

    function handlePointerMove(event: PointerEvent) {
      const pending = pendingDragRef.current;
      if (!pending) {
        return;
      }

      const distance = Math.hypot(
        event.clientX - pending.startX,
        event.clientY - pending.startY,
      );

      if (distance < AUXILIARY_DRAG_THRESHOLD) {
        return;
      }

      const bounds = shell.getBoundingClientRect();
      const targetEdge = getAuxiliaryEdgeDropTarget(bounds, {
        x: event.clientX,
        y: event.clientY,
      });

      setActiveDrag((current) => {
        const next: ActiveAuxiliaryDrag = {
          ...pending,
          targetEdge,
        };

        if (
          current &&
          current.kind === next.kind &&
          current.groupInstanceId === next.groupInstanceId &&
          current.panelId === next.panelId &&
          current.sourceEdge === next.sourceEdge &&
          current.targetEdge === next.targetEdge
        ) {
          return current;
        }

        activeDragRef.current = next;
        return next;
      });
    }

    function handlePointerUp() {
      const completed = activeDragRef.current;

      if (
        completed &&
        completed.targetEdge &&
        completed.targetEdge !== completed.sourceEdge
      ) {
        if (completed.kind === 'edge') {
          moveAuxiliaryEdge(completed.sourceEdge, completed.targetEdge);
        } else if (completed.kind === 'panel' && completed.panelId) {
          movePanelToEdge(completed.panelId, completed.targetEdge);
        }
      }

      clearDragState();
    }

    shell.addEventListener('pointerdown', handlePointerDown, true);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', clearDragState);
    window.addEventListener('blur', clearDragState);

    return () => {
      shell.removeEventListener('pointerdown', handlePointerDown, true);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', clearDragState);
      window.removeEventListener('blur', clearDragState);
    };
  }, [moveAuxiliaryEdge, movePanelToEdge]);

  useEffect(() => {
    return () => {
      disposeListeners();
      setApi(null);
    };
  }, [disposeListeners, setApi]);

  return (
    <div
      ref={shellRef}
      className="workbench-shell"
      style={
        {
          '--workbench-left-rail-width': leftTabs.length > 0 ? '40px' : '0px',
          '--workbench-right-rail-width': rightTabs.length > 0 ? '40px' : '0px',
          '--workbench-bottom-rail-height':
            bottomTabs.length > 0 ? '36px' : '0px',
        } as CSSProperties
      }
      data-aux-dragging={activeDrag ? 'true' : undefined}
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
            defaultTabComponent={AuxiliaryTab}
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

      {activeDrag ? (
        <>
          <div
            className={[
              'workbench-aux-edge-drop-target',
              'workbench-aux-edge-drop-target--left',
              activeDrag.targetEdge === 'left' ? 'is-active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-hidden="true"
          />
          <div
            className={[
              'workbench-aux-edge-drop-target',
              'workbench-aux-edge-drop-target--right',
              activeDrag.targetEdge === 'right' ? 'is-active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-hidden="true"
          />
          <div
            className={[
              'workbench-aux-edge-drop-target',
              'workbench-aux-edge-drop-target--bottom',
              activeDrag.targetEdge === 'bottom' ? 'is-active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-hidden="true"
          />
        </>
      ) : null}

      {leftTabs.length > 0 ? (
        <AuxiliaryRail
          edge="left"
          tabs={leftTabs}
          onSelect={toggleAuxiliaryPanel}
          onRestoreGroup={() => restoreAuxiliaryGroup(leftTabs[0]!.groupInstanceId)}
        />
      ) : null}

      {rightTabs.length > 0 ? (
        <AuxiliaryRail
          edge="right"
          tabs={rightTabs}
          onSelect={toggleAuxiliaryPanel}
          onRestoreGroup={() => restoreAuxiliaryGroup(rightTabs[0]!.groupInstanceId)}
        />
      ) : null}

      {bottomTabs.length > 0 ? (
        <AuxiliaryRail
          edge="bottom"
          tabs={bottomTabs}
          onSelect={toggleAuxiliaryPanel}
          onRestoreGroup={() => restoreAuxiliaryGroup(bottomTabs[0]!.groupInstanceId)}
        />
      ) : null}

      {leftTabs.length > 0 && rightTabs.length > 0 ? (
        <div className="workbench-shell__corner" aria-hidden="true" />
      ) : null}

      {leftTabs.length > 0 && bottomTabs.length > 0 ? (
        <div className="workbench-shell__corner workbench-shell__corner--left-bottom" aria-hidden="true" />
      ) : null}

      {rightTabs.length > 0 && bottomTabs.length > 0 ? (
        <div className="workbench-shell__corner workbench-shell__corner--right-bottom" aria-hidden="true" />
      ) : null}
    </div>
  );
}
