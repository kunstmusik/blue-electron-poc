import { useProjectStore } from '../../stores/project-store';
import ProjectMetadata from './ProjectMetadata';
import ScoreTimeline from './ScoreTimeline';

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
      <ScoreTimeline />
    </div>
  );
}
