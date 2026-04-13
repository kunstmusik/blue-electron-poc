import { useEffect } from 'react';
import { useProjectStore } from '../stores/project-store';
import { usePlaybackStore } from '../stores/playback-store';

export function useKeyboardShortcuts(): void {
  const hasProject = useProjectStore((s) => s.filePath !== null);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const togglePlay = usePlaybackStore((s) => s.setStatus);
  const resetPlayback = usePlaybackStore((s) => s.reset);

  useEffect(() => {
    const handler = async (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;

      // Space = toggle play (only if project loaded)
      if (e.code === 'Space' && !meta && hasProject) {
        e.preventDefault();
        if (isPlaying) {
          window.blueAPI.stopPlayback();
          resetPlayback();
        } else {
          await window.blueAPI.togglePlay();
        }
      }

      // Escape = stop playback
      if (e.code === 'Escape' && !meta) {
        e.preventDefault();
        if (isPlaying) {
          window.blueAPI.stopPlayback();
          resetPlayback();
        }
      }

      // Cmd/Ctrl+O = open file
      if (e.code === 'KeyO' && meta) {
        e.preventDefault();
        await window.blueAPI.openFile();
      }

      // Cmd/Ctrl+S = save file
      if (e.code === 'KeyS' && meta && hasProject) {
        e.preventDefault();
        // Shift+S = Save As
        if (e.shiftKey) {
          await window.blueAPI.saveFileAs();
        } else {
          await window.blueAPI.saveFile();
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [hasProject, isPlaying, resetPlayback]);
}
