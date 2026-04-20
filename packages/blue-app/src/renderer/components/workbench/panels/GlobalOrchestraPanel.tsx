import React from 'react';
import { useProjectStore } from '../../../stores/project-store';
import ProjectTextEditorPanel from './ProjectTextEditorPanel';

export default function GlobalOrchestraPanel(): JSX.Element {
  const loaded = useProjectStore((state) => state.loaded);
  const globalOrc = useProjectStore((state) => state.globalOrc);
  const updateGlobalOrc = useProjectStore((state) => state.updateGlobalOrc);

  return (
    <ProjectTextEditorPanel
      value={globalOrc}
      placeholder="Enter global orchestra code"
      emptyTitle="No project loaded"
      emptyDescription="Open a project to edit the global orchestra text."
      disabled={!loaded}
      onChange={updateGlobalOrc}
    />
  );
}
