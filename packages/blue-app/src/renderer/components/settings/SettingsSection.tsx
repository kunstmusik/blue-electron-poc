import React from 'react';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
  dependencyNote?: string | null;
}

export default function SettingsSection({
  title,
  children,
  dependencyNote,
}: SettingsSectionProps): React.ReactElement {
  return (
    <div>
      <h2 style={{ fontSize: '16px', color: '#fff', margin: '0 0 20px 0' }}>
        {title}
      </h2>
      {children}
      {dependencyNote && (
        <div style={{
          marginTop: '16px',
          padding: '8px 12px',
          background: 'rgba(255, 165, 0, 0.1)',
          border: '1px solid rgba(255, 165, 0, 0.3)',
          borderRadius: '4px',
          fontSize: '11px',
          color: '#cc8800',
        }}>
          {dependencyNote}
        </div>
      )}
    </div>
  );
}
