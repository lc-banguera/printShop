import { createCenteredTransform } from './affine-transform';
import type { AffineTransform } from './affine-transform';

export interface ArtworkTransform {
  scale: number;
  rotationDegrees: number;
  flipX: boolean;
  flipY: boolean;
  offsetX: number;
  offsetY: number;
}

export function createArtworkTransformMatrix(
  width: number,
  height: number,
  transform: ArtworkTransform
): AffineTransform {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new RangeError('Artwork transform dimensions must be positive finite numbers');
  }
  if (!Number.isFinite(transform.scale) || transform.scale <= 0) {
    throw new RangeError('Artwork transform scale must be a positive finite number');
  }
  if (!Number.isFinite(transform.offsetX) || !Number.isFinite(transform.offsetY)) {
    throw new RangeError('Artwork transform offsets must be finite numbers');
  }

  return createCenteredTransform(
    { x: 0, y: 0, width, height },
    {
      translateX: transform.offsetX * width,
      translateY: transform.offsetY * height,
      scaleX: transform.scale * (transform.flipX ? -1 : 1),
      scaleY: transform.scale * (transform.flipY ? -1 : 1),
      rotationDegrees: transform.rotationDegrees,
    }
  );
}
