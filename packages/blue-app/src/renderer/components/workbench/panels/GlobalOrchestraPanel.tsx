import React from 'react';
import { useProjectStore } from '../../../stores/project-store';
import ProjectTextEditorPanel from './ProjectTextEditorPanel';
import SelectedCodeEditor from './editors/SelectedCodeEditor';

export default function GlobalOrchestraPanel(): React.ReactElement {
  const loaded = useProjectStore((state) => state.loaded);
  const globalOrc = useProjectStore((state) => state.globalOrc);
  const updateGlobalOrc = useProjectStore((state) => state.updateGlobalOrc);

  if (!loaded) {
    return (
      <ProjectTextEditorPanel
        value={globalOrc}
        placeholder="Enter global orchestra code"
        emptyTitle="No project loaded"
        emptyDescription="Open a project to edit the global orchestra text."
        disabled
        onChange={updateGlobalOrc}
      />
    );
  }

  return (
    <div className="flex h-full flex-col bg-blue-bg text-gray-100">
      <div className="flex-1 min-h-0 p-4">
        <SelectedCodeEditor
          value={globalOrc}
          placeholder="Enter global orchestra code"
          ariaLabel="Global Orchestra Csound editor"
          onChange={updateGlobalOrc}
        />
      </div>
    </div>
  );
}
