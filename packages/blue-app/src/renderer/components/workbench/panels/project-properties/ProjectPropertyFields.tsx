import React from 'react';
import type { ReactNode } from 'react';

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}): React.ReactElement {
  return (
    <section className="rounded-lg border border-blue-border bg-blue-surface/70 p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-100">{title}</h3>
        {description ? <p className="mt-1 text-xs text-blue-muted">{description}</p> : null}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function FieldRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}): React.ReactElement {
  return (
    <label className="grid grid-cols-[180px_minmax(0,1fr)] items-center gap-4">
      <span className="text-sm text-blue-muted">{label}</span>
      {children}
    </label>
  );
}

function InputBase({
  value,
  disabled,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void | Promise<void>;
  placeholder?: string;
  type?: string;
}): React.ReactElement {
  return (
    <input
      type={type}
      className="w-full rounded-md border border-blue-border bg-[#0d1524] px-3 py-2 text-sm text-gray-100 outline-none transition-colors placeholder:text-blue-muted focus:border-blue-accent disabled:cursor-not-allowed disabled:opacity-60"
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function TextAreaBase({
  value,
  disabled,
  onChange,
  placeholder,
}: {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void | Promise<void>;
  placeholder?: string;
}): React.ReactElement {
  return (
    <textarea
      className="min-h-24 w-full rounded-md border border-blue-border bg-[#0d1524] px-3 py-2 text-sm text-gray-100 outline-none transition-colors placeholder:text-blue-muted focus:border-blue-accent disabled:cursor-not-allowed disabled:opacity-60"
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function CheckboxBase({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled: boolean;
  onChange: (value: boolean) => void | Promise<void>;
}): React.ReactElement {
  return (
    <input
      type="checkbox"
      className="h-4 w-4 rounded border-blue-border bg-[#0d1524] text-blue-accent focus:ring-blue-accent disabled:cursor-not-allowed disabled:opacity-60"
      checked={checked}
      disabled={disabled}
      onChange={(event) => onChange(event.target.checked)}
    />
  );
}

export {
  SectionCard,
  FieldRow,
  InputBase,
  TextAreaBase,
  CheckboxBase,
};
