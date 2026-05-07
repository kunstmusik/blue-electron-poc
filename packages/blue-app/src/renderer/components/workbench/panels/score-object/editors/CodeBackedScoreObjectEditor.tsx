import React, { useCallback } from 'react';
import type { ScoreObjectEditorComponentProps } from '../editor-registry';
import SelectedCodeEditor from '../../editors/SelectedCodeEditor';

export default function CodeBackedScoreObjectEditor({ document, onPatch }: ScoreObjectEditorComponentProps): React.ReactElement {
  const editor = document.editor;
  if (editor.kind !== 'code') return <></>;

  const modeMap: Record<string, 'orc' | 'sco' | 'text' | 'javascript' | 'python'> = {
    'csound-score': 'sco',
    'python': 'python',
    'javascript': 'javascript',
    'text': 'text',
  };

  const handleChange = useCallback((text: string) => {
    onPatch({
      type: 'updateTypeSpecificEditor',
      target: document.target,
      patch: { text },
    });
  }, [document.target, onPatch]);

  return (
    <div className="h-full flex flex-col">
      <SelectedCodeEditor
        value={editor.text}
        mode={modeMap[editor.syntax] ?? 'text'}
        active={true}
        readOnly={false}
        ariaLabel={`Score object code editor (${editor.syntax})`}
        onChange={handleChange}
      />
    </div>
  );
}
