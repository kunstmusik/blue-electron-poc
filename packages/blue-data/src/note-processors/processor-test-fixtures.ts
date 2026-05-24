import {
  getNoteProcessorCatalog,
  NoteProcessorChain,
  NoteList,
  Note,
  AddProcessor,
  EqualsProcessor,
  InversionProcessor,
  LineAddProcessor,
  LineMultiplyProcessor,
  MultiplyProcessor,
  PchAddProcessor,
  PchInversionProcessor,
  RandomAddProcessor,
  RandomMultiplyProcessor,
  RotateProcessor,
  SubListProcessor,
  SwitchProcessor,
  TimeWarpProcessor,
  TuningProcessor,
} from '../index';

export const ALL_PROCESSOR_TYPES: string[] = getNoteProcessorCatalog().map((d) => d.type);

export const ALL_SCOPES = ['object', 'layer', 'group', 'root'] as const;
export type TestScope = (typeof ALL_SCOPES)[number];

export function createProcessorForType(type: string) {
  const def = getNoteProcessorCatalog().find((d) => d.type === type);
  if (!def) throw new Error(`Unknown processor type: ${type}`);
  return def.createDefault();
}

export function createTestNoteList(): NoteList {
  const nl = new NoteList();
  nl.add(Note.createNoteFromText('i 1 0 2 8.00 2 3')!);
  nl.add(Note.createNoteFromText('i 2 2 1 8.02 4 5')!);
  nl.add(Note.createNoteFromText('i 3 3 1 8.04 6 7')!);
  return nl;
}

export function configureProcessorForScopeMatrix(type: string) {
  const proc = createProcessorForType(type);

  if (proc instanceof AddProcessor) {
    proc.setVal('5');
  } else if (proc instanceof PchAddProcessor) {
    proc.setVal('1');
  } else if (proc instanceof MultiplyProcessor) {
    proc.setVal('2');
  } else if (proc instanceof RandomAddProcessor) {
    proc.setMin('1');
    proc.setMax('1');
    proc.setSeedUsed(true);
    proc.setSeed('1234');
  } else if (proc instanceof RandomMultiplyProcessor) {
    proc.setMin('2');
    proc.setMax('2');
    proc.setSeedUsed(true);
    proc.setSeed('1234');
  } else if (proc instanceof SubListProcessor) {
    proc.setStart('1');
    proc.setEnd('2');
  } else if (proc instanceof RotateProcessor) {
    proc.setNoteIndex('2');
  } else if (proc instanceof InversionProcessor) {
    proc.setVal('10');
  } else if (proc instanceof PchInversionProcessor) {
    proc.setVal('8.00');
  } else if (proc instanceof EqualsProcessor) {
    proc.setVal('9');
  } else if (proc instanceof SwitchProcessor) {
    proc.setPfield1('4');
    proc.setPfield2('5');
  } else if (proc instanceof TimeWarpProcessor) {
    proc.setTimeWarpString('0 120');
  } else if (proc instanceof LineAddProcessor) {
    proc.setLineAddString('0 1 4 2');
  } else if (proc instanceof LineMultiplyProcessor) {
    proc.setLineMultiplyString('0 2 4 3');
  } else if (proc instanceof TuningProcessor) {
    proc.setBaseFrequency('220');
  }

  return proc;
}

export function createChainWithProcessor(type: string): NoteProcessorChain {
  const chain = new NoteProcessorChain();
  chain.addProcessor(createProcessorForType(type));
  return chain;
}

export function createConfiguredChainWithProcessor(type: string): NoteProcessorChain {
  const chain = new NoteProcessorChain();
  chain.addProcessor(configureProcessorForScopeMatrix(type));
  return chain;
}
