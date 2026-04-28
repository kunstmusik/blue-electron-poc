import React from 'react';
import { useProjectStore } from '../../../stores/project-store';
import SelectedCodeEditor from './editors/SelectedCodeEditor';

export default function GlobalOrchestraPanel(): React.ReactElement {
  const loaded = useProjectStore((state) => state.loaded);
  const globalOrc = useProjectStore((state) => state.globalOrc);
  const updateGlobalOrc = useProjectStore((state) => state.updateGlobalOrc);

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
        value={globalOrc}
        placeholder="Enter global orchestra code"
        ariaLabel="Global Orchestra Csound editor"
        onChange={updateGlobalOrc}
      />
    </div>
  );
}
