import { afterEach, describe, expect, it, vi } from 'vitest';

import { generatePrefixedUuid, generateUuid } from './uuid';

describe('uuid utility', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('uses crypto.randomUUID when available', () => {
    vi.stubGlobal('crypto', {
      randomUUID: vi.fn(() => '123e4567-e89b-12d3-a456-426614174000'),
    });

    expect(generateUuid()).toBe('123e4567-e89b-12d3-a456-426614174000');
  });

  it('formats RFC4122 ids from getRandomValues when randomUUID is unavailable', () => {
    vi.stubGlobal('crypto', {
      getRandomValues: (values: Uint8Array) => {
        values.set([
          0x00, 0x11, 0x22, 0x33,
          0x44, 0x55, 0x66, 0x77,
          0x88, 0x99, 0xaa, 0xbb,
          0xcc, 0xdd, 0xee, 0xff,
        ]);
        return values;
      },
    });

    expect(generateUuid()).toBe('00112233-4455-4677-8899-aabbccddeeff');
  });

  it('falls back to a UUID-like format without browser crypto globals', () => {
    vi.stubGlobal('crypto', undefined);

    const uuid = generateUuid();

    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('can generate prefixed UUID-style identifiers', () => {
    vi.stubGlobal('crypto', {
      randomUUID: vi.fn(() => '123e4567-e89b-12d3-a456-426614174000'),
    });

    expect(generatePrefixedUuid('widget')).toBe('widget-123e4567-e89b-12d3-a456-426614174000');
  });
});