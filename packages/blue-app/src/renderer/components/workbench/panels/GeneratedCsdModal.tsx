import React, { useCallback } from 'react';

import { useProjectStore } from '../../../stores/project-store';
import SelectedCodeEditor from './editors/SelectedCodeEditor';

export default function GeneratedCsdModal(): React.ReactElement | null {
  const generatedCsd = useProjectStore((state) => state.generatedCsd);
  const setGeneratedCsd = useProjectStore((state) => state.setGeneratedCsd);

  const closeModal = useCallback(() => {
    setGeneratedCsd(null);
  }, [setGeneratedCsd]);

  if (!generatedCsd) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          closeModal();
        }
      }}
    >
      <div className="flex h-[80vh] w-[80vw] flex-col rounded-lg border border-[#1e2d44] bg-[#0d1524] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#1e2d44] px-4 py-3">
          <h2 className="text-sm font-medium text-[#dbe7ff]">{generatedCsd.title}</h2>
          <button
            className="px-2 text-lg leading-none text-[#5a7299] hover:text-[#dbe7ff]"
            onClick={closeModal}
            aria-label="Close"
          >
            x
          </button>
        </div>
        <div className="min-h-0 flex-1">
          <SelectedCodeEditor
            value={generatedCsd.text}
            onChange={() => {}}
            ariaLabel="Generated CSD preview"
            readOnly
            mode="csd"
          />
        </div>
      </div>
    </div>
  );
}
