import {
  invertAffineTransform,
  transformPoint,
  type AffineTransform,
} from '../transform/affine-transform';
import { clampByte } from './image-processing';
import {
  assertImageBuffer,
  createImageBuffer,
  type ImageBuffer,
  type ImageResamplingMethod,
} from './image-buffer';

export function transformImageBuffer(
  source: ImageBuffer,
  transform: AffineTransform,
  outputWidth: number,
  outputHeight: number,
  method: ImageResamplingMethod = 'bilinear'
): ImageBuffer {
  assertImageBuffer(source);
  if (!Number.isSafeInteger(outputWidth) || outputWidth <= 0 ||
      !Number.isSafeInteger(outputHeight) || outputHeight <= 0) {
    throw new RangeError('Transformed image dimensions must be positive safe integers.');
  }

  const inverse = invertAffineTransform(transform);
  const output = createImageBuffer(outputWidth, outputHeight);

  for (let y = 0; y < outputHeight; y += 1) {
    for (let x = 0; x < outputWidth; x += 1) {
      const sourcePoint = transformPoint({ x: x + 0.5, y: y + 0.5 }, inverse);
      const sourceX = sourcePoint.x - 0.5;
      const sourceY = sourcePoint.y - 0.5;
      if (sourceX < -0.5 || sourceY < -0.5 ||
          sourceX >= source.width - 0.5 || sourceY >= source.height - 0.5) {
        continue;
      }
      const outputIndex = (y * outputWidth + x) * 4;
      if (method === 'nearest') {
        const nearestX = Math.max(0, Math.min(source.width - 1, Math.floor(sourceX + 0.5)));
        const nearestY = Math.max(0, Math.min(source.height - 1, Math.floor(sourceY + 0.5)));
        const sourceIndex = (nearestY * source.width + nearestX) * 4;
        output.data.set(source.data.subarray(sourceIndex, sourceIndex + 4), outputIndex);
        continue;
      }
      if (method !== 'bilinear') {
        throw new TypeError(`Unsupported image resampling method: ${String(method)}`);
      }

      sampleBilinear(source, sourceX, sourceY, output, outputIndex);
    }
  }

  return output;
}

function sampleBilinear(
  source: ImageBuffer,
  x: number,
  y: number,
  output: ImageBuffer,
  outputIndex: number
): void {
  const x0 = Math.max(0, Math.floor(x));
  const y0 = Math.max(0, Math.floor(y));
  const x1 = Math.min(source.width - 1, x0 + 1);
  const y1 = Math.min(source.height - 1, y0 + 1);
  const weightX = Math.max(0, Math.min(1, x - x0));
  const weightY = Math.max(0, Math.min(1, y - y0));
  const samples = [
    [(y0 * source.width + x0) * 4, (1 - weightX) * (1 - weightY)],
    [(y0 * source.width + x1) * 4, weightX * (1 - weightY)],
    [(y1 * source.width + x0) * 4, (1 - weightX) * weightY],
    [(y1 * source.width + x1) * 4, weightX * weightY],
  ] as const;
  let alpha = 0;
  const premultiplied = [0, 0, 0];

  for (const [sourceIndex, weight] of samples) {
    const sampleAlpha = source.data[sourceIndex + 3] / 255;
    alpha += sampleAlpha * weight;
    for (let channel = 0; channel < 3; channel += 1) {
      premultiplied[channel] += source.data[sourceIndex + channel] * sampleAlpha * weight;
    }
  }
  if (alpha > 0) {
    for (let channel = 0; channel < 3; channel += 1) {
      output.data[outputIndex + channel] = clampByte(premultiplied[channel] / alpha);
    }
  }
  output.data[outputIndex + 3] = clampByte(alpha * 255);
}
