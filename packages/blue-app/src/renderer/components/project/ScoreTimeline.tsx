import { useProjectStore } from '../../stores/project-store';

/**
 * ScoreTimeline — placeholder for the score visualization.
 * 
 * Full implementation (Phase 34):
 * - Audio clips as colored blocks on a timeline
 * - Pattern grid visualization
 * - PolyObject hierarchy tree
 * - Virtualized rendering for large projects (@tanstack/react-virtual)
 * - Zoom, scroll, selection, drag-and-drop
 */
export default function ScoreTimeline(): JSX.Element {
  const title = useProjectStore((s) => s.title);

  return (
    <section className="mt-8">
      <h3 className="text-base font-semibold text-blue-accent mb-3 pb-1 border-b border-blue-border">
        Score Timeline
      </h3>
      <div className="flex items-center justify-center h-64 border border-blue-border rounded-lg bg-blue-surface/50">
        <div className="text-center text-blue-muted">
          <p className="text-sm">Score visualization for &ldquo;{title}&rdquo;</p>
          <p className="text-xs mt-2">
            Timeline view will be implemented in a future phase.
          </p>
          <p className="text-xs mt-1">
            Playback works — use the Play/Stop buttons in the menu bar.
          </p>
        </div>
      </div>
    </section>
  );
}
