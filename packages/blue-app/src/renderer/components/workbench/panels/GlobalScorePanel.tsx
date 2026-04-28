import React from 'react';
import { useProjectStore } from '../../../stores/project-store';
import SelectedCodeEditor from './editors/SelectedCodeEditor';

export default function GlobalScorePanel(): React.ReactElement {
  const loaded = useProjectStore((state) => state.loaded);
  const globalSco = useProjectStore((state) => state.globalSco);
  const updateGlobalSco = useProjectStore((state) => state.updateGlobalSco);

  if (!loaded) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500 text-sm">
        No project loaded
      </div>
    );
  }

  return (
    <div className="h-full">
      <SelectedCodeEditor
        value={globalSco}
        placeholder="Enter global score code"
        ariaLabel="Global Score Csound editor"
        mode="sco"
        onChange={updateGlobalSco}
      />
    </div>
  );
}
