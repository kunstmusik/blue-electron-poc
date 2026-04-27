import React, { useState, useEffect, useRef, useCallback } from 'react';

export interface FontChoice {
  name: string;
  size: number;
  style: number;
}

const STYLE_OPTIONS = [
  { value: 0, label: 'Plain' },
  { value: 1, label: 'Bold' },
  { value: 2, label: 'Italic' },
  { value: 3, label: 'Bold Italic' },
];

let cachedFontFamilies: string[] | null = null;

async function getSystemFontFamilies(): Promise<string[]> {
  if (cachedFontFamilies) return cachedFontFamilies;
  try {
    if (typeof window !== 'undefined' && typeof window.queryLocalFonts === 'function') {
      const fonts = await window.queryLocalFonts();
      const families = [...new Set(fonts.map(f => f.family))];
      const sorted = families.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
      if (!sorted.includes('Roboto')) {
        sorted.unshift('Roboto');
      }
      cachedFontFamilies = sorted;
      return cachedFontFamilies;
    }
  } catch { /* fallback below */ }
  return ['Roboto', 'Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Georgia',
    'Impact', 'Lucida Console', 'Palatino Linotype', 'Segoe UI',
    'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Helvetica',
    'Monaco', 'Menlo', 'SF Mono'];
}

interface FontChooserDialogProps {
  open: boolean;
  font: FontChoice;
  onConfirm: (font: FontChoice) => void;
  onCancel: () => void;
}

export default function FontChooserDialog({
  open,
  font,
  onConfirm,
  onCancel,
}: FontChooserDialogProps): React.ReactElement | null {
  const [name, setName] = useState(font.name);
  const [size, setSize] = useState(font.size);
  const [style, setStyle] = useState(font.style);
  const [fontFamilies, setFontFamilies] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setName(font.name);
      setSize(font.size);
      setStyle(font.style);
      setFilter('');
      setDropdownOpen(false);
      getSystemFontFamilies().then(setFontFamilies);
    }
  }, [open, font.name, font.size, font.style]);

  const handleConfirm = useCallback(() => {
    onConfirm({ name: name.trim() || 'Roboto', size: Math.max(1, Math.round(size)), style });
  }, [name, size, style, onConfirm]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onCancel();
    }
    if (e.key === 'Enter') {
      e.stopPropagation();
      handleConfirm();
    }
  }, [onCancel, handleConfirm]);

  if (!open) return null;

  const fontWeight = style === 1 || style === 3 ? 'bold' : 'normal';
  const fontStyleStr = style === 2 || style === 3 ? 'italic' : 'normal';
  const displayStyle = STYLE_OPTIONS.find(s => s.value === style)?.label ?? 'Plain';

  const filtered = filter
    ? fontFamilies.filter(f => f.toLowerCase().includes(filter.toLowerCase()))
    : fontFamilies;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onKeyDown={handleKeyDown}
      onClick={(e) => { if (e.target === overlayRef.current) onCancel(); }}
    >
      <div
        className="flex w-[420px] flex-col gap-4 rounded-lg border border-blue-border bg-[#1a2235] p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-sm font-medium text-gray-100">Choose Font</div>

        <div className="grid grid-cols-[1fr_80px_100px] gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider text-blue-muted">Font</label>
            <div className="relative">
              <button
                className="flex w-full items-center justify-between rounded border border-blue-border bg-[#111a2d] px-2 py-1.5 text-left text-xs text-gray-100 outline-none hover:border-blue-accent focus:border-blue-accent"
                onClick={() => { setDropdownOpen(!dropdownOpen); setFilter(''); }}
              >
                <span className="truncate" style={{ fontFamily: `'${name}', sans-serif` }}>{name}</span>
                <span className="ml-1 text-blue-muted">▼</span>
              </button>
              {dropdownOpen && (
                <div className="absolute left-0 top-full z-10 mt-1 flex max-h-48 w-full flex-col rounded border border-blue-border bg-[#111a2d] shadow-lg">
                  <input
                    className="border-b border-blue-border bg-transparent px-2 py-1 text-xs text-gray-100 outline-none placeholder:text-blue-muted"
                    placeholder="Filter fonts..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (filtered.length > 0) {
                          setName(filtered[0]);
                          setDropdownOpen(false);
                        }
                      }
                      if (e.key === 'Escape') {
                        e.stopPropagation();
                        setDropdownOpen(false);
                      }
                    }}
                    autoFocus
                  />
                  <div ref={listRef} className="max-h-36 overflow-y-auto overscroll-contain">
                    {filtered.map(f => (
                      <button
                        key={f}
                        className={
                          'w-full px-2 py-1 text-left text-xs outline-none ' +
                          (f === name
                            ? 'bg-blue-accent/30 text-white'
                            : 'text-gray-100 hover:bg-blue-accent/20')
                        }
                        style={{ fontFamily: `'${f}', sans-serif` }}
                        onClick={() => { setName(f); setDropdownOpen(false); }}
                      >
                        {f}
                      </button>
                    ))}
                    {filtered.length === 0 && (
                      <div className="px-2 py-2 text-xs text-blue-muted">No matching fonts</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider text-blue-muted">Size</label>
            <input
              className="w-full rounded border border-blue-border bg-[#111a2d] px-2 py-1.5 text-xs text-gray-100 outline-none focus:border-blue-accent"
              type="number"
              min={1}
              max={200}
              value={size}
              onChange={(e) => setSize(e.target.value === '' ? 12 : parseFloat(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); handleConfirm(); }
                if (e.key === 'Escape') { e.stopPropagation(); onCancel(); }
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider text-blue-muted">Style</label>
            <select
              className="w-full rounded border border-blue-border bg-[#111a2d] px-2 py-1.5 text-xs text-gray-100 outline-none focus:border-blue-accent"
              value={style}
              onChange={(e) => setStyle(parseInt(e.target.value, 10))}
            >
              {STYLE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase tracking-wider text-blue-muted">Preview</label>
          <div
            className="flex h-16 items-center justify-center rounded border border-blue-border bg-[#111a2d]"
            style={{ fontFamily: `'${name}', sans-serif`, fontSize: `${size}px`, fontWeight, fontStyle: fontStyleStr }}
          >
            <span className="text-gray-100">Aa Bb Cc 123</span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-blue-border pt-3">
          <span className="text-[10px] text-blue-muted">
            {name} {size} {displayStyle}
          </span>
          <div className="flex gap-2">
            <button
              className="rounded border border-blue-border px-3 py-1 text-xs text-gray-300 hover:bg-white/5"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              className="rounded bg-blue-accent px-3 py-1 text-xs text-white hover:opacity-90"
              onClick={handleConfirm}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
