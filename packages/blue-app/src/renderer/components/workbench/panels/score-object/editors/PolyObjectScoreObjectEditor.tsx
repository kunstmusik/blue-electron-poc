import React from 'react';
import type { ScoreObjectEditorComponentProps } from '../editor-registry';

export default function PolyObjectScoreObjectEditor({ document }: ScoreObjectEditorComponentProps): React.ReactElement {
  const editor = document.editor;
  if (editor.kind !== 'polyObject') return <></>;

  if (editor.children.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-blue-muted">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
        </svg>
        <span className="text-xs">PolyObject is empty</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-blue-border shrink-0">
        <span className="text-xs text-blue-muted">
          {editor.children.length} object{editor.children.length !== 1 ? 's' : ''} across layers
        </span>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-blue-border">
              <th className="px-2 py-1 text-left text-blue-muted font-normal">Name</th>
              <th className="px-2 py-1 text-left text-blue-muted font-normal">Type</th>
              <th className="px-2 py-1 text-right text-blue-muted font-normal">Start</th>
              <th className="px-2 py-1 text-right text-blue-muted font-normal">Duration</th>
              <th className="px-2 py-1 text-left text-blue-muted font-normal">Layer</th>
            </tr>
          </thead>
          <tbody>
            {editor.children.map((child) => (
              <tr key={child.objectId} className="border-b border-blue-border/50 hover:bg-blue-border/10">
                <td className="px-2 py-1 text-gray-200">{child.name}</td>
                <td className="px-2 py-1 text-gray-400">{child.objectType}</td>
                <td className="px-2 py-1 text-right text-gray-400 font-mono">{child.startBeats.toFixed(2)}</td>
                <td className="px-2 py-1 text-right text-gray-400 font-mono">{child.durationBeats.toFixed(2)}</td>
                <td className="px-2 py-1 text-gray-500">{child.layerLabel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editor.generatedScoreText && (
        <div className="border-t border-blue-border shrink-0">
          <div className="px-3 py-1 text-xs text-blue-muted">Generated Score Preview</div>
          <pre className="px-3 py-1 text-xs text-gray-400 font-mono max-h-32 overflow-auto whitespace-pre-wrap">
            {editor.generatedScoreText}
          </pre>
        </div>
      )}
    </div>
  );
}
