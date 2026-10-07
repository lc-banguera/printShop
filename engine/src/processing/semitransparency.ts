import { cloneImageBuffer, analyzeAlpha, type ImageBuffer, type AlphaSummary } from './image-buffer';

export type SemitransparencyCleanupStrategy = 'remove' | 'make-opaque' | 'threshold';

export interface SemitransparencyCleanupOptions {
  strategy: SemitransparencyCleanupStrategy;
  threshold?: number;
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
  if (!['remove', 'make-opaque', 'threshold'].includes(options.strategy)) {
    throw new TypeError(`Unsupported semitransparency strategy: ${String(options.strategy)}`);
  }
  const threshold = options.threshold ?? 128;
  if (options.strategy === 'threshold' && (!Number.isFinite(threshold) || threshold < 0 || threshold > 255)) {
    throw new RangeError('Alpha threshold must be between 0 and 255.');
  }

  const before = analyzeAlpha(source);
  const image = cloneImageBuffer(source);
  let changedPixels = 0;
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
