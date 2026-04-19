import { useState, useRef, useEffect } from 'react';
import { LayoutList } from 'lucide-react';
import { useWorkbenchStore } from '../../stores/workbench-store';
import { getAuxiliaryPanelPresentation } from './auxiliary-layout';
import { PANEL_REGISTRY } from '../workbench/panel-registry';
import type { PanelMode } from '../workbench/panel-registry';

const MODE_LABELS: Record<PanelMode, string> = {
  editor: 'Editor',
  properties: 'Properties',
  output: 'Output',
};

const MODE_ORDER: PanelMode[] = ['editor', 'properties', 'output'];

export default function WindowMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const focusPanel = useWorkbenchStore((s) => s.focusPanel);
  const api = useWorkbenchStore((s) => s.api);
  const auxiliary = useWorkbenchStore((s) => s.auxiliary);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  if (!api) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        className="btn text-xs px-2 py-1"
        onClick={() => setOpen(!open)}
        title="Window panels"
      >
        <LayoutList className="w-3.5 h-3.5" />
        Window
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-blue-surface border border-blue-border rounded-md shadow-lg z-50 py-1 max-h-[70vh] overflow-y-auto">
          {MODE_ORDER.map((mode) => (
            <div key={mode}>
              <div className="px-3 py-1 text-xs font-semibold text-blue-muted uppercase tracking-wider">
                {MODE_LABELS[mode]}
              </div>
              {PANEL_REGISTRY.filter((p) => p.mode === mode).map((panel) => (
                (() => {
                  const presentation = getAuxiliaryPanelPresentation(
                    auxiliary,
                    panel.id,
                  );

                  return (
                    <button
                      key={panel.id}
                      className="w-full text-left px-3 py-1.5 text-sm text-gray-300 hover:bg-blue-border/50 transition-colors flex items-center justify-between gap-3"
                      onClick={() => {
                        focusPanel(panel.id);
                        setOpen(false);
                      }}
                    >
                      <span className="truncate">
                        {panel.icon && <span className="mr-1.5">{panel.icon}</span>}
                        {panel.title}
                      </span>

                      {presentation ? (
                        <span className="text-[10px] uppercase tracking-[0.18em] text-blue-muted">
                          {presentation}
                        </span>
                      ) : null}
                    </button>
                  );
                })()
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
