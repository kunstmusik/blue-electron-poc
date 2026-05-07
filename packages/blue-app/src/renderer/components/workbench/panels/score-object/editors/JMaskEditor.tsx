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

export default function JMaskEditor({ document, onPatch }: ScoreObjectEditorComponentProps): React.ReactElement {
  const editor = document.editor;
  if (editor.kind !== 'structured' || editor.editorFamily !== 'JMask') return <></>;

  const { seedUsed, seed } = editor.payload as { seedUsed: boolean; seed: number };

  const patch = useCallback((p: Record<string, unknown>) => {
    onPatch({
      type: 'updateTypeSpecificEditor',
      target: document.target,
      patch: p,
    });
  }, [document.target, onPatch]);

  return (
    <div className="py-2">
      <FieldRow label="Use Seed">
        <input
          type="checkbox"
          checked={seedUsed}
          onChange={(e) => patch({ seedUsed: e.target.checked })}
          className="rounded border border-blue-border"
        />
      </FieldRow>
      {seedUsed && (
        <FieldRow label="Seed">
          <input
            type="number"
            className="w-32 rounded border border-blue-border bg-blue-bg px-2 py-1 text-xs text-gray-100 focus:border-blue-accent focus:outline-none"
            value={seed}
            onChange={(e) => patch({ seed: parseInt(e.target.value, 10) || 0 })}
          />
        </FieldRow>
      )}
    </div>
  );
}
