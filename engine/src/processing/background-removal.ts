import { clampByte, createAlphaData } from './image-processing';
import { cloneImageBuffer, type ImageBuffer } from './image-buffer';

export interface RemoveBackgroundOptions {
  tolerance: number;
  sampleColor?: readonly [number, number, number];
  feather: number;
  shift?: number;
}

export interface RemoveBackgroundResult {
  image: ImageBuffer;
  foregroundMask: ReturnType<typeof createAlphaData>;
  sampledBackground: readonly [number, number, number];
}

function perceptualDistance(
  data: Uint8Array | Uint8ClampedArray,
  offset: number,
  color: readonly [number, number, number],
): number {
  const red = data[offset] - color[0];
  const green = data[offset + 1] - color[1];
  const blue = data[offset + 2] - color[2];
  return Math.sqrt(0.3 * red * red + 0.59 * green * green + 0.11 * blue * blue);
}

function sampleBackground(
  source: ImageBuffer,
  explicit?: readonly [number, number, number],
): [number, number, number] {
  if (explicit) {
    if (explicit.length !== 3 || explicit.some((value) => !Number.isFinite(value) || value < 0 || value > 255)) {
      throw new RangeError('Background sample color channels must be between 0 and 255.');
    }
    return [explicit[0], explicit[1], explicit[2]];
  }

  const buckets = new Map<string, { red: number; green: number; blue: number; count: number }>();
  const depth = Math.max(1, Math.min(3, Math.floor(Math.min(source.width, source.height) * 0.05)));
  const visit = (x: number, y: number) => {
    const offset = (y * source.width + x) * 4;
    if (source.data[offset + 3] < 128) return;
    const red = source.data[offset];
    const green = source.data[offset + 1];
    const blue = source.data[offset + 2];
    const key = `${Math.round(red / 32)},${Math.round(green / 32)},${Math.round(blue / 32)}`;
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.red += red;
      bucket.green += green;
      bucket.blue += blue;
      bucket.count += 1;
    } else {
      buckets.set(key, { red, green, blue, count: 1 });
    }
  };

  for (let edge = 0; edge < depth; edge += 1) {
    for (let x = 0; x < source.width; x += 1) {
      visit(x, edge);
      visit(x, source.height - 1 - edge);
    }
    for (let y = 0; y < source.height; y += 1) {
      visit(edge, y);
      visit(source.width - 1 - edge, y);
    }
  }

  let dominant: { red: number; green: number; blue: number; count: number } | undefined;
  for (const bucket of buckets.values()) {
    if (!dominant || bucket.count > dominant.count) dominant = bucket;
  }
  return dominant
    ? [dominant.red / dominant.count, dominant.green / dominant.count, dominant.blue / dominant.count]
    : [255, 255, 255];
}

function shiftForeground(mask: Uint8Array, width: number, height: number, shift: number): Uint8Array {
  const radius = Math.abs(shift);
  if (radius === 0) return mask;
  const result = new Uint8Array(mask.length);
  const target = shift > 0 ? 255 : 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let value = mask[y * width + x];
      for (let dy = -radius; dy <= radius; dy += 1) {
        for (let dx = -radius; dx <= radius; dx += 1) {
          if (dx * dx + dy * dy > radius * radius) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          const candidate = mask[ny * width + nx];
          value = shift > 0 ? Math.max(value, candidate) : Math.min(value, candidate);
          if (value === target) break;
        }
        if (value === target) break;
      }
      result[y * width + x] = value;
    }
  }
  return result;
}

function boxBlur(mask: Uint8Array, width: number, height: number, radius: number): Uint8Array {
  if (radius === 0) return mask;
  const horizontal = new Float32Array(mask.length);
  const output = new Uint8Array(mask.length);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let sum = 0;
      let count = 0;
      for (let sx = Math.max(0, x - radius); sx <= Math.min(width - 1, x + radius); sx += 1) {
        sum += mask[y * width + sx];
        count += 1;
      }
      horizontal[y * width + x] = sum / count;
    }
  }
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let sum = 0;
      let count = 0;
      for (let sy = Math.max(0, y - radius); sy <= Math.min(height - 1, y + radius); sy += 1) {
        sum += horizontal[sy * width + x];
        count += 1;
      }
      output[y * width + x] = clampByte(sum / count);
    }
  }
  return output;
}

export function removeBackgroundLocal(
  source: ImageBuffer,
  options: RemoveBackgroundOptions,
): RemoveBackgroundResult {
  if (!Number.isFinite(options.tolerance) || options.tolerance < 0) {
    throw new RangeError('Background tolerance must be a non-negative finite number.');
  }
  if (!Number.isFinite(options.feather) || options.feather < 0) {
    throw new RangeError('Feather radius must be a non-negative finite number.');
  }
  if (!Number.isFinite(options.shift ?? 0)) {
    throw new RangeError('Mask shift must be finite.');
  }

  const width = source.width;
  const height = source.height;
  const pixelCount = width * height;
  const original = cloneImageBuffer(source);
  const output = cloneImageBuffer(source);
  const background = sampleBackground(source, options.sampleColor);
  const tolerance = Math.max(1, options.tolerance);
  const mask = new Uint8Array(pixelCount).fill(255);
  const queue = new Int32Array(pixelCount);
  let head = 0;
  let tail = 0;

  const enqueue = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const pixel = y * width + x;
    if (mask[pixel] === 0 || original.data[pixel * 4 + 3] === 0) return;
    if (perceptualDistance(original.data, pixel * 4, background) <= tolerance) {
      mask[pixel] = 0;
      queue[tail++] = pixel;
    }
  };

  for (let x = 0; x < width; x += 1) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }
  while (head < tail) {
    const pixel = queue[head++];
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    enqueue(x + 1, y);
    enqueue(x - 1, y);
    enqueue(x, y + 1);
    enqueue(x, y - 1);
  }

  let finalMask = shiftForeground(mask, width, height, Math.round(options.shift ?? 0));
  finalMask = boxBlur(finalMask, width, height, Math.round(options.feather));

  for (let pixel = 0; pixel < pixelCount; pixel += 1) {
    const offset = pixel * 4;
    const maskAlpha = finalMask[pixel];
    const originalAlpha = original.data[offset + 3];
    output.data[offset + 3] = Math.min(originalAlpha, maskAlpha);

    if (maskAlpha > 10 && maskAlpha < 245 && originalAlpha > 200) {
      const alpha = maskAlpha / 255;
      if (perceptualDistance(original.data, offset, background) < tolerance * 2) {
        for (let channel = 0; channel < 3; channel += 1) {
          output.data[offset + channel] = clampByte(
            (original.data[offset + channel] - background[channel] * (1 - alpha)) / Math.max(0.01, alpha),
          );
        }
      }
    }
  }

  return {
    image: output,
    foregroundMask: createAlphaData(width, height, finalMask),
    sampledBackground: background,
  };
}
