import type {
  Completion,
  CompletionContext,
  CompletionResult,
  CompletionSource,
} from '@codemirror/autocomplete';
import {
  csoundRichOpcodeCatalog,
  type RichOpcodeCatalogEntry,
} from '@kunstmusik/codemirror-lang-csound/rich';

import type { JavaBlueCsoundCompletionOptions } from './editor-adapter-types';

const wordCompletionPattern = /[A-Za-z_][A-Za-z0-9_]*(?::[A-Za-z_][A-Za-z0-9_]*)?/;
const wordCompletionValidFor = /^[A-Za-z_][A-Za-z0-9_]*(?::[A-Za-z_][A-Za-z0-9_]*)?$/;
const angleCompletionPattern = /<[A-Za-z0-9_]*$/;
const angleCompletionValidFor = /^<[A-Za-z0-9_]*$/;
const userOpcodePattern = /^\s*opcode\s+([A-Za-z_][A-Za-z0-9_]*)/gm;

const csoundVariablePrefixes = [
  'gi',
  'gk',
  'ga',
  'gw',
  'gf',
  'gS',
  'i',
  'k',
  'a',
  'w',
  'f',
  'S',
] as const;

const blueVariableCompletions: Completion[] = [
  '<TOTAL_DUR>',
  '<RENDER_START>',
  '<PROCESSING_START>',
  '<INSTR_ID>',
  '<INSTR_NAME>',
].map((label) => ({
  label,
  type: 'constant',
  detail: 'Blue variable',
  info: `${label}\n\nBlue runtime variable replacement token.`,
  boost: 35,
}));

const blueOpcodeCompletions: Completion[] = [
  {
    label: 'blueMixerOut',
    type: 'function',
    detail: 'Blue opcode',
    apply: 'blueMixerOut asig1 [, asig2...]',
    info: 'blueMixerOut\n\nRoutes audio-rate signals to the Blue mixer.',
    boost: 25,
  },
  {
    label: 'blueMixerOutSubChannel',
    displayLabel: 'blueMixerOut "subchannelName"',
    type: 'function',
    detail: 'Blue opcode',
    apply: 'blueMixerOut "subchannelName", asig1 ,asig2 [, asig3...]',
    info: 'blueMixerOut "subchannelName"\n\nRoutes audio-rate signals to a named Blue mixer subchannel.',
    boost: 24,
  },
  {
    label: 'blueMixerIn',
    type: 'function',
    detail: 'Blue opcode',
    apply: 'asig1 [, asig2...] blueMixerIn',
    info: 'blueMixerIn\n\nReads audio-rate signals from the Blue mixer.',
    boost: 25,
  },
];

const opcodeNameSet = new Set(csoundRichOpcodeCatalog.opcodes.map((entry) => entry.name));
const opcodeCompletions = csoundRichOpcodeCatalog.opcodes
  .map(createOpcodeCompletion)
  .sort((left, right) => left.label.localeCompare(right.label));

function createOpcodeCompletion(entry: RichOpcodeCatalogEntry): Completion {
  return {
    label: entry.name,
    type: 'function',
    detail: 'opcode',
    apply: getOpcodeInsertText(entry),
    info: getOpcodeInfoText(entry),
    boost: 5,
  };
}

function getOpcodeInsertText(entry: RichOpcodeCatalogEntry): string {
  const syntax = entry.syntax?.find((candidate) => !candidate.includes(' = ')) ?? entry.syntax?.[0];
  return syntax?.trim() ?? entry.name;
}

function getOpcodeInfoText(entry: RichOpcodeCatalogEntry): string {
  const parts = [entry.name];

  if (entry.shortDescription) {
    parts.push('', `${entry.name} -- ${entry.shortDescription}`);
  }

  if (entry.syntax && entry.syntax.length > 0) {
    parts.push('', 'Syntax', ...entry.syntax);
  }

  if (entry.category) {
    parts.push('', `Category: ${entry.category}`);
  }

  if (entry.manualPage) {
    parts.push(`Manual: ${entry.manualPage}`);
  }

  return parts.join('\n');
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isCsoundVariablePrefix(value: string): boolean {
  return csoundVariablePrefixes.some((prefix) => value.startsWith(prefix));
}

export function findDocumentLocalCsoundVariables(
  documentTextBeforeWord: string,
  filter: string,
): Completion[] {
  if (!filter || !isCsoundVariablePrefix(filter)) {
    return [];
  }

  const variablePattern = new RegExp(`\\b${escapeRegExp(filter)}\\w*`, 'g');
  const variableNames = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = variablePattern.exec(documentTextBeforeWord)) !== null) {
    const variableName = match[0];
    if (!opcodeNameSet.has(variableName)) {
      variableNames.add(variableName);
    }
  }

  return Array.from(variableNames)
    .sort()
    .map((label) => ({
      label,
      type: 'variable',
      detail: 'variable',
      boost: 30,
    }));
}

function findDocumentUserOpcodes(documentText: string): Completion[] {
  const opcodeNames = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = userOpcodePattern.exec(documentText)) !== null) {
    opcodeNames.add(match[1]);
  }

  return Array.from(opcodeNames)
    .sort()
    .map((label) => ({
      label,
      type: 'function',
      detail: 'UDO',
      boost: 22,
    }));
}

function createProjectOpcodeCompletions(projectOpcodeNames: string[] | undefined): Completion[] {
  if (!projectOpcodeNames || projectOpcodeNames.length === 0) {
    return [];
  }

  return Array.from(new Set(projectOpcodeNames))
    .sort()
    .map((label) => ({
      label,
      type: 'function',
      detail: 'project UDO',
      boost: 21,
    }));
}

function createBsbReplacementKeyCompletions(
  options: JavaBlueCsoundCompletionOptions,
): Completion[] {
  return (options.bsbReplacementKeys ?? [])
    .filter((item) => item.key.trim().length > 0 && !/\s/.test(item.key))
    .map((item) => ({
      label: `<${item.key}>`,
      displayLabel: item.key,
      type: 'variable',
      detail: item.objectType ?? 'BSB object',
      apply: `<${item.key}>`,
      boost: 40,
    }));
}

function dedupeCompletions(completions: Completion[]): Completion[] {
  const labels = new Set<string>();
  const deduped: Completion[] = [];

  for (const completion of completions) {
    if (labels.has(completion.label)) {
      continue;
    }

    labels.add(completion.label);
    deduped.push(completion);
  }

  return deduped;
}

function filterWordCompletions(completions: Completion[], filter: string): Completion[] {
  if (!filter) {
    return completions;
  }

  return completions.filter((completion) => completion.label.startsWith(filter));
}

function createWordCompletionResult(
  context: CompletionContext,
  options: JavaBlueCsoundCompletionOptions,
): CompletionResult | null {
  const word = context.matchBefore(wordCompletionPattern);
  if (!word && !context.explicit) {
    return null;
  }

  const filter = word?.text ?? '';
  const from = word?.from ?? context.pos;
  const documentText = context.state.doc.toString();
  const documentTextBeforeWord = context.state.doc.sliceString(0, from);
  const completions = dedupeCompletions([
    ...findDocumentLocalCsoundVariables(documentTextBeforeWord, filter),
    ...findDocumentUserOpcodes(documentText),
    ...createProjectOpcodeCompletions(options.projectOpcodeNames),
    ...blueOpcodeCompletions,
    ...opcodeCompletions,
  ]);
  const filteredCompletions = filterWordCompletions(completions, filter);

  if (filteredCompletions.length === 0) {
    return null;
  }

  return {
    from,
    options: filteredCompletions,
    validFor: wordCompletionValidFor,
  };
}

function createAngleCompletionResult(
  context: CompletionContext,
  options: JavaBlueCsoundCompletionOptions,
): CompletionResult | null {
  const angledWord = context.matchBefore(angleCompletionPattern);
  if (!angledWord && !context.explicit) {
    return null;
  }

  if (!angledWord) {
    return null;
  }

  const filter = angledWord.text.slice(1);
  const completions = dedupeCompletions([
    ...blueVariableCompletions,
    ...createBsbReplacementKeyCompletions(options),
  ]).filter((completion) => completion.label.slice(1).startsWith(filter));

  if (completions.length === 0) {
    return null;
  }

  return {
    from: angledWord.from,
    options: completions,
    validFor: angleCompletionValidFor,
  };
}

export function createJavaBlueCsoundCompletionSource(
  options: JavaBlueCsoundCompletionOptions = {},
): CompletionSource {
  return (context: CompletionContext): CompletionResult | null =>
    createAngleCompletionResult(context, options) ?? createWordCompletionResult(context, options);
}
