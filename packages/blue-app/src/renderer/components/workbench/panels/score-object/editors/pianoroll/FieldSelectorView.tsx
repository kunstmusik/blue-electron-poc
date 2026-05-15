import React, { useCallback } from 'react';
import type { FieldDefSnapshot } from './types';

interface FieldSelectorViewProps {
  fieldDefinitions: FieldDefSnapshot[];
  selectedFieldDef: FieldDefSnapshot | null;
  onSelectField: (fieldDef: FieldDefSnapshot | null) => void;
}

export default function FieldSelectorView({
  fieldDefinitions,
  selectedFieldDef,
  onSelectField,
}: FieldSelectorViewProps): React.ReactElement {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = parseInt(e.target.value, 10);
    if (idx < 0 || idx >= fieldDefinitions.length) {
      onSelectField(null);
    } else {
      onSelectField(fieldDefinitions[idx]!);
    }
  }, [fieldDefinitions, onSelectField]);

  const selectedIndex = selectedFieldDef
    ? fieldDefinitions.findIndex((fd) => fd.fieldName === selectedFieldDef.fieldName)
    : -1;

  return (
    <select
      className="w-full h-full bg-[#10192a] border-t border-blue-border/30 text-[10px] text-blue-muted px-1 focus:outline-none"
      value={selectedIndex}
      onChange={handleChange}
    >
      {fieldDefinitions.map((fd, i) => (
        <option key={i} value={i}>{fd.fieldName}</option>
      ))}
    </select>
  );
}
