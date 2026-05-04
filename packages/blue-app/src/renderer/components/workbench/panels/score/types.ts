export type {
  ScoreDocumentSnapshot,
  ScoreTimeStateSnapshot,
  ScoreLayerGroupSnapshot,
  ScoreLayerSnapshot,
  ScoreRowObjectSnapshot,
  MarkerSnapshot,
  PolyObjectLayerGroupSnapshot,
  AudioLayerGroupSnapshot,
  PatternsLayerGroupSnapshot,
  ToolbarProjectTransportSnapshot,
} from '../../../../../shared/project-editor';

export interface ScorePathSegment {
  groupId: string | null;
  label: string;
}

export interface ScorePathSession {
  activeGroupId: string | null;
  segments: ScorePathSegment[];
  scrollByGroupId: Record<string, { x: number; y: number }>;
}

export const DEFAULT_ROW_HEIGHT = 44;
export const HEADER_WIDTH = 160;
export const RULER_HEIGHT = 24;
