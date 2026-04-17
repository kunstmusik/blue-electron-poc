# Feature Specification: blue_shm_export Bridge

**Feature Branch**: `010-shm-export`
**Created**: 2026-04-16
**Status**: Closed — superseded by native Csound channel bridge + return to `chnexport` (2026-04-17)

## Closure Note

This spec is closed without implementing the design as written.

Final resolution:

- `blue-electron` stays on standard `chnexport` for numeric automation channels.
- `blue-engine` writes native Csound control channels directly.
- shared memory remains only as a fast scalar read mirror.
- the `blue_shm_*` opcode path was removed from `blue-engine`.

Use [STATUS.md](/Users/stevenyi/work/blue-electron/STATUS.md) as the authoritative current summary. The rest of this document is retained only as historical context for the abandoned `blue_shm_export` direction.

## Problem

Automation values written by blue-engine's `AutomationManager` to shared memory never reach the Csound instruments because the generated CSD reads from Csound's built-in channel system (`chnexport`) instead of shared memory.

## Overview

Two changes needed:
1. **blue-engine (C++)**: Add a `blue_shm_export` opcode that mirrors `chnexport` but is backed by shared memory
2. **blue-electron (TS)**: Update CSD generation to use `blue_shm_export` for automation parameter channels

## Part A: blue-engine Changes

### New Opcode: `blue_shm_export`

**Signature** (matches `chnexport`):
```
xvar blue_shm_export Sname, imode
```

- `xvar`: output variable (k-rate or i-rate, matches Csound's `chnexport` behavior)
- `Sname`: channel name string
- `imode`: 1=write, 2=read, 3=read+write (same as `chnexport`)

**Files to modify:**
- `src/opcodes/BlueShmOpcodes.h` — add struct declarations
- `src/opcodes/BlueShmOpcodes.cpp` — implement init and perf functions, register opcodes

**Data structures:**

```cpp
struct BlueShmExportI {
    OpcodeHeader h;
    double *out;             // Output variable (MYFLT*)
    STRINGDAT *name;         // Channel name
    int32_t *imode;          // Mode: 1=write, 2=read, 3=read+write
    void *channelEntry;      // Cached pointer to ChannelEntry
};

struct BlueShmExportK {
    OpcodeHeader h;
    double *out;             // Output variable (MYFLT*)
    STRINGDAT *name;         // Channel name
    int32_t *imode;          // Mode
    void *channelEntry;      // Cached pointer to ChannelEntry
};
```

**i-rate init (`blue_shm_export_i_init`):**
1. Get `SharedMemory` from host data
2. Get or create channel entry for `Sname`
3. Cache the `ChannelEntry*`
4. If mode includes read (2 or 3): read `entry->value.load()` into `*out`
5. If mode includes write (1 or 3): store `*out` into `entry->value`

**k-rate perf (`blue_shm_export_k_perf`):**
1. If mode includes read (2 or 3): `*out = entry->value.load()`
2. If mode includes write (1 or 3): `entry->value.store(*out)`

For the automation use case, mode=3 (read+write) is standard. The automation manager writes to shared memory, and every k-cycle the opcode reads the updated value into the Csound global variable.

**Registration:**
```cpp
// i-rate: blue_shm_export Sname, imode  →  output: i
csoundAppendOpcode(csound, "blue_shm_export", sizeof(BlueShmExportI),
    0, "i", "Si",
    blue_shm_export_i_init, nullptr, nullptr);

// k-rate: blue_shm_export Sname, imode  →  output: k
csoundAppendOpcode(csound, "blue_shm_export", sizeof(BlueShmExportK),
    0, "k", "Si",
    blue_shm_export_k_init, blue_shm_export_k_perf, nullptr);
```

### Success Criteria (blue-engine)
- `blue_shm_export` is registered and callable from Csound orchestra code
- At i-rate, reads initial value from shared memory into the output variable
- At k-rate, continuously reads from shared memory every k-cycle
- Existing `blue_shm_get`/`blue_shm_set` opcodes continue to work

## Part B: blue-electron Changes

### CSD Generation Updates

**File**: `packages/blue-data/src/blue-data.ts` — `buildParameterInits()` method

**Current code** (generates for each parameter):
```
gk_blue_autoN init <value>
gk_blue_autoN chnexport "gk_blue_autoN", 3
```

**New code**:
```
gk_blue_autoN init <value>
gk_blue_autoN blue_shm_export "gk_blue_autoN", 3
```

This is a single-line change in the CSD generation: replace `chnexport` with `blue_shm_export` for all `gk_blue_autoN` parameter channels.

**What stays unchanged:**
- `gS_blue_strN` channels keep `chnexport` (string channels, not automation, not shm-backed)
- BSB internal `chnget`/`chnset` calls keep using Csound's built-in channels (i-rate only, for function table handles)
- All instrument bodies that reference `gk_blue_autoN` as globals — no changes needed

### Task List

**blue-engine:**
- [ ] Add `BlueShmExportI` and `BlueShmExportK` structs to `BlueShmOpcodes.cpp`
- [ ] Implement `blue_shm_export_i_init`
- [ ] Implement `blue_shm_export_k_init` and `blue_shm_export_k_perf`
- [ ] Register both opcode variants in `registerBlueShmOpcodes()`
- [ ] Test with a minimal CSD that uses `blue_shm_export` and verifies value propagation

**blue-electron:**
- [ ] Update `buildParameterInits()` to emit `blue_shm_export` instead of `chnexport` for `gk_blue_autoN` channels
- [ ] Keep `chnexport` for `gS_blue_strN` string channels
- [ ] Verify demo2022.blue CSD generation produces correct output
- [ ] Run `pnpm test` — no regressions

## Part C: Test/Example Code Updates (All Language Bindings)

All 6 language binding test clients in blue-engine need a new **Test 6** that exercises `blue_shm_export` instead of the direct `blue_shm_get:k("freq")` pattern used in Tests 1–5.

### Test 6 Orchestra

All bindings share the same CSD orchestra using the `chnexport`-style pattern:

```csound
<CsoundSynthesizer>
<CsOptions>
-n -d
</CsOptions>
<CsInstruments>
sr = 44100
ksmps = 64
nchnls = 2
0dbfs = 1

gk_freq init 440
gk_freq blue_shm_export "freq", 3

instr 1
    aenv = linseg:a(0, 0.01, 1, p3 - 0.02, 1, 0.01, 0)
    asig = oscil:a(aenv * gk_freq, gk_freq)
    out(asig, asig)
endin
</CsInstruments>
<CsScore>
i1 0 2
</CsScore>
</CsoundSynthesizer>
```

This replaces the direct `blue_shm_get:k("freq")` call inside `instr 1` with a global variable `gk_freq` that is synced from shared memory every k-cycle via `blue_shm_export`.

### Test 6 Procedure

1. Write the CSD with `blue_shm_export` orchestra to a temp file
2. Start the engine with that CSD
3. Send a note via score (`i1 0 2` already in the CSD, or send live)
4. Use `setChannel("freq", 880.0)` to change the frequency mid-playback
5. Verify the audio output reflects the frequency change (k-rate sync works)
6. Stop the engine

### Files to Update

| Binding | File | Notes |
|---------|------|-------|
| Python | `examples/python/test_client.py` | Add `test_shm_export()` method; uses `blue_engine_client.py` wrapper |
| JavaScript | `examples/javascript/test_client.js` | Add `testShmExport()` method to `TestClient` class |
| C | `examples/c/test_client.c` | Add `test_shm_export()` function, call from `main()` |
| C++ | `examples/cpp/test_client.cpp` | Add `testShmExport()` method to `TestClient` class |
| Java | `examples/java/src/main/java/com/blue/engine/TestClient.java` | Add `testShmExport()` method |
| Rust | `examples/rust/src/main.rs` | Add `test_shm_export()` function to `TestClient` impl |

### Per-Binding Details

#### Python (`examples/python/test_client.py`)

```python
def test_shm_export(self):
    """Test 6: blue_shm_export opcode — chnexport-style shm bridge"""
    csd = '''<CsoundSynthesizer>
<CsOptions>-n -d</CsOptions>
<CsInstruments>
sr=44100
ksmps=64
nchnls=2
0dbfs=1

gk_freq init 440
gk_freq blue_shm_export "freq", 3

instr 1
    aenv = linseg:a(0, 0.01, 1, p3 - 0.02, 1, 0.01, 0)
    asig = oscil:a(aenv * gk_freq, gk_freq)
    out(asig, asig)
endin
</CsInstruments>
<CsScore>
i1 0 4
</CsScore>
</CsoundSynthesizer>'''

    with tempfile.NamedTemporaryFile(suffix='.csd', mode='w', delete=False) as f:
        f.write(csd)
        csd_path = f.name

    try:
        self.client.load_csd(csd_path)
        self.client.start()
        time.sleep(0.5)

        # Set freq to 880Hz via shared memory
        self.client.set_channel("freq", 880.0)
        time.sleep(1.0)

        # Verify we can read the value back
        value = self.client.get_channel("freq")
        assert abs(value - 880.0) < 0.01, f"Expected 880.0, got {value}"
        print("  ✓ blue_shm_export: k-rate sync works")

    finally:
        self.client.stop()
        os.unlink(csd_path)
```

#### JavaScript (`examples/javascript/test_client.js`)

```javascript
async testShmExport() {
    const csd = `<CsoundSynthesizer>
<CsOptions>-n -d</CsOptions>
<CsInstruments>
sr=44100
ksmps=64
nchnls=2
0dbfs=1

gk_freq init 440
gk_freq blue_shm_export "freq", 3

instr 1
    aenv = linseg:a(0, 0.01, 1, p3 - 0.02, 1, 0.01, 0)
    asig = oscil:a(aenv * gk_freq, gk_freq)
    out(asig, asig)
endin
</CsInstruments>
<CsScore>
i1 0 4
</CsScore>
</CsoundSynthesizer>`;

    const tmpPath = path.join(os.tmpdir(), 'test_shm_export.csd');
    fs.writeFileSync(tmpPath, csd);

    try {
        await this.client.loadCsd(tmpPath);
        await this.client.start();
        await sleep(500);

        await this.client.setChannel("freq", 880.0);
        await sleep(1000);

        const value = await this.client.getChannel("freq");
        assert(Math.abs(value - 880.0) < 0.01, `Expected 880.0, got ${value}`);
        console.log("  ✓ blue_shm_export: k-rate sync works");
    } finally {
        await this.client.stop();
        fs.unlinkSync(tmpPath);
    }
}
```

#### C (`examples/c/test_client.c`)

```c
void test_shm_export(EngineClient *client) {
    const char *csd =
        "<CsoundSynthesizer>\n"
        "<CsOptions>-n -d</CsOptions>\n"
        "<CsInstruments>\n"
        "sr=44100\nksmps=64\nnchnls=2\n0dbfs=1\n\n"
        "gk_freq init 440\n"
        "gk_freq blue_shm_export \"freq\", 3\n\n"
        "instr 1\n"
        "    aenv = linseg:a(0, 0.01, 1, p3-0.02, 1, 0.01, 0)\n"
        "    asig = oscil:a(aenv * gk_freq, gk_freq)\n"
        "    out(asig, asig)\n"
        "endin\n"
        "</CsInstruments>\n"
        "<CsScore>\ni1 0 4\n</CsScore>\n"
        "</CsoundSynthesizer>\n";

    char tmp_path[256];
    snprintf(tmp_path, sizeof(tmp_path), "/tmp/test_shm_export_%d.csd", getpid());
    write_temp_file(tmp_path, csd);

    client_load_csd(client, tmp_path);
    client_start(client);
    sleep_ms(500);

    client_set_channel(client, "freq", 880.0);
    sleep_ms(1000);

    double value = client_get_channel(client, "freq");
    assert(fabs(value - 880.0) < 0.01);
    printf("  ✓ blue_shm_export: k-rate sync works\n");

    client_stop(client);
    unlink(tmp_path);
}
```

#### C++ (`examples/cpp/test_client.cpp`)

```cpp
void testShmExport() {
    const std::string csd = R"(
<CsoundSynthesizer>
<CsOptions>-n -d</CsOptions>
<CsInstruments>
sr=44100
ksmps=64
nchnls=2
0dbfs=1

gk_freq init 440
gk_freq blue_shm_export "freq", 3

instr 1
    aenv = linseg:a(0, 0.01, 1, p3-0.02, 1, 0.01, 0)
    asig = oscil:a(aenv * gk_freq, gk_freq)
    out(asig, asig)
endin
</CsInstruments>
<CsScore>
i1 0 4
</CsScore>
</CsoundSynthesizer>
)";

    auto tmpPath = std::filesystem::temp_directory_path() / "test_shm_export.csd";
    std::ofstream(tmpPath) << csd;

    client_.loadCsd(tmpPath.string());
    client_.start();
    std::this_thread::sleep_for(std::chrono::milliseconds(500));

    client_.setChannel("freq", 880.0);
    std::this_thread::sleep_for(std::chrono::seconds(1));

    double value = client_.getChannel("freq");
    assert(std::abs(value - 880.0) < 0.01);
    std::cout << "  ✓ blue_shm_export: k-rate sync works\n";

    client_.stop();
    std::filesystem::remove(tmpPath);
}
```

#### Java (`examples/java/src/main/java/com/blue/engine/TestClient.java`)

```java
void testShmExport() throws Exception {
    String csd = """
        <CsoundSynthesizer>
        <CsOptions>-n -d</CsOptions>
        <CsInstruments>
        sr=44100
        ksmps=64
        nchnls=2
        0dbfs=1

        gk_freq init 440
        gk_freq blue_shm_export "freq", 3

        instr 1
            aenv = linseg:a(0, 0.01, 1, p3-0.02, 1, 0.01, 0)
            asig = oscil:a(aenv * gk_freq, gk_freq)
            out(asig, asig)
        endin
        </CsInstruments>
        <CsScore>
        i1 0 4
        </CsScore>
        </CsoundSynthesizer>
        """;

    Path tmpPath = Files.createTempFile("test_shm_export", ".csd");
    Files.writeString(tmpPath, csd);

    try {
        client.loadCsd(tmpPath.toString());
        client.start();
        Thread.sleep(500);

        client.setChannel("freq", 880.0);
        Thread.sleep(1000);

        double value = client.getChannel("freq");
        assert Math.abs(value - 880.0) < 0.01 : "Expected 880.0, got " + value;
        System.out.println("  ✓ blue_shm_export: k-rate sync works");
    } finally {
        client.stop();
        Files.deleteIfExists(tmpPath);
    }
}
```

#### Rust (`examples/rust/src/main.rs`)

```rust
async fn test_shm_export(&self) -> Result<(), Box<dyn std::error::Error>> {
    let csd = r#"
<CsoundSynthesizer>
<CsOptions>-n -d</CsOptions>
<CsInstruments>
sr=44100
ksmps=64
nchnls=2
0dbfs=1

gk_freq init 440
gk_freq blue_shm_export "freq", 3

instr 1
    aenv = linseg:a(0, 0.01, 1, p3-0.02, 1, 0.01, 0)
    asig = oscil:a(aenv * gk_freq, gk_freq)
    out(asig, asig)
endin
</CsInstruments>
<CsScore>
i1 0 4
</CsScore>
</CsoundSynthesizer>
"#;

    let tmp_path = std::env::temp_dir().join("test_shm_export.csd");
    std::fs::write(&tmp_path, csd)?;

    self.client.load_csd(tmp_path.to_str().unwrap()).await?;
    self.client.start().await?;
    tokio::time::sleep(std::time::Duration::from_millis(500)).await;

    self.client.set_channel("freq", 880.0).await?;
    tokio::time::sleep(std::time::Duration::from_secs(1)).await;

    let value = self.client.get_channel("freq").await?;
    assert!((value - 880.0).abs() < 0.01, "Expected 880.0, got {}", value);
    println!("  ✓ blue_shm_export: k-rate sync works");

    self.client.stop().await?;
    std::fs::remove_file(&tmp_path)?;
    Ok(())
}
```

### Success Criteria (Test Updates)

- All 6 test clients compile and run
- Test 6 in each binding verifies `blue_shm_export` k-rate sync
- Existing Tests 1–5 continue to pass unchanged
- The `blue_shm_export` opcode is exercised with mode=3 (read+write)

## Verification

1. Generate CSD from demo2022.blue — confirm `gk_blue_autoN` uses `blue_shm_export`
2. Play via blue-engine — confirm automation values change during playback
3. All 6 language binding Test 6 runs pass
4. `pnpm test` — all existing tests pass
