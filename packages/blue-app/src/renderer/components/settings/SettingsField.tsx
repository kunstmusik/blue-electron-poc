import React from 'react';

interface SettingsFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'number';
  placeholder?: string;
  description?: string;
}

export default function SettingsField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  description,
}: SettingsFieldProps): React.ReactElement {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{
        display: 'block',
        fontSize: '12px',
        fontWeight: 500,
        color: '#aaa',
        marginBottom: '4px',
      }}>
        {label}
      </label>
      {description && (
        <div style={{ fontSize: '11px', color: '#666', marginBottom: '6px' }}>
          {description}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '6px 10px',
          background: '#0d0d1a',
          color: '#e0e0e0',
          border: '1px solid var(--color-blue-border, #0f3460)',
          borderRadius: '4px',
          fontSize: '13px',
          fontFamily: 'inherit',
          outline: 'none',
        }}
      />
    </div>
  );
}
