export {};

import type {
  BsbRealtimeControlUpdate,
  ProjectDocumentCommitReceipt,
  ProjectDocumentPatch,
  ProjectEditorSnapshot,
  ProjectLoadedPayload,
  PlaybackClockSnapshot,
} from '../../shared/project-editor';
import type { NativeMenuCommand } from '../../shared/workbench-menu';
import type { EngineOutputPayload } from '../../shared/io-provider';

export type BlueLiveStatus = 'idle' | 'starting' | 'running' | 'stopping' | 'stopped' | 'error';

export interface BlueLiveStatusSnapshot {
  status: BlueLiveStatus;
  running: boolean;
  message?: string;
  sessionId: number;
  projectRevision?: number | null;
}

export interface EvaluateCodeRequest {
  editorKind: 'orc' | 'sco';
  text: string;
  sourcePanelId: string;
}

export interface EvaluateCodeResult {
  routedTo: 'blueLive' | 'realtime' | 'none';
  ok: boolean;
  message?: string;
}

declare global {
  interface Window {
    blueAPI: {
      openFile: () => Promise<string | null>;
      openBsbFileSelector: (currentValue?: string) => Promise<string | null>;
      setBsbFileSelectorPath: (filePath: string) => Promise<string | null>;
      copyBsbFileSelectorToMediaFolder: (currentValue?: string) => Promise<string | null>;
      saveFile: () => Promise<string | null>;
      saveFileAs: () => Promise<string | null>;
      getProjectDocument: () => Promise<ProjectEditorSnapshot | null>;
      updateProjectDocument: (
        patch: ProjectDocumentPatch,
      ) => Promise<ProjectEditorSnapshot | null>;
      commitProjectDocumentPatches: (
        patches: ProjectDocumentPatch[],
      ) => Promise<ProjectDocumentCommitReceipt>;
      sendBsbRealtimeControlUpdate: (
        update: BsbRealtimeControlUpdate,
      ) => Promise<void>;
      readClipboardText: () => Promise<string>;
      writeClipboardText: (text: string) => Promise<void>;
      togglePlay: () => Promise<boolean>;
      stopPlayback: () => Promise<void>;
      getProjectInfo: () => Promise<Record<string, string> | null>;
      generateCsdToScreen: () => Promise<void>;
      generateCsdToDisk: () => Promise<void>;
      importBlueUdo: () => Promise<string | null>;
      importCsoundUdo: () => Promise<string | null>;
      exportBlueUdo: (xmlText: string) => Promise<void>;
      exportCsoundUdo: (codeText: string, udoName: string) => Promise<void>;
      onProjectLoaded: (cb: (info: ProjectLoadedPayload) => void) => void;
      onPlaybackStatus: (cb: (status: { status: string; message?: string }) => void) => void;
      onPlaybackClock: (cb: (clock: PlaybackClockSnapshot) => void) => void;
      onPlaybackError: (cb: (error: string) => void) => void;
      onNativeMenuCommand: (cb: (command: NativeMenuCommand) => void) => void;
      onSaveComplete: (cb: (info: { filePath: string }) => void) => void;
      onSaveError: (cb: (error: string) => void) => void;
      onEngineOutput: (cb: (payload: EngineOutputPayload) => void) => () => void;
      onEngineOutputSelect: (cb: (payload: { tabName: string }) => void) => () => void;
      onEngineOutputReset: (cb: (payload: { tabName: string }) => void) => () => void;
      onGeneratedCsd: (cb: (csdText: string) => void) => () => void;
      onGeneratedCsdError: (cb: (error: string) => void) => () => void;

      // Blue Live
      toggleBlueLive: () => Promise<BlueLiveStatusSnapshot>;
      stopBlueLive: () => Promise<BlueLiveStatusSnapshot>;
      recompileBlueLive: () => Promise<BlueLiveStatusSnapshot>;
      sendBlueLiveAllNotesOff: () => Promise<{ ok: boolean; message?: string }>;
      getBlueLiveStatus: () => Promise<BlueLiveStatusSnapshot>;
      onBlueLiveStatus: (cb: (snapshot: BlueLiveStatusSnapshot) => void) => () => void;

      // Settings
      openSettingsWindow: () => Promise<void>;

      // Evaluate Code
      evaluateCode: (request: EvaluateCodeRequest) => Promise<EvaluateCodeResult>;
    };
  }
}
