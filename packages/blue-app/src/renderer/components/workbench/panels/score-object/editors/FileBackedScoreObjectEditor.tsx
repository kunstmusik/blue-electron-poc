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

export default function FileBackedScoreObjectEditor({ document, onPatch }: ScoreObjectEditorComponentProps): React.ReactElement {
  const editor = document.editor;
  if (editor.kind !== 'file') return <></>;

  const isAudioFile = editor.objectType === 'AudioFile';
  const isFrozen = editor.objectType === 'FrozenSoundObject';

  const patchField = useCallback((field: Record<string, unknown>) => {
    onPatch({
      type: 'updateTypeSpecificEditor',
      target: document.target,
      patch: field,
    });
  }, [document.target, onPatch]);

  return (
    <div className="py-2">
      <FieldRow label={isFrozen ? 'Wave File' : 'Sound File'}>
        <input
          type="text"
          className={inputCls}
          value={editor.filePath}
          onChange={(e) => patchField({ filePath: e.target.value })}
        />
      </FieldRow>

      {isAudioFile && (
        <FieldRow label="Post Code">
          <textarea
            className={`${inputCls} font-mono`}
            rows={4}
            value={editor.csoundPostCode ?? ''}
            onChange={(e) => patchField({ csoundPostCode: e.target.value })}
          />
        </FieldRow>
      )}

      {isFrozen && (
        <>
          <FieldRow label="Channels">
            <span className="text-xs text-gray-300 py-1">{editor.numChannels ?? 0}</span>
          </FieldRow>
          {editor.originalObjectType && (
            <FieldRow label="Original Type">
              <span className="text-xs text-gray-300 py-1">{editor.originalObjectType}</span>
            </FieldRow>
          )}
        </>
      )}
    </div>
  );
}
