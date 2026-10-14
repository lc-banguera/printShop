import { clampByte } from './image-processing';
import {
  assertImageBuffer,
  cloneImageBuffer,
  type ImageBuffer,
} from './image-buffer';

export type ImageBlendMode = 'normal' | 'multiply' | 'screen';

export interface ImageCompositeOptions {
  x?: number;
  y?: number;
  opacity?: number;
  blendMode?: ImageBlendMode;
}

export function compositeImageBuffer(
  backdrop: ImageBuffer,
  source: ImageBuffer,
  options: ImageCompositeOptions = {}
): ImageBuffer {
  assertImageBuffer(backdrop);
  assertImageBuffer(source);

  const offsetX = options.x ?? 0;
  const offsetY = options.y ?? 0;
  const opacity = options.opacity ?? 1;
  const blendMode = options.blendMode ?? 'normal';
  if (!Number.isSafeInteger(offsetX) || !Number.isSafeInteger(offsetY)) {
    throw new RangeError('Composite offsets must be safe integers.');
  }
  if (!Number.isFinite(opacity) || opacity < 0 || opacity > 1) {
    throw new RangeError('Composite opacity must be between 0 and 1.');
  }
  if (blendMode !== 'normal' && blendMode !== 'multiply' && blendMode !== 'screen') {
    throw new RangeError(`Unsupported image blend mode: ${blendMode}`);
  }

  const output = cloneImageBuffer(backdrop);
  const startX = Math.max(0, offsetX);
  const startY = Math.max(0, offsetY);
  const endX = Math.min(backdrop.width, offsetX + source.width);
  const endY = Math.min(backdrop.height, offsetY + source.height);

  for (let y = startY; y < endY; y += 1) {
    for (let x = startX; x < endX; x += 1) {
      const sourceIndex = ((y - offsetY) * source.width + (x - offsetX)) * 4;
      const outputIndex = (y * output.width + x) * 4;
      const sourceAlpha = (source.data[sourceIndex + 3] / 255) * opacity;
      if (sourceAlpha === 0) continue;

      const backdropAlpha = output.data[outputIndex + 3] / 255;
      const outputAlpha = sourceAlpha + backdropAlpha * (1 - sourceAlpha);
      const sourceWeight = sourceAlpha * (1 - backdropAlpha);
      const overlapWeight = sourceAlpha * backdropAlpha;
      const backdropWeight = backdropAlpha * (1 - sourceAlpha);

      for (let channel = 0; channel < 3; channel += 1) {
        const sourceColor = source.data[sourceIndex + channel] / 255;
        const backdropColor = output.data[outputIndex + channel] / 255;
        const blendedColor = blendChannel(sourceColor, backdropColor, blendMode);
        const premultipliedColor =
          sourceWeight * sourceColor +
          backdropWeight * backdropColor +
          overlapWeight * blendedColor;
        output.data[outputIndex + channel] = outputAlpha === 0
          ? 0
          : clampByte((premultipliedColor / outputAlpha) * 255);
      }
      output.data[outputIndex + 3] = clampByte(outputAlpha * 255);
    }
  }

  return output;
}

function blendChannel(source: number, backdrop: number, mode: ImageBlendMode): number {
  switch (mode) {
    case 'normal':
      return source;
    case 'multiply':
      return source * backdrop;
    case 'screen':
      return source + backdrop - source * backdrop;
  }
}
