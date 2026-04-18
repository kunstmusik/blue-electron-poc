import { useEffect } from 'react';
import { toast } from 'sonner';
import { useProjectStore } from '../stores/project-store';
import { usePlaybackStore } from '../stores/playback-store';
import { useUIStore } from '../stores/ui-store';
import { useSettingsStore } from '../stores/settings-store';

// Declare the global blueAPI type
declare global {
  interface Window {
    blueAPI: {
      openFile: () => Promise<string | null>;
      saveFile: () => Promise<string | null>;
      saveFileAs: () => Promise<string | null>;
      togglePlay: () => Promise<boolean>;
      stopPlayback: () => Promise<void>;
      getProjectInfo: () => Promise<Record<string, string> | null>;
      onProjectLoaded: (cb: (info: Record<string, string>) => void) => void;
      onPlaybackStatus: (cb: (status: { status: string; message?: string }) => void) => void;
      onPlaybackError: (cb: (error: string) => void) => void;
      onSaveComplete: (cb: (info: { filePath: string }) => void) => void;
      onSaveError: (cb: (error: string) => void) => void;
    };
  }
}

export function useIPCListeners(): void {
  const setProjectInfo = useProjectStore((s) => s.setProjectInfo);
  const setActivePanel = useUIStore((s) => s.setActivePanel);
  const addRecentFile = useSettingsStore((s) => s.addRecentFile);
  const setStatus = usePlaybackStore((s) => s.setStatus);
  const setError = usePlaybackStore((s) => s.setError);

  useEffect(() => {
    if (!window.blueAPI) return;

    window.blueAPI.onProjectLoaded((info) => {
      setProjectInfo(info);
      setActivePanel('project');
      if (info.filePath) {
        addRecentFile(info.filePath);
      }
      toast.success(`Loaded: ${info.title || 'Project'}`);
    });

    window.blueAPI.onPlaybackStatus((status) => {
      setStatus(status);
    });

    window.blueAPI.onPlaybackError((error) => {
      setError(error);
    });

    window.blueAPI.onSaveComplete(() => {
      toast.success('File saved successfully');
    });

    window.blueAPI.onSaveError((error) => {
      toast.error(`Save error: ${error}`);
    });
  }, [setProjectInfo, setActivePanel, addRecentFile, setStatus, setError]);
}
