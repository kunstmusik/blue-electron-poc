import { useProjectStore } from '../../stores/project-store';
import ProjectMetadata from './ProjectMetadata';

export default function ProjectView(): JSX.Element {
  const title = useProjectStore((s) => s.title);
  const isLoading = useProjectStore((s) => s.isLoading);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-blue-muted">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-blue-accent mb-6">{title}</h2>
      <ProjectMetadata />
      <ScoreSummary />
    </div>
  );
}

function ScoreSummary(): JSX.Element {
  return (
    <section className="mt-8">
      <h3 className="text-base font-semibold text-blue-accent mb-3 pb-1 border-b border-blue-border">
        Score Structure
      </h3>
      <div className="text-sm text-blue-muted">
        <p>Score visualization will be implemented in a future phase.</p>
        <p className="mt-2">
          The data model is fully loaded and functional. CSD generation and playback
          work via the Play button in the menu bar.
        </p>
      </div>
    </section>
  );
}
