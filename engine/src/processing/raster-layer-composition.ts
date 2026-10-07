import type { AffineTransform } from '../transform/affine-transform';
import { compositeImageBuffer, type ImageBlendMode } from './image-compositing';
import {
  createImageBuffer,
  type ImageBuffer,
  type ImageResamplingMethod,
} from './image-buffer';
import { transformImageBuffer } from './image-transform';

export interface RasterLayerInput {
  image: ImageBuffer;
  transform: AffineTransform;
  visible?: boolean;
  opacity?: number;
  blendMode?: ImageBlendMode;
}

export interface RasterLayerCompositionOptions {
  width: number;
  height: number;
  resampling?: ImageResamplingMethod;
}

export function compositeRasterLayers(
  layersBottomToTop: readonly RasterLayerInput[],
  options: RasterLayerCompositionOptions
): ImageBuffer {
  if (!Number.isSafeInteger(options.width) || options.width <= 0 ||
      !Number.isSafeInteger(options.height) || options.height <= 0) {
    throw new RangeError('Composite dimensions must be positive safe integers.');
  }
  const resampling = options.resampling ?? 'bilinear';
  if (resampling !== 'nearest' && resampling !== 'bilinear') {
    throw new TypeError(`Unsupported image resampling method: ${String(resampling)}`);
  }

  let output = createImageBuffer(options.width, options.height);
  for (const layer of layersBottomToTop) {
    if (layer.visible === false) continue;
    const opacity = layer.opacity ?? 1;
    if (!Number.isFinite(opacity) || opacity < 0 || opacity > 1) {
      throw new RangeError('Raster layer opacity must be between 0 and 1.');
    }
    if (opacity === 0) continue;

    const transformed = transformImageBuffer(
      layer.image,
      layer.transform,
      options.width,
      options.height,
      resampling
    );
    output = compositeImageBuffer(output, transformed, {
      opacity,
      blendMode: layer.blendMode,
    });
  }
  return output;
}
