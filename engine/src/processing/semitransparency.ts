import { cloneImageBuffer, analyzeAlpha, type ImageBuffer, type AlphaSummary } from './image-buffer';

export type SemitransparencyCleanupStrategy = 'remove' | 'make-opaque' | 'threshold' | 'remove-isolated';

export interface SemitransparencyCleanupOptions {
  strategy: SemitransparencyCleanupStrategy;
  threshold?: number;
  maximumIsolatedPixels?: number;
  connectivity?: 4 | 8;
}

export interface SemitransparencyCleanupResult {
  image: ImageBuffer;
  before: AlphaSummary;
  after: AlphaSummary;
  changedPixels: number;
}

export function cleanupSemitransparency(
  source: ImageBuffer,
  options: SemitransparencyCleanupOptions,
): SemitransparencyCleanupResult {
  if (!['remove', 'make-opaque', 'threshold', 'remove-isolated'].includes(options.strategy)) {
    throw new TypeError(`Unsupported semitransparency strategy: ${String(options.strategy)}`);
  }
  const threshold = options.threshold ?? 128;
  if (options.strategy === 'threshold' && (!Number.isFinite(threshold) || threshold < 0 || threshold > 255)) {
    throw new RangeError('Alpha threshold must be between 0 and 255.');
  }
  const maximumIsolatedPixels = options.maximumIsolatedPixels ?? 1;
  if (
    options.strategy === 'remove-isolated' &&
    (!Number.isSafeInteger(maximumIsolatedPixels) || maximumIsolatedPixels < 1)
  ) {
    throw new RangeError('Maximum isolated alpha component size must be a positive safe integer.');
  }
  if (options.connectivity !== undefined && options.connectivity !== 4 && options.connectivity !== 8) {
    throw new RangeError('Alpha connectivity must be 4 or 8.');
  }

  const before = analyzeAlpha(source);
  const image = cloneImageBuffer(source);
  let changedPixels = 0;
  if (options.strategy === 'remove-isolated') {
    const pixelCount = source.width * source.height;
    const visited = new Uint8Array(pixelCount);
    const queue = new Int32Array(pixelCount);
    const connectivity = options.connectivity ?? 8;
    for (let start = 0; start < pixelCount; start += 1) {
      const startAlpha = image.data[start * 4 + 3];
      if (visited[start] || startAlpha === 0 || startAlpha === 255) continue;
      let head = 0;
      let tail = 0;
      let touchesOpaque = false;
      queue[tail++] = start;
      visited[start] = 1;

      while (head < tail) {
        const pixel = queue[head++];
        const x = pixel % source.width;
        const y = Math.floor(pixel / source.width);
        for (let dy = -1; dy <= 1; dy += 1) {
          for (let dx = -1; dx <= 1; dx += 1) {
            if (dx === 0 && dy === 0) continue;
            if (connectivity === 4 && Math.abs(dx) + Math.abs(dy) !== 1) continue;
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= source.width || ny >= source.height) continue;
            const adjacent = ny * source.width + nx;
            const alpha = image.data[adjacent * 4 + 3];
            if (alpha === 255) {
              touchesOpaque = true;
            } else if (alpha > 0 && !visited[adjacent]) {
              visited[adjacent] = 1;
              queue[tail++] = adjacent;
            }
          }
        }
      }

      if (!touchesOpaque && tail <= maximumIsolatedPixels) {
        for (let index = 0; index < tail; index += 1) {
          image.data[queue[index] * 4 + 3] = 0;
          changedPixels += 1;
        }
      }
    }
    return { image, before, after: analyzeAlpha(image), changedPixels };
  }

  for (let index = 3; index < image.data.length; index += 4) {
    const alpha = image.data[index];
    if (alpha === 0 || alpha === 255) continue;
    changedPixels += 1;
    if (options.strategy === 'remove') image.data[index] = 0;
    else if (options.strategy === 'make-opaque') image.data[index] = 255;
    else image.data[index] = alpha >= threshold ? 255 : 0;
  }
  return { image, before, after: analyzeAlpha(image), changedPixels };
}
