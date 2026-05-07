import React from 'react';
import type {
  ScoreObjectEditorDocumentSnapshot,
  ScorePatch,
  TypeSpecificScoreObjectEditorSnapshot,
} from '../../../../../shared/project-editor';
import CodeBackedScoreObjectEditor from './editors/CodeBackedScoreObjectEditor';
import AudioClipScoreObjectEditor from './editors/AudioClipScoreObjectEditor';
import FileBackedScoreObjectEditor from './editors/FileBackedScoreObjectEditor';
import PatternObjectEditor from './editors/PatternObjectEditor';
import LineObjectEditor from './editors/LineObjectEditor';
import ZakLineObjectEditor from './editors/ZakLineObjectEditor';
import PianoRollEditor from './editors/PianoRollEditor';
import TrackerObjectEditor from './editors/TrackerObjectEditor';

import JMaskEditor from './editors/JMaskEditor';
import SoundObjectEditor from './editors/SoundObjectEditor';
import PolyObjectEditor from './editors/PolyObjectEditor';
import UnsupportedScoreObjectEditor from './editors/UnsupportedScoreObjectEditor';

export interface ScoreObjectEditorComponentProps {
  document: ScoreObjectEditorDocumentSnapshot;
  onPatch: (patch: ScorePatch) => void;
}

export type ScoreObjectEditorComponent = React.ComponentType<ScoreObjectEditorComponentProps>;

function resolveStructuredEditor(editorFamily: string): ScoreObjectEditorComponent {
  switch (editorFamily) {
    case 'PatternObject': return PatternObjectEditor;
    case 'LineObject': return LineObjectEditor;
    case 'ZakLineObject': return ZakLineObjectEditor;
    case 'PianoRoll': return PianoRollEditor;
    case 'TrackerObject': return TrackerObjectEditor;

    case 'JMask': return JMaskEditor;
    case 'Sound': return SoundObjectEditor;
    case 'PolyObject': return PolyObjectEditor;
    default: return UnsupportedScoreObjectEditor;
  }
}

export function resolveEditorComponent(
  editor: TypeSpecificScoreObjectEditorSnapshot,
): ScoreObjectEditorComponent {
  switch (editor.kind) {
    case 'code':
      return CodeBackedScoreObjectEditor;
    case 'audioClip':
      return AudioClipScoreObjectEditor;
    case 'file':
      return FileBackedScoreObjectEditor;
    case 'structured':
      return resolveStructuredEditor(editor.editorFamily);
    case 'fallback':
    default:
      return UnsupportedScoreObjectEditor;
  }
}
