export {};

import type {
  ProjectDocumentPatch,
  ProjectEditorSnapshot,
  ProjectLoadedPayload,
  PlaybackClockSnapshot,
} from '../../shared/project-editor';
import type { NativeMenuCommand } from '../../shared/workbench-menu';

declare global {
  interface Window {
    blueAPI: {
      openFile: () => Promise<string | null>;
      saveFile: () => Promise<string | null>;
      saveFileAs: () => Promise<string | null>;
      getProjectDocument: () => Promise<ProjectEditorSnapshot | null>;
      updateProjectDocument: (
        patch: ProjectDocumentPatch,
      ) => Promise<ProjectEditorSnapshot | null>;
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
