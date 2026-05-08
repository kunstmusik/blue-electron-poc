import React, { useCallback } from 'react';
import type { ScoreObjectEditorComponentProps } from '../editor-registry';
import SelectedCodeEditor from '../../editors/SelectedCodeEditor';

export default function ExternalScoreObjectEditor({ document, onPatch }: ScoreObjectEditorComponentProps): React.ReactElement {
  const editor = document.editor;
  if (editor.kind !== 'external') return <></>;

  const modeMap: Record<string, 'orc' | 'sco' | 'text' | 'javascript' | 'python'> = {
    'Python': 'python',
    'JavaScript': 'javascript',
    'Csound': 'sco',
    'text': 'text',
  };

  const patch = useCallback((p: Record<string, unknown>) => {
    onPatch({
      type: 'updateTypeSpecificEditor',
      target: document.target,
      patch: p,
    });
  }, [document.target, onPatch]);

  const handleCodeChange = useCallback((text: string) => {
    patch({ scoreText: text });
  }, [patch]);

  const handleCommandLineChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    patch({ commandLine: e.target.value });
  }, [patch]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-blue-border shrink-0">
        <label className="shrink-0 text-xs text-blue-muted">Command Line:</label>
        <input
          type="text"
          className="flex-1 min-w-0 rounded border border-blue-border bg-blue-bg px-2 py-1 text-xs text-gray-100 font-mono focus:border-blue-accent focus:outline-none"
          value={editor.commandLine}
          onChange={handleCommandLineChange}
        />
        <button
          className="shrink-0 px-3 py-1 text-xs rounded border border-blue-border text-blue-muted hover:bg-blue-border/30 disabled:opacity-50"
          disabled={!editor.canTest}
          title="Generate score from external command and show results"
        >
          Test
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        <SelectedCodeEditor
          value={editor.scoreText}
          mode={modeMap[editor.syntaxType] ?? 'text'}
          active={true}
          readOnly={false}
          ariaLabel="External code editor"
          onChange={handleCodeChange}
        />
      </div>
    </div>
  );
}
