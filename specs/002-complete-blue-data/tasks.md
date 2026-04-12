# Tasks: Complete Blue Data Model + Electron App + Engine Integration

**Input**: Design documents from `specs/002-complete-blue-data/`
**Prerequisites**: Phase 1-10 from `specs/001-blue-data-port/` (157/157 tasks complete)

---

## Phase 11: SoundObjects + NoteProcessors + BSB

### SoundObject Types (FR-201, FR-202)

- [ ] T201 [P] [US1] Implement `AudioFile` in `packages/blue-data/src/sound-objects/audio-file.ts`
- [ ] T202 [P] [US1] Implement `Sound` in `packages/blue-data/src/sound-objects/sound.ts`
- [ ] T203 [P] [US1] Implement `External` in `packages/blue-data/src/sound-objects/external.ts`
- [ ] T204 [P] [US1] Implement `LineObject` in `packages/blue-data/src/sound-objects/line-object.ts`
- [ ] T205 [P] [US1] Implement `ZakLineObject` in `packages/blue-data/src/sound-objects/zak-line-object.ts`
- [ ] T206 [P] [US1] Implement `PatternObject` in `packages/blue-data/src/sound-objects/pattern-object.ts`
- [ ] T207 [P] [US1] Implement `PianoRoll` in `packages/blue-data/src/sound-objects/piano-roll.ts`
- [ ] T208 [P] [US1] Implement `NotationObject` in `packages/blue-data/src/sound-objects/notation-object.ts`
- [ ] T209 [P] [US1] Implement `JMask` in `packages/blue-data/src/sound-objects/j-mask.ts`
- [ ] T210 [P] [US1] Implement `Instance` in `packages/blue-data/src/sound-objects/instance.ts`
- [ ] T211 [P] [US1] Implement `TrackerObject` in `packages/blue-data/src/sound-objects/tracker-object.ts`
- [ ] T212 [P] [US1] Implement `FrozenSoundObject` in `packages/blue-data/src/sound-objects/frozen-sound-object.ts`

### NoteProcessor Types (FR-203)

- [ ] T213 [P] [US1] Implement `RandomAddProcessor` in `packages/blue-data/src/note-processors/`
- [ ] T214 [P] [US1] Implement `RandomMultiplyProcessor`
- [ ] T215 [P] [US1] Implement `LineAddProcessor`
- [ ] T216 [P] [US1] Implement `LineMultiplyProcessor`
- [ ] T217 [P] [US1] Implement `PchAddProcessor`
- [ ] T218 [P] [US1] Implement `PchInversionProcessor`
- [ ] T219 [P] [US1] Implement `InversionProcessor`
- [ ] T220 [P] [US1] Implement `RetrogradeProcessor`
- [ ] T221 [P] [US1] Implement `RotateProcessor`
- [ ] T222 [P] [US1] Implement `TimeWarpProcessor`
- [ ] T223 [P] [US1] Implement `TuningProcessor`
- [ ] T224 [P] [US1] Implement `SwitchProcessor`
- [ ] T225 [P] [US1] Implement `SubListProcessor`
- [ ] T226 [P] [US1] Implement `EqualsProcessor`
- [ ] T227 [P] [US1] Implement `ValueTimeMapper`

### BlueSynthBuilder (FR-204, FR-205)

- [ ] T228 [P] [US1] Implement `BSBObject` in `packages/blue-data/src/instruments/bsb/`
- [ ] T229 [P] [US1] Implement `BSBComponent`
- [ ] T230 [P] [US1] Implement `BSBParameter`
- [ ] T231 [US1] Implement BSB CSD code generation (template + parameter substitution)
- [ ] T232 [US1] Register new SoundObjects in SoundObjectRegistry

### Phase 11 Tests (FR-206, SC-101, SC-102, SC-107)

- [ ] T233 [P] [US1] Round-trip tests for 12 new SoundObject types
- [ ] T234 [P] [US1] Round-trip tests for 15 new NoteProcessors
- [ ] T235 [US1] BSB CSD generation test
- [ ] T236 [US1] Load real `.blue` files from Java Blue library — no unknown type warnings

---

## Phase 12: Electron Application

### App Shell (FR-207, FR-208, FR-212)

- [ ] T237 [P] [US2] Implement Electron main process in `packages/blue-app/src/main/main.ts`
- [ ] T238 [P] [US2] Implement preload script in `packages/blue-app/src/preload/preload.ts`
- [ ] T239 [US2] Implement file open dialog (IPC: renderer → main → BlueData.loadFromString)
- [ ] T240 [US2] Implement file save / save-as (IPC: BlueData.saveToString → write file)
- [ ] T241 [US2] Implement recent files list

### Project Display (FR-208)

- [ ] T242 [US2] Implement renderer app.tsx with project metadata display
- [ ] T243 [US2] Implement score layer visualization
- [ ] T244 [US2] Implement instrument/mixer display

### Playback Controls (FR-209, FR-210, FR-211)

- [ ] T245 [US2] Implement Play/Stop buttons with IPC to main process
- [ ] T246 [US2] Implement engine bridge stub (spawn monitor, status reporting)
- [ ] T247 [US2] Implement playback status indicator (playing, stopped, error)
- [ ] T248 [US2] Implement engine crash handling (error display, restart option)

### Phase 12 Tests (SC-103, SC-104)

- [ ] T249 [US2] Integration test: open `.blue` file → display structure → save
- [ ] T250 [US2] Integration test: Play/Stop with engine stub
- [ ] T251 [US2] Integration test: engine crash recovery

---

## Phase 13: Engine Client Integration

### ZMQ Protocol Client (FR-213, FR-214, FR-218)

- [ ] T252 [P] [US3] Implement protocol constants in `packages/blue-engine-client/src/protocol.ts`
- [ ] T253 [US3] Implement `EngineClient` with ZMQ REQ/REP (create, setOption, compileOrc, readScore, start, stop, exit)
- [ ] T254 [US3] Implement engine process management (spawn blue-engine executable, monitor, restart)

### Channel Operations (FR-215)

- [ ] T255 [US3] Implement channel operations (CREATE_CHANNEL, SET_CHANNEL, GET_CHANNEL)
- [ ] T256 [US3] Implement shared memory access (POSIX on macOS, or proxy via ZMQ)

### Automation Operations (FR-216)

- [ ] T257 [US3] Implement automation operations (CREATE, UPDATE, DELETE, ENABLE, DISABLE, LIST, CLEAR)

### Electron Integration (FR-217)

- [ ] T258 [US3] Wire engine-client into Electron app's engine bridge
- [ ] T259 [US3] Replace engine stub with real blue-engine communication
- [ ] T260 [US3] Implement real-time channel value updates from UI

### Phase 13 Tests (SC-105, SC-106)

- [ ] T261 [US3] Integration test: send CSD to blue-engine → verify audio output
- [ ] T262 [US3] Integration test: channel value update during playback
- [ ] T263 [US3] Integration test: engine crash detection and recovery

---

## Phase Dependencies

- **Phase 11**: No dependencies on Phase 12-13. Can start immediately.
- **Phase 12**: Depends on Phase 11 (complete data model). Can start with engine stub.
- **Phase 13**: Depends on Phase 12 (app shell). Replaces engine stub with real client.
