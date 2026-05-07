import React, { useCallback } from 'react';
import type { ScoreObjectEditorComponentProps } from '../editor-registry';

function FieldRow({ label, children }: { label: string; children: React.ReactNode }): React.ReactElement {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5">
      <label className="w-28 shrink-0 text-xs text-blue-muted text-right">{label}</label>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

const inputCls = 'w-full rounded border border-blue-border bg-blue-bg px-2 py-1 text-xs text-gray-100 focus:border-blue-accent focus:outline-none';

const PCH_LABELS = ['Frequency', 'PCH', 'MIDI'];

export default function PianoRollEditor({ document, onPatch }: ScoreObjectEditorComponentProps): React.ReactElement {
  const editor = document.editor;
  if (editor.kind !== 'structured' || editor.editorFamily !== 'PianoRoll') return <></>;

  const { instrumentId, noteTemplate, pchGenerationMethod, transposition } = editor.payload as {
    instrumentId: string;
    noteTemplate: string;
    pchGenerationMethod: number;
    transposition: number;
  };

  const patch = useCallback((p: Record<string, unknown>) => {
    onPatch({
      type: 'updateTypeSpecificEditor',
      target: document.target,
      patch: p,
    });
  }, [document.target, onPatch]);

  return (
    <div className="py-2">
      <FieldRow label="Instrument ID">
        <input
          type="text"
          className={inputCls}
          value={instrumentId}
          onChange={(e) => patch({ instrumentId: e.target.value })}
        />
      </FieldRow>
      <FieldRow label="Pitch Method">
        <select
          className={`${inputCls} py-1`}
          value={pchGenerationMethod}
          onChange={(e) => patch({ pchGenerationMethod: parseInt(e.target.value, 10) })}
        >
          {PCH_LABELS.map((label, i) => (
            <option key={i} value={i}>{label}</option>
          ))}
        </select>
      </FieldRow>
      <FieldRow label="Transposition">
        <input
          type="number"
          className={inputCls}
          value={transposition}
          step={1}
          onChange={(e) => patch({ transposition: parseInt(e.target.value, 10) || 0 })}
        />
      </FieldRow>
      <FieldRow label="Note Template">
        <textarea
          className={`${inputCls} font-mono`}
          rows={4}
          value={noteTemplate}
          onChange={(e) => patch({ noteTemplate: e.target.value })}
        />
      </FieldRow>
    </div>
  );
}
