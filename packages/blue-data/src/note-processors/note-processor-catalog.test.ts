import { describe, expect, it } from 'vitest';
import { getNoteProcessorCatalog, getNoteProcessorDefinition, isAddableProcessor } from './note-processor-catalog';
import { AddProcessor } from './add-processor';
import { MultiplyProcessor } from './multiply-processor';

describe('Note processor catalog', () => {
  it('has 16 in-scope processors', () => {
    expect(getNoteProcessorCatalog()).toHaveLength(16);
  });

  it('creates default instances for each processor type', () => {
    for (const def of getNoteProcessorCatalog()) {
      const proc = def.createDefault();
      expect(proc).toBeDefined();
      expect(proc.getDisplayName()).toBe(def.displayName);
    }
  });

  it('looks up definition by type', () => {
    const def = getNoteProcessorDefinition('AddProcessor');
    expect(def).toBeDefined();
    expect(def!.type).toBe('AddProcessor');
    expect(def!.position).toBe(10);
  });

  it('returns undefined for unknown type', () => {
    expect(getNoteProcessorDefinition('Unknown')).toBeUndefined();
  });

  it('isAddableProcessor returns true for in-scope types', () => {
    expect(isAddableProcessor('AddProcessor')).toBe(true);
    expect(isAddableProcessor('MultiplyProcessor')).toBe(true);
  });

  it('isAddableProcessor returns false for Code and PythonProcessor', () => {
    expect(isAddableProcessor('Code')).toBe(false);
    expect(isAddableProcessor('PythonProcessor')).toBe(false);
  });

  it('definitions have correct parameter counts', () => {
    expect(getNoteProcessorDefinition('AddProcessor')!.parameters).toHaveLength(2);
    expect(getNoteProcessorDefinition('RetrogradeProcessor')!.parameters).toHaveLength(0);
    expect(getNoteProcessorDefinition('RandomAddProcessor')!.parameters).toHaveLength(5);
    expect(getNoteProcessorDefinition('TuningProcessor')!.parameters).toHaveLength(3);
    expect(getNoteProcessorDefinition('TuningProcessor')!.parameters[2]!.valueType).toBe('multilineText');
  });
});
