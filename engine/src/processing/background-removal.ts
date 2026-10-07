import { clampByte, createAlphaData } from './image-processing';
import { cloneImageBuffer, type ImageBuffer } from './image-buffer';
import {
  refineForegroundMask,
  type MaskConnectivity,
  type MaskRefinementOptions,
} from './mask-refinement';

export interface RemoveBackgroundOptions {
  tolerance: number;
  sampleColor?: readonly [number, number, number];
  feather: number;
  shift?: number;
  connectivity?: MaskConnectivity;
  backgroundSampleCount?: number;
  maskRefinement?: MaskRefinementOptions;
}

export interface RemoveBackgroundResult {
  image: ImageBuffer;
  foregroundMask: ReturnType<typeof createAlphaData>;
  sampledBackground: readonly [number, number, number];
}

function perceptualDistanceSquared(
  data: Uint8Array | Uint8ClampedArray,
  offset: number,
  color: readonly [number, number, number],
): number {
  const red = data[offset] - color[0];
  const green = data[offset + 1] - color[1];
  const blue = data[offset + 2] - color[2];
  return 0.3 * red * red + 0.59 * green * green + 0.11 * blue * blue;
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

function sampleBackgroundPalette(
  source: ImageBuffer,
  count: number,
  explicit?: readonly [number, number, number],
): [number, number, number][] {
  if (explicit) return [[explicit[0], explicit[1], explicit[2]]];

  const perimeter: number[] = [];
  for (let x = 0; x < source.width; x += 1) perimeter.push(x);
  for (let y = 1; y < source.height; y += 1) perimeter.push(y * source.width + source.width - 1);
  if (source.height > 1) {
    for (let x = source.width - 2; x >= 0; x -= 1) perimeter.push((source.height - 1) * source.width + x);
  }
  if (source.width > 1) {
    for (let y = source.height - 2; y > 0; y -= 1) perimeter.push(y * source.width);
  }

  const sampleCount = Math.min(count, perimeter.length);
  const colors: [number, number, number][] = [];
  const seen = new Set<string>();
  for (let sample = 0; sample < sampleCount; sample += 1) {
    const pixel = perimeter[Math.floor((sample * perimeter.length) / sampleCount)];
    const offset = pixel * 4;
    if (source.data[offset + 3] < 128) continue;
    const color: [number, number, number] = [
      source.data[offset],
      source.data[offset + 1],
      source.data[offset + 2],
    ];
    const key = color.join(',');
    if (!seen.has(key)) {
      seen.add(key);
      colors.push(color);
    }
  }
  return colors.length > 0 ? colors : [[255, 255, 255]];
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

function distanceToClass(mask: Uint8Array, width: number, height: number, foreground: boolean): Float32Array {
  const distances = new Float32Array(mask.length);
  for (let pixel = 0; pixel < mask.length; pixel += 1) {
    distances[pixel] = (mask[pixel] >= 128) === foreground ? Number.POSITIVE_INFINITY : 0;
  }

  const diagonal = Math.SQRT2;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixel = y * width + x;
      let distance = distances[pixel];
      if (x > 0) distance = Math.min(distance, distances[pixel - 1] + 1);
      if (y > 0) distance = Math.min(distance, distances[pixel - width] + 1);
      if (x > 0 && y > 0) distance = Math.min(distance, distances[pixel - width - 1] + diagonal);
      if (x + 1 < width && y > 0) distance = Math.min(distance, distances[pixel - width + 1] + diagonal);
      distances[pixel] = distance;
    }
  }
  for (let y = height - 1; y >= 0; y -= 1) {
    for (let x = width - 1; x >= 0; x -= 1) {
      const pixel = y * width + x;
      let distance = distances[pixel];
      if (x + 1 < width) distance = Math.min(distance, distances[pixel + 1] + 1);
      if (y + 1 < height) distance = Math.min(distance, distances[pixel + width] + 1);
      if (x + 1 < width && y + 1 < height) distance = Math.min(distance, distances[pixel + width + 1] + diagonal);
      if (x > 0 && y + 1 < height) distance = Math.min(distance, distances[pixel + width - 1] + diagonal);
      distances[pixel] = distance;
    }
  }
  return distances;
}

function featherMask(mask: Uint8Array, width: number, height: number, radius: number): Uint8Array {
  if (radius === 0) return mask;
  const insideDistance = distanceToClass(mask, width, height, true);
  const outsideDistance = distanceToClass(mask, width, height, false);
  const output = new Uint8Array(mask.length);
  const smoothstep = (value: number) => {
    const t = Math.max(0, Math.min(1, value));
    return t * t * (3 - 2 * t);
  };

  for (let pixel = 0; pixel < mask.length; pixel += 1) {
    const foreground = mask[pixel] >= 128;
    const distance = foreground ? insideDistance[pixel] : outsideDistance[pixel];
    const coverage = foreground
      ? 0.5 + (distance - 0.5) / (radius * 2)
      : 0.5 - (distance - 0.5) / (radius * 2);
    output[pixel] = clampByte(smoothstep(coverage) * 255);
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
  if (
    options.connectivity !== undefined &&
    options.connectivity !== 4 &&
    options.connectivity !== 8
  ) {
    throw new RangeError('Background connectivity must be 4 or 8.');
  }
  const backgroundSampleCount = options.backgroundSampleCount ?? 16;
  if (!Number.isSafeInteger(backgroundSampleCount) || backgroundSampleCount < 1 || backgroundSampleCount > 64) {
    throw new RangeError('Background sample count must be an integer between 1 and 64.');
  }

  const width = source.width;
  const height = source.height;
  const pixelCount = width * height;
  const original = cloneImageBuffer(source);
  const output = cloneImageBuffer(source);
  const background = sampleBackground(source, options.sampleColor);
  const backgroundPalette = sampleBackgroundPalette(source, backgroundSampleCount, options.sampleColor);
  const tolerance = Math.max(1, options.tolerance);
  const mask = new Uint8Array(pixelCount).fill(255);
  const queue = new Int32Array(pixelCount);
  let head = 0;
  let tail = 0;

  const enqueue = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const pixel = y * width + x;
    if (mask[pixel] === 0 || original.data[pixel * 4 + 3] === 0) return;
    const offset = pixel * 4;
    if (
      backgroundPalette.some(
        (sample) => perceptualDistanceSquared(original.data, offset, sample) <= tolerance * tolerance,
      )
    ) {
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
    if (options.connectivity === 8) {
      enqueue(x + 1, y + 1);
      enqueue(x - 1, y + 1);
      enqueue(x + 1, y - 1);
      enqueue(x - 1, y - 1);
    }
  }

  const shiftedMask = shiftForeground(mask, width, height, Math.round(options.shift ?? 0));
  let finalMask = refineForegroundMask(
    createAlphaData(width, height, shiftedMask),
    options.maskRefinement,
  ).values;
  finalMask = featherMask(finalMask, width, height, Math.round(options.feather));

  for (let pixel = 0; pixel < pixelCount; pixel += 1) {
    const offset = pixel * 4;
    const maskAlpha = finalMask[pixel];
    const originalAlpha = original.data[offset + 3];
    output.data[offset + 3] = Math.min(originalAlpha, maskAlpha);

    if (maskAlpha > 10 && maskAlpha < 245 && originalAlpha > 200) {
      const alpha = maskAlpha / 255;
      let edgeBackground = backgroundPalette[0];
      let closestDistance = perceptualDistanceSquared(original.data, offset, edgeBackground);
      for (let sample = 1; sample < backgroundPalette.length; sample += 1) {
        const distance = perceptualDistanceSquared(original.data, offset, backgroundPalette[sample]);
        if (distance < closestDistance) {
          closestDistance = distance;
          edgeBackground = backgroundPalette[sample];
        }
      }
      if (closestDistance < (tolerance * 2) ** 2) {
        for (let channel = 0; channel < 3; channel += 1) {
          output.data[offset + channel] = clampByte(
            (original.data[offset + channel] - edgeBackground[channel] * (1 - alpha)) / Math.max(0.01, alpha),
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
