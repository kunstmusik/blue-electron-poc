import type {
  InstrumentPatch,
  InstrumentSnapshot,
  OrchestraPatch,
  OrchestraSnapshot,
} from '../../../../../shared/project-editor';

export interface OrchestraMutationProps {
  onOrchestraPatch: (patch: OrchestraPatch) => void | Promise<void>;
}

export interface SelectedInstrumentEditorProps extends OrchestraMutationProps {
  instrument: InstrumentSnapshot;
  onInstrumentPatch: (patch: InstrumentPatch) => void | Promise<void>;
}

export interface ArrangementPanelProps extends OrchestraMutationProps {
  orchestra: OrchestraSnapshot;
  selectedAssignmentId: string | null;
  onSelectAssignment: (assignmentId: string) => void;
}

