import React, { useState, useEffect, useCallback } from 'react';
import type {
  ProgramSettingsSnapshot,
  ProgramSettingsPanelId,
  ProgramSettingsSaveResult,
  SettingsValidationIssue,
} from '../../../shared/program-settings';
import { PROGRAM_SETTINGS_PANEL_ORDER } from '../../../shared/program-settings';
import GeneralSettings from './GeneralSettings';
import ProjectDefaultsSettings from './ProjectDefaultsSettings';
import PlaybackSettings from './PlaybackSettings';
import UtilitySettings from './UtilitySettings';
import RealtimeRenderSettings from './RealtimeRenderSettings';
import DiskRenderSettings from './DiskRenderSettings';

export default function SettingsApp(): React.ReactElement {
  const [active, setActive] = useState<ProgramSettingsPanelId>('general');
  const [savedSnapshot, setSavedSnapshot] = useState<ProgramSettingsSnapshot | null>(null);
  const [draft, setDraft] = useState<ProgramSettingsSnapshot | null>(null);
  const [dirty, setDirty] = useState(false);
  const [validationIssues, setValidationIssues] = useState<SettingsValidationIssue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const snapshot = await window.blueAPI.getProgramSettings();
        if (!cancelled) {
          setSavedSnapshot(snapshot);
          setDraft(snapshot);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleDraftChange = useCallback((updated: ProgramSettingsSnapshot) => {
    setDraft(updated);
    setDirty(true);
    setValidationIssues([]);
  }, []);

  const handleApply = useCallback(async () => {
    if (!draft) return;
    const result: ProgramSettingsSaveResult = await window.blueAPI.saveProgramSettings(draft);
    if (result.ok && result.snapshot) {
      setSavedSnapshot(result.snapshot);
      setDraft(result.snapshot);
      setDirty(false);
      setValidationIssues(result.validationIssues ?? []);
    } else {
      setValidationIssues(result.validationIssues ?? []);
    }
  }, [draft]);

  const handleCancel = useCallback(() => {
    if (savedSnapshot) {
      setDraft(savedSnapshot);
      setDirty(false);
      setValidationIssues([]);
    }
  }, [savedSnapshot]);

  const handleResetPanel = useCallback(async () => {
    const snapshot = await window.blueAPI.resetProgramSettingsPanel(active);
    setSavedSnapshot(snapshot);
    setDraft(snapshot);
    setDirty(false);
    setValidationIssues([]);
  }, [active]);

  if (loading || !draft) {
    return (
      <div style={{ padding: '24px', color: '#888', fontSize: '13px' }}>
        Loading settings...
      </div>
    );
  }

  const renderPanel = () => {
    switch (active) {
      case 'general':
        return (
          <GeneralSettings
            settings={draft.general}
            onChange={(general) => handleDraftChange({ ...draft, general })}
          />
        );
      case 'projectDefaults':
        return (
          <ProjectDefaultsSettings
            settings={draft.projectDefaults}
            onChange={(projectDefaults) => handleDraftChange({ ...draft, projectDefaults })}
          />
        );
      case 'playback':
        return (
          <PlaybackSettings
            settings={draft.playback}
            onChange={(playback) => handleDraftChange({ ...draft, playback })}
          />
        );
      case 'utility':
        return (
          <UtilitySettings
            settings={draft.utility}
            onChange={(utility) => handleDraftChange({ ...draft, utility })}
          />
        );
      case 'realtimeRender':
        return (
          <RealtimeRenderSettings
            settings={draft.realtimeRender}
            onChange={(realtimeRender) => handleDraftChange({ ...draft, realtimeRender })}
          />
        );
      case 'diskRender':
        return (
          <DiskRenderSettings
            settings={draft.diskRender}
            onChange={(diskRender) => handleDraftChange({ ...draft, diskRender })}
          />
        );
    }
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: 'var(--color-blue-bg, #1a1a2e)',
      color: '#c8c8d8',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      fontSize: '13px',
    }}>
      <nav style={{
        width: '180px',
        flexShrink: 0,
        background: 'var(--color-blue-surface, #16213e)',
        borderRight: '1px solid var(--color-blue-border, #0f3460)',
        padding: '12px 0',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {PROGRAM_SETTINGS_PANEL_ORDER.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActive(cat.id)}
            style={{
              display: 'block',
              width: '100%',
              padding: '8px 16px',
              border: 'none',
              borderLeft: active === cat.id ? '2px solid var(--color-blue-accent, #e94560)' : '2px solid transparent',
              background: active === cat.id ? 'rgba(233,69,96,0.08)' : 'transparent',
              color: active === cat.id ? '#fff' : 'var(--color-blue-muted, #888)',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '13px',
              fontFamily: 'inherit',
            }}
          >
            {cat.label}
          </button>
        ))}
      </nav>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
          {renderPanel()}
        </div>
        {validationIssues.length > 0 && (
          <div style={{
            padding: '8px 16px',
            background: 'rgba(255, 0, 0, 0.1)',
            borderTop: '1px solid rgba(255, 0, 0, 0.3)',
            fontSize: '12px',
            color: '#ff6666',
          }}>
            {validationIssues.map((issue, i) => (
              <div key={i}>{issue.path}: {issue.message}</div>
            ))}
          </div>
        )}
        <div style={{
          padding: '12px 24px',
          borderTop: '1px solid var(--color-blue-border, #0f3460)',
          display: 'flex',
          gap: '8px',
          justifyContent: 'flex-end',
        }}>
          <button
            type="button"
            onClick={handleResetPanel}
            style={{
              padding: '6px 16px',
              background: 'transparent',
              color: '#888',
              border: '1px solid #0f3460',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              fontFamily: 'inherit',
            }}
          >
            Reset Panel
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={!dirty}
            style={{
              padding: '6px 16px',
              background: 'transparent',
              color: dirty ? '#c8c8d8' : '#555',
              border: '1px solid #0f3460',
              borderRadius: '4px',
              cursor: dirty ? 'pointer' : 'default',
              fontSize: '13px',
              fontFamily: 'inherit',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!dirty}
            style={{
              padding: '6px 16px',
              background: dirty ? '#e94560' : '#333',
              color: dirty ? '#fff' : '#666',
              border: 'none',
              borderRadius: '4px',
              cursor: dirty ? 'pointer' : 'default',
              fontSize: '13px',
              fontFamily: 'inherit',
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
