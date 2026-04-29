# Quickstart: Blue Data Note Parsing and Note Processor Parity

## Preconditions

1. Work from `/Users/stevenyi/work/blue-electron`.
2. Keep Java Blue note parser and note processor sources available under `/Users/stevenyi/work/nbprojects/blue`.
3. Prepare parser and processor fixtures that can be compared between Java and TypeScript.

## Validation Commands

```bash
pnpm --filter @blue/data test
git diff --check
```

## Manual Compatibility Checks

1. Run representative parser fixtures through Java and TypeScript and compare note output.
2. Load a project containing named and inline note processor chains, save it from TypeScript, and reopen it in Java Blue.
3. Compare Java and TypeScript output for the known incompatible processors called out in the compatibility report.
4. Supply invalid processor configurations for processors that Java rejects and verify TypeScript fails loudly instead of silently skipping them.
