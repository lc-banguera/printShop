import { assertImageBuffer, createImageBuffer, resizeImageBuffer, type ImageBuffer } from './image-buffer';

export interface UpscalingProcessor {
  readonly providerId: string;
  upscale(source: ImageBuffer, factor: number): Promise<ImageBuffer>;
}

export type UpscalingResult =
  | { status: 'succeeded'; image: ImageBuffer; providerId: string; method?: 'resample' | 'super-resolution' }
  | { status: 'not-configured'; code: 'NOT_CONFIGURED'; message: string };

export type UpscaleMethod = 'bilinear' | 'bicubic' | 'sharpen' | 'lanczos';

export interface UpscaleTarget {
  /** Desired maximum output dimension. Larger sources are preserved. */
  maxDimension: number;
}

function cubicWeight(x: number, a = -0.5): number {
  const absX = Math.abs(x);
  if (absX <= 1) {
    return (a + 2) * absX * absX * absX - (a + 3) * absX * absX + 1;
  }
  if (absX < 2) {
    return a * absX * absX * absX - 5 * a * absX * absX + 8 * a * absX - 4 * a;
  }
  return 0;
}

function clampByte(val: number): number {
  return Math.min(255, Math.max(0, Math.round(val)));
}

export function resizeBicubic(source: ImageBuffer, width: number, height: number): ImageBuffer {
  assertImageBuffer(source);
  const out = createImageBuffer(width, height);
  const srcW = source.width;
  const srcH = source.height;

  for (let y = 0; y < height; y++) {
    const srcY = (y + 0.5) * srcH / height - 0.5;
    const y0 = Math.floor(srcY);
    for (let x = 0; x < width; x++) {
      const srcX = (x + 0.5) * srcW / width - 0.5;
      const x0 = Math.floor(srcX);

      let r = 0, g = 0, b = 0, a = 0;
      let totalWeight = 0;

      for (let j = -1; j <= 2; j++) {
        const sy = Math.min(srcH - 1, Math.max(0, y0 + j));
        const wy = cubicWeight(srcY - (y0 + j));
        for (let i = -1; i <= 2; i++) {
          const sx = Math.min(srcW - 1, Math.max(0, x0 + i));
          const wx = cubicWeight(srcX - (x0 + i));
          const w = wx * wy;

          const idx = (sy * srcW + sx) * 4;
          const alpha = source.data[idx + 3] / 255;
          r += source.data[idx] * alpha * w;
          g += source.data[idx + 1] * alpha * w;
          b += source.data[idx + 2] * alpha * w;
          a += alpha * w;
          totalWeight += w;
        }
      }

      const dstIdx = (y * width + x) * 4;
      if (totalWeight > 0 && a > 0) {
        const normAlpha = a / totalWeight;
        out.data[dstIdx] = clampByte(r / a);
        out.data[dstIdx + 1] = clampByte(g / a);
        out.data[dstIdx + 2] = clampByte(b / a);
        out.data[dstIdx + 3] = clampByte(normAlpha * 255);
      } else {
        out.data[dstIdx] = 0;
        out.data[dstIdx + 1] = 0;
        out.data[dstIdx + 2] = 0;
        out.data[dstIdx + 3] = 0;
      }
    }
  }
  return out;
}

function sinc(value: number): number {
  if (value === 0) return 1;
  const piValue = Math.PI * value;
  return Math.sin(piValue) / piValue;
}

function lanczosWeight(value: number, radius = 3): number {
  const distance = Math.abs(value);
  return distance >= radius ? 0 : sinc(value) * sinc(value / radius);
}

export function resizeLanczos(source: ImageBuffer, width: number, height: number): ImageBuffer {
  assertImageBuffer(source);
  type ResampleTap = { index: number; weight: number };
  const createTaps = (sourceSize: number, targetSize: number): ResampleTap[][] => {
    const result: ResampleTap[][] = [];
    for (let targetIndex = 0; targetIndex < targetSize; targetIndex += 1) {
      const coordinate = (targetIndex + 0.5) * sourceSize / targetSize - 0.5;
      const center = Math.floor(coordinate);
      const taps: ResampleTap[] = [];
      for (let offset = -2; offset <= 3; offset += 1) {
        const index = Math.min(sourceSize - 1, Math.max(0, center + offset));
        const weight = lanczosWeight(coordinate - (center + offset));
        if (weight !== 0) taps.push({ index, weight });
      }
      result.push(taps);
    }
    return result;
  };

  // Separable filtering keeps the high-quality Lanczos kernel while reducing
  // the cost of a 4K conversion from width*height*36 samples to two passes.
  const horizontalTaps = createTaps(source.width, width);
  const verticalTaps = createTaps(source.height, height);
  const horizontal = new Float32Array(width * source.height * 4);

  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const taps = horizontalTaps[x];
      let totalWeight = 0;
      let red = 0;
      let green = 0;
      let blue = 0;
      let alpha = 0;
      for (const tap of taps) {
        const index = (y * source.width + tap.index) * 4;
        const sampleAlpha = source.data[index + 3] / 255;
        red += source.data[index] * sampleAlpha * tap.weight;
        green += source.data[index + 1] * sampleAlpha * tap.weight;
        blue += source.data[index + 2] * sampleAlpha * tap.weight;
        alpha += sampleAlpha * tap.weight;
        totalWeight += tap.weight;
      }
      const outputIndex = (y * width + x) * 4;
      const normalization = totalWeight === 0 ? 1 : totalWeight;
      horizontal[outputIndex] = red / normalization;
      horizontal[outputIndex + 1] = green / normalization;
      horizontal[outputIndex + 2] = blue / normalization;
      horizontal[outputIndex + 3] = alpha / normalization;
    }
  }

  const out = createImageBuffer(width, height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const taps = verticalTaps[y];
      let totalWeight = 0;
      let red = 0;
      let green = 0;
      let blue = 0;
      let alpha = 0;
      for (const tap of taps) {
        const index = (tap.index * width + x) * 4;
        red += horizontal[index] * tap.weight;
        green += horizontal[index + 1] * tap.weight;
        blue += horizontal[index + 2] * tap.weight;
        alpha += horizontal[index + 3] * tap.weight;
        totalWeight += tap.weight;
      }
      const outputIndex = (y * width + x) * 4;
      const normalization = totalWeight === 0 ? 1 : totalWeight;
      const normalizedAlpha = Math.max(0, alpha / normalization);
      if (normalizedAlpha > 0) {
        out.data[outputIndex] = clampByte((red / normalization) / normalizedAlpha);
        out.data[outputIndex + 1] = clampByte((green / normalization) / normalizedAlpha);
        out.data[outputIndex + 2] = clampByte((blue / normalization) / normalizedAlpha);
        out.data[outputIndex + 3] = clampByte(normalizedAlpha * 255);
      }
    }
  }
  return out;
}

export function upscaleImageLocal(
  source: ImageBuffer,
  factor: number,
  method: UpscaleMethod = 'bicubic',
): ImageBuffer {
  assertImageBuffer(source);
  if (!Number.isFinite(factor) || factor <= 1) {
    throw new RangeError('Upscaling factor must be greater than 1.');
  }
  const targetW = Math.max(1, Math.round(source.width * factor));
  const targetH = Math.max(1, Math.round(source.height * factor));

  if (method === 'bilinear') {
    return resizeImageBuffer(source, targetW, targetH, 'bilinear');
  }

  const resampled = method === 'lanczos'
    ? resizeLanczos(source, targetW, targetH)
    : resizeBicubic(source, targetW, targetH);
  if (method === 'sharpen') {
    // Unsharp mask pass to enhance edges
    const sharpened = createImageBuffer(targetW, targetH);
    const w = targetW;
    const h = targetH;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        if (x === 0 || y === 0 || x === w - 1 || y === h - 1) {
          sharpened.data.set(resampled.data.subarray(idx, idx + 4), idx);
          continue;
        }
        for (let c = 0; c < 3; c++) {
          const center = resampled.data[idx + c];
          const neighbors =
            resampled.data[((y - 1) * w + x) * 4 + c] +
            resampled.data[((y + 1) * w + x) * 4 + c] +
            resampled.data[(y * w + (x - 1)) * 4 + c] +
            resampled.data[(y * w + (x + 1)) * 4 + c];
          const val = center * 1.5 - (neighbors / 4) * 0.5;
          sharpened.data[idx + c] = clampByte(val);
        }
        sharpened.data[idx + 3] = resampled.data[idx + 3];
      }
    }
    return sharpened;
  }
  return resampled;
}

/** Scale to a long-edge target without changing aspect ratio. */
export function upscaleImageLocalToTarget(
  source: ImageBuffer,
  target: UpscaleTarget,
  method: UpscaleMethod = 'bicubic',
): ImageBuffer {
  assertImageBuffer(source);
  if (!Number.isFinite(target.maxDimension) ||
      !Number.isSafeInteger(target.maxDimension) ||
      target.maxDimension <= 0) {
    throw new RangeError('Upscale target dimension must be a positive safe integer.');
  }
  const currentMax = Math.max(source.width, source.height);
  if (currentMax >= target.maxDimension) {
    return createImageBuffer(source.width, source.height, source.data);
  }
  return upscaleImageLocal(source, target.maxDimension / currentMax, method);
}

export async function upscaleImage(
  source: ImageBuffer,
  factor: number,
  processor?: UpscalingProcessor,
): Promise<UpscalingResult> {
  if (!Number.isFinite(factor) || factor <= 1) {
    throw new RangeError('Upscaling factor must be greater than 1.');
  }
  if (!processor) {
    return {
      status: 'not-configured',
      code: 'NOT_CONFIGURED',
      message: 'No real upscaling processor is configured.',
    };
  }
  const image = await processor.upscale(source, factor);
  assertImageBuffer(image);
  if (image.width < source.width * factor || image.height < source.height * factor) {
    throw new RangeError('Upscaling processor returned dimensions below the requested scale factor.');
  }
  if (!processor.providerId.trim()) throw new TypeError('Upscaling processor must have a provider id.');
  return { status: 'succeeded', image, providerId: processor.providerId, method: 'super-resolution' };
}
