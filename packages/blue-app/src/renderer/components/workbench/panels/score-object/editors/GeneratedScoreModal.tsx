import React from 'react';
import SelectedCodeEditor from '../../editors/SelectedCodeEditor';

export default function GeneratedScoreModal({
  text,
  onClose,
}: {
  text: string;
  onClose: () => void;
}): React.ReactElement {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="flex h-[400px] w-[760px] max-w-[calc(100vw-32px)] flex-col rounded-lg border border-[#1e2d44] bg-[#0d1524] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#1e2d44] px-4 py-3">
          <h2 className="text-sm font-medium text-[#dbe7ff]">Generated Score</h2>
          <button
            className="px-2 text-lg leading-none text-[#5a7299] hover:text-[#dbe7ff]"
            onClick={onClose}
            aria-label="Close"
          >
            x
          </button>
        </div>
        <div className="min-h-0 flex-1">
          <SelectedCodeEditor
            value={text.length > 0 ? text : '; no notes'}
            onChange={() => {}}
            ariaLabel="Generated score"
            readOnly
            mode="sco"
          />
        </div>
      </div>
    </div>
  );
}
