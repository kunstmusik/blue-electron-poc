type CryptoLike = {
  randomUUID?: () => string;
  getRandomValues?: (values: Uint8Array) => Uint8Array;
};

function getCryptoLike(): CryptoLike | undefined {
  if (typeof globalThis !== 'object' || globalThis === null || !('crypto' in globalThis)) {
    return undefined;
  }

  return (globalThis as typeof globalThis & { crypto?: CryptoLike }).crypto;
}

function formatUuid(bytes: Uint8Array): string {
  const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, '0'));
  return [
    hex.slice(0, 4).join(''),
    hex.slice(4, 6).join(''),
    hex.slice(6, 8).join(''),
    hex.slice(8, 10).join(''),
    hex.slice(10, 16).join(''),
  ].join('-');
}

function fillRandomBytes(bytes: Uint8Array): Uint8Array {
  const cryptoLike = getCryptoLike();
  if (typeof cryptoLike?.getRandomValues === 'function') {
    return cryptoLike.getRandomValues(bytes);
  }

  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Math.floor(Math.random() * 256);
  }

  return bytes;
}

export function generateUuid(): string {
  const cryptoLike = getCryptoLike();
  if (typeof cryptoLike?.randomUUID === 'function') {
    return cryptoLike.randomUUID();
  }

  const bytes = fillRandomBytes(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return formatUuid(bytes);
}

export function generatePrefixedUuid(prefix: string): string {
  return `${prefix}-${generateUuid()}`;
}