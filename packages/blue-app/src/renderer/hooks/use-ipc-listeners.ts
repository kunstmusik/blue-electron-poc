import { useEffect } from 'react';
import { toast } from 'sonner';
import { useProjectStore } from '../stores/project-store';
import { usePlaybackStore } from '../stores/playback-store';
import { useUIStore } from '../stores/ui-store';
import { useSettingsStore } from '../stores/settings-store';
import { useWorkbenchStore } from '../stores/workbench-store';
import type {
  PlaybackClockSnapshot,
  ProjectLoadedPayload,
} from '../../shared/project-editor';
import type { NativeMenuCommand } from '../../shared/workbench-menu';

// Declare the global blueAPI type
declare global {
  interface Window {
    blueAPI: {
      openFile: () => Promise<string | null>;
      openBsbFileSelector: (currentValue?: string) => Promise<string | null>;
      setBsbFileSelectorPath: (filePath: string) => Promise<string | null>;
      copyBsbFileSelectorToMediaFolder: (currentValue?: string) => Promise<string | null>;
      saveFile: () => Promise<string | null>;
      saveFileAs: () => Promise<string | null>;
      getProjectDocument: () => Promise<import('../../shared/project-editor').ProjectEditorSnapshot | null>;
      updateProjectDocument: (
        patch: import('../../shared/project-editor').ProjectDocumentPatch,
      ) => Promise<import('../../shared/project-editor').ProjectEditorSnapshot | null>;
      readClipboardText: () => Promise<string>;
      writeClipboardText: (text: string) => Promise<void>;
      togglePlay: () => Promise<boolean>;
      stopPlayback: () => Promise<void>;
      getProjectInfo: () => Promise<Record<string, string> | null>;
      onProjectLoaded: (cb: (info: ProjectLoadedPayload) => void) => void;
      onPlaybackStatus: (cb: (status: { status: string; message?: string }) => void) => void;
      onPlaybackClock: (cb: (clock: PlaybackClockSnapshot) => void) => void;
      onPlaybackError: (cb: (error: string) => void) => void;
      onNativeMenuCommand: (cb: (command: NativeMenuCommand) => void) => void;
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
  const acceptPlaybackClock = usePlaybackStore((s) => s.acceptPlaybackClock);
  const resetPlayback = usePlaybackStore((s) => s.reset);
  const handleNativeMenuCommand = useWorkbenchStore((s) => s.handleNativeMenuCommand);

  useEffect(() => {
    if (!window.blueAPI) return;

    window.blueAPI.onProjectLoaded((info) => {
      resetPlayback();
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

    window.blueAPI.onPlaybackClock((clock) => {
      acceptPlaybackClock(clock);
    });

    window.blueAPI.onPlaybackError((error) => {
      setError(error);
    });

    window.blueAPI.onNativeMenuCommand((command) => {
      handleNativeMenuCommand(command);
    });

    window.blueAPI.onSaveComplete(() => {
      toast.success('File saved successfully');
    });

    window.blueAPI.onSaveError((error) => {
      toast.error(`Save error: ${error}`);
    });
  }, [
    addRecentFile,
    acceptPlaybackClock,
    handleNativeMenuCommand,
    resetPlayback,
    setError,
    setProjectInfo,
    setActivePanel,
    setStatus,
  ]);
}
