import React from 'react';
import { useProjectStore } from '../../../stores/project-store';
import ProjectTextEditorPanel from './ProjectTextEditorPanel';

export default function GlobalScorePanel(): React.ReactElement {
  const loaded = useProjectStore((state) => state.loaded);
  const globalSco = useProjectStore((state) => state.globalSco);
  const updateGlobalSco = useProjectStore((state) => state.updateGlobalSco);

  return (
    <ProjectTextEditorPanel
      value={globalSco}
      placeholder="Enter global score code"
      emptyTitle="No project loaded"
      emptyDescription="Open a project to edit the global score text."
      disabled={!loaded}
      onChange={updateGlobalSco}
    />
  );
}
