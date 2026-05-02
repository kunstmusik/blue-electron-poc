# Contract: Mixer Follow-Up Surfaces

## Purpose

Define the follow-up boundaries for routing validation, advanced chain editing, no-save library workflow polish, and playback-aware window behavior.

## 1. Routing Validation Contract

Routing validation may be implemented as a pure helper in `@blue/data` or shared app code, but it must accept only serializable mixer inputs and return serializable issues.

```ts
function validateMixerRouting(mixer: MixerSnapshot): MixerRoutingValidationResult;
```

Consumers:

- channel output dropdowns
- send target editors
- paste and move operations

Rules:

- hard-invalid destinations are rejected before patch submission when possible
- warnings can still allow the user to proceed if the design intentionally permits it

## 2. Advanced Chain Editing Contract

Spec 034's mixer patch surface is extended with follow-up chain operations.

```ts
interface ProjectDocumentPatch {
  mixer?: MixerPatch | MixerFollowUpPatch;
}
```

Clipboard and drag payloads remain renderer-owned until converted into an explicit patch.

## 3. Effects Library Workflow Contract

The existing effects-library session gains explicit workspace commands.

```ts
window.blueAPI.reloadEffectsLibrary(): Promise<EffectsLibraryWorkspaceSnapshot>
window.blueAPI.updateEffectsLibrary(patch: EffectsLibraryPatch): Promise<EffectsLibraryWorkspaceSnapshot>
window.blueAPI.importEffectFile(): Promise<EffectsLibraryWorkspaceSnapshot>
window.blueAPI.exportEffectFile(libraryEffectId: string): Promise<void>
```

Rules:

- `importEffectFile()` and `exportEffectFile(...)` are explicit file operations only.
- No command writes session mutations back to `~/.blue`.
- Reload discards session-local changes after an explicit user confirmation path.

## 4. Playback-Aware UI Contract

Playback-aware mixer UI consumes existing store state rather than a new project-document field.

Possible sources:

- `usePlaybackStore`
- project-store Blue Live status
- existing main-process playback status events already exposed through preload

Rules:

- Playback-aware polish must remain presentational unless a follow-up patch is explicitly required.
- If true meter data is unavailable, the UI may fall back to status badges or disabled-state messaging rather than fabricating meters.

## 5. Window And Shortcut Contract

The effect-editor window manager from Spec 034 remains authoritative.

Follow-up responsibilities:

- focus existing windows from menu or keyboard commands
- expose clearer missing-owner handling
- preserve one-window-per-owner semantics across repeated focus/open actions