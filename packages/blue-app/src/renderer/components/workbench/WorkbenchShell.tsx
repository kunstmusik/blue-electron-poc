import { useCallback, useEffect } from 'react';
import {
  DockviewReact,
  DockviewReadyEvent,
  DockviewApi,
} from 'dockview';
import 'dockview/dist/styles/dockview.css';
import DockviewPanel from './DockviewPanel';
import { useWorkbenchStore } from '../../stores/workbench-store';
import { getDefaultEditorPanels, getPanelsByMode } from './panel-registry';

const LAYOUT_STORAGE_KEY = 'blue-workbench-layout';

function buildDefaultLayout(api: DockviewApi) {
  const editors = getDefaultEditorPanels();
  const properties = getPanelsByMode('properties');
  const output = getPanelsByMode('output');

  for (const desc of editors) {
    api.addPanel({
      id: desc.id,
      component: 'default',
      title: desc.id,
    });
  }

  const firstEditor = api.getPanel(editors[0].id);

  const propsPanel = properties[0];
  if (propsPanel && firstEditor) {
    api.addPanel({
      id: propsPanel.id,
      component: 'default',
      title: propsPanel.id,
      position: { referencePanel: firstEditor, direction: 'right' },
    });
  }

  const outputPanel = output[0];
  if (outputPanel && firstEditor) {
    api.addPanel({
      id: outputPanel.id,
      component: 'default',
      title: outputPanel.id,
      position: { referencePanel: firstEditor, direction: 'below' },
    });
  }
}

export default function WorkbenchShell() {
  const setApi = useWorkbenchStore((s) => s.setApi);
  const loadLayout = useWorkbenchStore((s) => s.loadLayout);

  const onReady = useCallback(
    (event: DockviewReadyEvent) => {
      setApi(event.api);

      const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
      if (saved) {
        try {
          event.api.fromJSON(JSON.parse(saved));
          return;
        } catch {
          // Fall through to default layout
        }
      }

      buildDefaultLayout(event.api);
    },
    [setApi],
  );

  useEffect(() => {
    function handleBeforeUnload() {
      const api = useWorkbenchStore.getState().api;
      if (!api) return;
      try {
        const layout = JSON.stringify(api.toJSON());
        localStorage.setItem(LAYOUT_STORAGE_KEY, layout);
      } catch {
        // Persistence failed; non-critical
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return (
    <div className="h-full dv-dockview-theme-abyss" style={{ backgroundColor: 'var(--dv-paneview-active-border-color, #1a1a2e)' }}>
      <DockviewReact
        onReady={onReady}
        components={{ default: DockviewPanel }}
        hideBorders={false}
      />
    </div>
  );
}
