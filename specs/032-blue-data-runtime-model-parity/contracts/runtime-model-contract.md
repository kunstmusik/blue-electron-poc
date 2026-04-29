# Contract: Runtime Model Compatibility

## Scope

This contract defines the remaining `@blue/data` compatibility behavior for instruments, BSB, mixer, automation, and time models.

## Required Behaviors

- BSB generation applies Java-compatible value replacement, defaults, always-on behavior, and ftable behavior.
- Generic and related instruments preserve Java-compatible UDO and generation behavior.
- Preservation-sensitive or JVM-dependent instrument models do not lose XML when execution support is deferred.
- Mixer XML, defaults, master-channel handling, dependencies, and generated routing behavior match Java.
- Automation and line models preserve Java-compatible serialization and behavior.
- Time defaults and conversions match Java, including SMPTE defaults, tempo sorting, reset semantics, and BBST math.

## Test Matrix

- BSB generation and preset/default fixture
- Generic instrument UDO reference fixture
- mixer-heavy project fixture
- automation serialization and behavior fixture
- tempo-map and BBST conversion fixture
