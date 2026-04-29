# Contract: Note Parsing and Note Processor Compatibility

## Scope

This contract defines the parser and note processor behavior that later render features may rely on.

## Parser Rules

- Shared score parsing must produce Java-compatible note events for carry, shorthand, comments, continuation lines, ramps, bracketed expressions, and ties.
- `GenericScore` must use the same effective parsing semantics as the shared parser.
- Note timing helpers must preserve Java end-time and objective-duration behavior.

## Processor Rules

- Note processor XML must load Java full class names and save Java-compatible type identities.
- Named note processor chains must survive load/save/copy behavior.
- High-risk processors identified in the compatibility report must match Java note results.
- Invalid processor input that Java rejects must not be silently ignored by TypeScript.

## Test Matrix

- parser fixture coverage for shorthand, ramps, comments, ties, and continuation lines
- XML round-trip for inline and named processor chains
- behavior fixtures for high-risk pitch/time/random/subset processors
