# Blue Engine Protocol Reference

This document describes the binary protocol used by the C++ blue-engine executable, for implementing the TypeScript client.

## Connection

- **Transport:** ZeroMQ REQ/REP
- **Default Port:** Configurable (passed as command-line arg to engine)
- **Pattern:** Synchronous request-response (host sends command, engine responds)

## Message Format

Each message is a binary blob with this structure:

```
[command: uint8][payload: variable]
```

### Request/Response Header

For commands with payloads:
```
[command: uint8][payload_length: uint32 little-endian][payload: bytes]
```

## Commands

### Engine Lifecycle

| Code | Command | Request Payload | Response Payload |
|------|---------|-----------------|------------------|
| `0x01` | `CREATE_ENGINE` | None | None |
| `0x05` | `START` | None | None |
| `0x06` | `STOP` | None | None |
| `0x07` | `EXIT` | None | None (engine exits) |

### Csound Control

| Code | Command | Request Payload | Response Payload |
|------|---------|-----------------|------------------|
| `0x02` | `COMPILE_ORC` | UTF-8 orchestra string | None |
| `0x03` | `READ_SCORE` | UTF-8 score string | None |
| `0x04` | `SET_OPTION` | UTF-8 option (e.g. `-odac`) | None |

### Channels (Shared Memory)

| Code | Command | Request Payload | Response Payload |
|------|---------|-----------------|------------------|
| `0x10` | `SET_CHANNEL` | `[name_length: uint8][name: bytes][value: float64 le]` | None |
| `0x11` | `GET_CHANNEL` | `[name_length: uint8][name: bytes]` | `[value: float64 le]` |
| `0x12` | `CREATE_CHANNEL` | `[name_length: uint8][name: bytes][initial_value: float64 le]` | None |
| `0x13` | `GET_SHM_NAME` | None | `[name_length: uint8][name: bytes]` |

### Automation

| Code | Command | Request Payload | Response Payload |
|------|---------|-----------------|------------------|
| `0x20` | `CREATE_AUTOMATION` | Serialized `AutomationDef` | None |
| `0x21` | `UPDATE_AUTOMATION` | `[param_id: ...]` + points | None |
| `0x22` | `DELETE_AUTOMATION` | `[param_id: ...]` | None |
| `0x23` | `ENABLE_AUTOMATION` | `[param_id: ...]` | None |
| `0x24` | `DISABLE_AUTOMATION` | `[param_id: ...]` | None |
| `0x25` | `LIST_AUTOMATION` | None | Serialized list |
| `0x26` | `CLEAR_AUTOMATION` | None | None |

## Automation Data Structures

### AutomationPoint
```c
struct AutomationPoint {
    double time;    // in seconds
    double value;   // channel value at this time
};
```

### AutomationCurve (enum)
```c
enum AutomationCurve : uint8 {
    STEP = 0x00,           // Hold value until next point
    LINEAR = 0x01,         // Linear interpolation
    EXPONENTIAL = 0x02,    // Exponential interpolation
};
```

### AutomationDef
```c
struct AutomationDef {
    string channelName;       // target channel
    AutomationCurve curve;    // interpolation type
    vector<AutomationPoint> points;
    bool enabled;
    double resolution;        // quantization resolution
    double resolutionScale;   // scale factor
    bool highPrecision;       // use high-precision interpolation
};
```

## Shared Memory Layout

The engine creates a POSIX/Windows shared memory region:

### Header (64 bytes)
```c
struct ShmHeader {
    uint32_t magic;        // 0x454C5542 ("BULE" in little-endian)
    uint32_t version;      // 1
    uint32_t channelCount; // current number of channels
    uint32_t maxChannels;  // 256
    uint8_t  reserved[48]; // padding
};
```

### Channel Entry (80 bytes each)
```c
struct ChannelEntry {
    char     name[64];    // null-terminated channel name
    double   value;       // atomic double (8 bytes)
    uint32_t flags;       // channel flags
    uint32_t reserved;    // padding
};
```

**Total size:** `64 + 256 × 80 = 20,544` bytes

### Channel Access
- Host reads/writes `value` field directly
- Engine's perform thread reads values each k-cycle
- `blue_shm_get` opcode reads from shared memory in Csound
- `blue_shm_set` opcode writes to shared memory in Csound

## Engine Lifecycle (Typical Session)

```
1. Spawn blue-engine executable as child process
   $ blue-engine --port 5555

2. Connect ZMQ REQ socket to tcp://localhost:5555

3. CREATE_ENGINE
   → csoundCreate()
   → register blue_shm opcodes
   → create AutomationManager

4. SET_OPTION (repeated)
   → csoundSetOption("-odac")
   → csoundSetOption("-d")

5. COMPILE_ORC
   → csoundCompileOrc(orchestra_string)

6. READ_SCORE
   → csoundReadScore(score_string)

7. START
   → csoundStart()
   → launch dedicated perform thread
   → thread loops: automation process → csoundPerformKsmps() → sample counter++

8. SET_CHANNEL / GET_CHANNEL (during playback)
   → read/write shared memory

9. CREATE_AUTOMATION / UPDATE_AUTOMATION (during playback)
   → update automation curves in AutomationStore

10. STOP
    → stop perform thread

11. EXIT (optional — or just kill process)
```

## TypeScript Client Implementation Notes

### ZMQ Library
- Use `zeromq` npm package (native bindings to libzmq)
- REQ socket: `socket.send()` returns promise, then `for await (const [data] of socket)` for response

### Shared Memory Access (macOS/Linux)
- POSIX shared memory: `/var/folders/.../blue_engine_shm_XXXX`
- Node.js options:
  1. `node-addon-api` to write a native addon
  2. Use `GET_CHANNEL`/`SET_CHANNEL` ZMQ commands instead (simpler, but slower)
  3. `mmap` via native addon

### Shared Memory Access (Windows)
- Named shared memory via `CreateFileMapping`/`MapViewOfFile`
- Requires native addon on Windows too

### Recommendation for Phase 1
Use the ZMQ `SET_CHANNEL`/`GET_CHANNEL` commands for channel access. They proxy through to shared memory internally. This avoids native addon complexity for Phase 1. Add direct shared memory access later for lower latency if needed.

### Error Handling
- All ZMQ responses should be checked for error status
- Engine may return error strings for failed commands
- Handle engine process crashes / unexpected exits

## Reference: Existing Example Clients

The blue-engine repo has example clients in:
- `examples/javascript/test_client.js` — Node.js (best reference for TS port)
- `examples/c/test_client.c` — C
- `examples/cpp/test_client.cpp` — C++
- `examples/python/test_client.py` — Python
- `examples/java/` — Java
- `examples/rust/` — Rust

The JavaScript client is the most relevant reference for the TypeScript implementation.
