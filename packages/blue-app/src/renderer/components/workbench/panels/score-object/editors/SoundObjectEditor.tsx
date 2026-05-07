import React, { useCallback } from 'react';
import type { ScoreObjectEditorComponentProps } from '../editor-registry';

export default function SoundObjectEditor({ document, onPatch }: ScoreObjectEditorComponentProps): React.ReactElement {
  const editor = document.editor;
  if (editor.kind !== 'structured' || editor.editorFamily !== 'Sound') return <></>;

  const { comment } = editor.payload as { comment: string };

  const handleChange = useCallback((comment: string) => {
    onPatch({
      type: 'updateTypeSpecificEditor',
      target: document.target,
      patch: { comment },
    });
  }, [document.target, onPatch]);

  return (
    <div className="flex flex-col h-full p-3">
      <label className="text-xs text-blue-muted mb-1">Comment</label>
      <textarea
        className="flex-1 rounded border border-blue-border bg-blue-bg px-2 py-1 text-xs text-gray-100 font-mono focus:border-blue-accent focus:outline-none resize-none"
        value={comment}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Instrument comment..."
      />
    </div>
  );
}
