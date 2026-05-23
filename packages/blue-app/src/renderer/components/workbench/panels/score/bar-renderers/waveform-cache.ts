export interface WaveformCacheEntry {
  key: string;
  filePath: string;
  pixelSecond: number;
  loading: boolean;
  error?: string;
  channels: Array<{
    min: number[];
    max: number[];
  }>;
}

const waveformCache = new Map<string, WaveformCacheEntry>();
const waveformListeners = new Map<string, Set<() => void>>();
const pendingWaveformLoads = new Map<string, Promise<void>>();

function normalizePixelSecond(pixelSecond: number): number {
  if (!Number.isFinite(pixelSecond) || pixelSecond <= 0) {
    return 1;
  }
  return Math.max(1, Math.round(pixelSecond * 1000) / 1000);
}

function emitWaveformUpdate(key: string): void {
  const listeners = waveformListeners.get(key);
  if (!listeners) {
    return;
  }
  for (const listener of listeners) {
    listener();
  }
}

function getAudioContext(): AudioContext | null {
  const AudioContextCtor = globalThis.AudioContext
    ?? (globalThis as typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) {
    return null;
  }
  return new AudioContextCtor();
}

function normalizeAudioBytes(bytes: unknown): ArrayBuffer | null {
  if (!bytes) {
    return null;
  }

  if (bytes instanceof ArrayBuffer) {
    return bytes;
  }

  if (ArrayBuffer.isView(bytes)) {
    return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  }

  if (Array.isArray(bytes)) {
    return Uint8Array.from(bytes).buffer;
  }

  return null;
}

export function buildWaveformCacheKey(key: string, pixelSecond: number): string {
  return `${key}@${normalizePixelSecond(pixelSecond)}`;
}

export function getWaveformCacheEntry(key: string, pixelSecond?: number): WaveformCacheEntry | undefined {
  return waveformCache.get(pixelSecond === undefined ? key : buildWaveformCacheKey(key, pixelSecond));
}

export function setWaveformCacheEntry(entry: WaveformCacheEntry): void {
  waveformCache.set(entry.key, entry);
  emitWaveformUpdate(entry.key);
}

export function clearWaveformCache(): void {
  waveformCache.clear();
  waveformListeners.clear();
  pendingWaveformLoads.clear();
}

export function subscribeWaveformCacheEntry(key: string, listener: () => void): () => void {
  const listeners = waveformListeners.get(key) ?? new Set<() => void>();
  listeners.add(listener);
  waveformListeners.set(key, listeners);

  return () => {
    const current = waveformListeners.get(key);
    if (!current) {
      return;
    }
    current.delete(listener);
    if (current.size === 0) {
      waveformListeners.delete(key);
    }
  };
}

export function summarizeWaveformChannels(
  channelData: Float32Array[],
  sampleRate: number,
  pixelSecond: number,
): WaveformCacheEntry['channels'] {
  const normalizedPixelSecond = normalizePixelSecond(pixelSecond);

  return channelData.map((samples) => {
    const samplesPerBucket = Math.max(1, Math.floor(sampleRate / normalizedPixelSecond));
    const bucketCount = Math.max(1, Math.ceil(samples.length / samplesPerBucket));
    const min = new Array<number>(bucketCount).fill(0);
    const max = new Array<number>(bucketCount).fill(0);

    for (let bucketIndex = 0; bucketIndex < bucketCount; bucketIndex += 1) {
      const start = bucketIndex * samplesPerBucket;
      const end = Math.min(samples.length, start + samplesPerBucket);
      let bucketMin = 1;
      let bucketMax = -1;

      for (let sampleIndex = start; sampleIndex < end; sampleIndex += 1) {
        const sample = samples[sampleIndex] ?? 0;
        if (sample < bucketMin) bucketMin = sample;
        if (sample > bucketMax) bucketMax = sample;
      }

      if (end <= start) {
        bucketMin = 0;
        bucketMax = 0;
      }

      min[bucketIndex] = bucketMin;
      max[bucketIndex] = bucketMax;
    }

    return { min, max };
  });
}

async function loadWaveform(cacheKey: string, filePath: string, pixelSecond: number): Promise<void> {
  if (pendingWaveformLoads.has(cacheKey)) {
    return pendingWaveformLoads.get(cacheKey)!;
  }

  const loadPromise = (async () => {
    try {
      const bytes = normalizeAudioBytes(await window.blueAPI.readAudioFileBytes(filePath) as unknown);
      if (!bytes) {
        setWaveformCacheEntry({
          key: cacheKey,
          filePath,
          pixelSecond: normalizePixelSecond(pixelSecond),
          loading: false,
          error: 'Unable to read audio file.',
          channels: [],
        });
        return;
      }

      const audioContext = getAudioContext();
      if (!audioContext) {
        setWaveformCacheEntry({
          key: cacheKey,
          filePath,
          pixelSecond: normalizePixelSecond(pixelSecond),
          loading: false,
          error: 'AudioContext is unavailable.',
          channels: [],
        });
        return;
      }

      try {
        const decoded = await audioContext.decodeAudioData(bytes.slice(0));
        const channels = summarizeWaveformChannels(
          Array.from({ length: decoded.numberOfChannels }, (_, index) => decoded.getChannelData(index)),
          decoded.sampleRate,
          pixelSecond,
        );
        setWaveformCacheEntry({
          key: cacheKey,
          filePath,
          pixelSecond: normalizePixelSecond(pixelSecond),
          loading: false,
          channels,
        });
      } finally {
        void audioContext.close().catch(() => undefined);
      }
    } catch (error) {
      setWaveformCacheEntry({
        key: cacheKey,
        filePath,
        pixelSecond: normalizePixelSecond(pixelSecond),
        loading: false,
        error: error instanceof Error ? error.message : String(error),
        channels: [],
      });
    } finally {
      pendingWaveformLoads.delete(cacheKey);
    }
  })();

  pendingWaveformLoads.set(cacheKey, loadPromise);
  return loadPromise;
}

export function requestWaveform(key: string, filePath: string, pixelSecond: number): WaveformCacheEntry {
  const cacheKey = buildWaveformCacheKey(key, pixelSecond);
  const existing = waveformCache.get(cacheKey);
  if (existing) return existing;

  const entry: WaveformCacheEntry = {
    key: cacheKey,
    filePath,
    pixelSecond: normalizePixelSecond(pixelSecond),
    loading: true,
    channels: [],
  };
  waveformCache.set(cacheKey, entry);
  void loadWaveform(cacheKey, filePath, pixelSecond);
  return entry;
}

export function buildWaveformPathData(
  entry: WaveformCacheEntry,
  options: {
    width: number;
    height: number;
    pixelsPerBeat: number;
    startOffsetBeats?: number;
    looping?: boolean;
  },
): string[] {
  const width = Math.max(0, Math.floor(options.width));
  const height = Math.max(1, Math.floor(options.height));
  const pixelsPerBeat = Math.max(1, options.pixelsPerBeat);
  const startOffsetBeats = Math.max(0, options.startOffsetBeats ?? 0);
  const looping = options.looping === true;

  if (width <= 0 || entry.channels.length === 0) {
    return [];
  }

  const center = (height - 1) / 2;
  const amplitude = Math.max(1, height - 1) / 2;
  const startOffsetPixels = Math.max(0, startOffsetBeats * pixelsPerBeat);

  return entry.channels.map((channel) => {
    const sampleCount = Math.min(channel.min.length, channel.max.length);
    if (sampleCount === 0) {
      return '';
    }

    let path = '';
    for (let x = 0; x < width; x += 1) {
      let sampleIndex = Math.floor(startOffsetPixels + x);

      if (looping) {
        sampleIndex = ((sampleIndex % sampleCount) + sampleCount) % sampleCount;
      } else if (sampleIndex < 0 || sampleIndex >= sampleCount) {
        continue;
      }

      const min = channel.min[sampleIndex] ?? 0;
      const max = channel.max[sampleIndex] ?? 0;
      const yTop = center - (max * amplitude);
      const yBottom = center - (min * amplitude);
      path += `M${x + 0.5} ${yTop} L${x + 0.5} ${yBottom} `;
    }

    return path.trim();
  }).filter((path) => path.length > 0);
}
