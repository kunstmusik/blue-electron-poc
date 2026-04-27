# IO Provider API Contract

**Date**: 2026-04-27
**Feature**: 025-output-window

## Overview

The IOProvider API mirrors the NetBeans Output Window API used by Java Blue. It provides named output tabs with write, clear, and select operations. This contract defines the TypeScript interface that main-process rendering code and renderer code will use.

## Types

### IOProvider

```typescript
interface IOProvider {
  getIO(name: string, newIO?: boolean): InputOutput;
}
```

- `getIO(name, false)`: Return existing tab by name, or create if not exists
- `getIO(name, true)`: Always create a fresh tab (clear if exists)

### InputOutput

```typescript
interface InputOutput {
  readonly name: string;
  readonly out: OutputWriter;
  readonly err: OutputWriter;
  select(): void;
  close(): void;
  setColor(type: OutputType, color: string): void;
}
```

### OutputWriter

```typescript
interface OutputWriter {
  write(text: string): void;
  println(text: string): void;
  reset(): void;
}
```

### OutputType

```typescript
type OutputType = 'output' | 'error';
```

## IPC Contract

### Channel: `engine-output`

**Direction**: Main → Renderer
**Payload**:

```typescript
interface EngineOutputPayload {
  tabName: string;
  text: string;
  type: 'stdout' | 'stderr';
}
```

**Batching**: The main process batches output into chunks. Multiple lines may be included in a single `text` value (separated by `\n`). The renderer splits on `\n` to create individual lines.

### Channel: `engine-output-select`

**Direction**: Main → Renderer
**Payload**:

```typescript
{ tabName: string }
```

Brings the named tab to the foreground.

## Usage Pattern (mirrors Java Blue)

```typescript
// Main process — before rendering starts
const io = ioProvider.getIO('Csound', false);
io.out.reset();
io.setColor('output', '#ffffff');
io.out.println(`Render Command (${args.join(' ')})`);
io.select();

// Main process — during rendering (in stdout callback)
io.out.write(messageText);

// Main process — on stop
io.out.println('Render stopped.');
```
