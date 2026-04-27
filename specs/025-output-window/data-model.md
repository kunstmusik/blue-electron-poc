# Data Model: Output Window

**Date**: 2026-04-27
**Feature**: 025-output-window

## Entities

### OutputLine

A single line of text in an output tab.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `number` | Auto-incrementing line ID |
| `text` | `string` | Line content |
| `type` | `'stdout' \| 'stderr'` | Output source |

### OutputTab

A named output stream within the output window.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Same as name for simplicity |
| `name` | `string` | Display name (e.g., "Csound", "Csound (Disk)") |
| `lines` | `OutputLine[]` | Ordered list of output lines |
| `lineCounter` | `number` | Auto-incrementing counter for line IDs |
| `colorOverrides` | `Partial<Record<OutputType, string>>` | Color settings per output type |
| `isClosed` | `boolean` | Whether the tab has been closed |

### OutputType

Color/slot type for output styling.

| Value | Description |
|-------|-------------|
| `'output'` | Default stdout text |
| `'error'` | Stderr text |

### OutputWindowState (Zustand store)

| Field | Type | Description |
|-------|------|-------------|
| `tabs` | `Record<string, OutputTab>` | Map of tab name → tab state |
| `tabOrder` | `string[]` | Ordered tab names for display |
| `activeTabId` | `string \| null` | Currently selected tab |

### Store Actions

| Action | Signature | Description |
|--------|-----------|-------------|
| `getOrCreateTab` | `(name: string, newIO?: boolean) => OutputTab` | Get existing tab or create new one. `newIO=true` forces fresh tab. |
| `closeTab` | `(name: string) => void` | Close and remove a tab |
| `appendToTab` | `(name: string, text: string, type?: 'stdout' \| 'stderr') => void` | Append text as line(s) to tab |
| `resetTab` | `(name: string) => void` | Clear all lines in tab |
| `selectTab` | `(name: string) => void` | Set tab as active |
| `setTabColor` | `(name: string, outputType: OutputType, color: string) => void` | Set color for output type |

### IPC Payload

| Field | Type | Description |
|-------|------|-------------|
| `tabName` | `string` | Target tab name |
| `text` | `string` | Output text (may contain multiple lines) |
| `type` | `'stdout' \| 'stderr'` | Output source |

## State Transitions

```
[No tab] --getOrCreateTab("Csound")--> [Tab exists, empty]
[Tab exists] --appendToTab("Csound", text)--> [Tab with N+1 lines]
[Tab exists] --resetTab("Csound")--> [Tab cleared, 0 lines]
[Tab exists] --closeTab("Csound")--> [Tab removed]
```

## Batching Behavior

`appendToTab` splits input text on `\n` to create individual lines. The main process batches stdout/stderr data into chunks before sending via IPC (every ~50ms or on flush).
