# Contract: Csound Editor Parity Surface

This contract defines the reusable editor behavior expected after spec 019.

## Editor Inputs

The reusable editor surface accepts:

- `value`: current editor text
- `readOnly`: whether editing actions are allowed
- `onChange(nextValue)`: existing project-store update path
- `dynamicCompletionProviders`: existing spec 018 completion extension point
- `menuSources`: Java Blue-derived context-menu categories and insertion items
- `projectContext`: optional active project snapshot for UDO or project-aware completions

## Required Commands

- `cut`: removes selected text and updates clipboard when possible
- `copy`: copies selected text without changing editor content
- `paste`: inserts clipboard text at cursor or replaces selection
- `insertText(value)`: inserts or replaces editor text while preserving focus
- `showContextMenu`: opens the Java Blue-style context menu for the focused editor

## Required Context Menu Shape

Top-level order should follow the Java screenshot/source intent:

1. `Blue Variables`
2. `Opcodes`
3. `Blue Opcodes`
4. separator
5. `Custom`
6. `Add to Code Repository`
7. separator
8. `Cut`
9. `Copy`
10. `Paste`

Minimum required Blue Variables:

- `<TOTAL_DUR>`
- `<RENDER_START>`
- `<PROCESSING_START>`
- `<INSTR_ID>`
- `<INSTR_NAME>`

Minimum required Blue Opcodes:

- `blueMixerOut` inserts `blueMixerOut asig1 [, asig2...]`
- `blueMixerOut (SubChannel)` inserts `blueMixerOut "subchannelName", asig1 ,asig2 [, asig3...]`
- `blueMixerIn` inserts `asig1 [, asig2...] blueMixerIn`

## Completion Contract

Completion sources must:

- preserve the baseline CodeMirror Csound package completions
- add Java Blue-derived completions without duplicate labels where practical
- support document-local Csound variable completion
- handle missing project context
- provide detail/help text when available without requiring full manual HTML support

## Clipboard Contract

Clipboard actions must:

- work from keyboard shortcuts when focus is inside CodeMirror
- work from the editor context menu
- not trigger playback
- not change content when action preconditions are not met
- degrade gracefully if browser clipboard APIs are unavailable

## Testing Contract

Automated tests should verify:

- text-editing targets still suppress playback shortcuts
- context-menu data includes required Java Blue categories and items
- insertion replaces selections and inserts at cursor
- completion provider returns Java-derived variable/Blue opcode entries
- Global Orchestra save/reopen behavior remains unchanged
