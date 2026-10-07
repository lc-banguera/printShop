import type { DesignElement } from '../types/element';
import {
  createAffineTransform,
  transformBounds,
  type AffineTransform,
  type TransformPoint,
  type TransformRectangle,
} from './affine-transform';

export interface ElementGeometry {
  center: TransformPoint;
  transform: AffineTransform;
  bounds: TransformRectangle;
}

export interface ElementResizeInput {
  width: number;
  height: number;
  center: TransformPoint;
  scaleX?: number;
  scaleY?: number;
  preserveAspectRatio?: boolean;
  minDimension?: number;
}

export interface ResizedElementGeometry extends TransformRectangle {
  scaleX: number;
  scaleY: number;
  rotation: number;
}

export function getElementGeometry(
  element: Pick<DesignElement, 'x' | 'y' | 'width' | 'height' | 'rotation' | 'scaleX' | 'scaleY'>
): ElementGeometry {
  assertFinite([element.x, element.y, element.width, element.height]);
  if (element.width < 0 || element.height < 0) {
    throw new RangeError('Element dimensions must be non-negative');
  }

  const center = {
    x: element.x + element.width / 2,
    y: element.y + element.height / 2,
  };
  const transform = createAffineTransform({
    rotationDegrees: element.rotation ?? 0,
    scaleX: element.scaleX ?? 1,
    scaleY: element.scaleY ?? 1,
    origin: center,
  });
  const bounds = transformBounds(element, transform);
  return { center, transform, bounds };
}

export function resizeElementGeometry(
  element: Pick<DesignElement, 'x' | 'y' | 'width' | 'height' | 'rotation' | 'scaleX' | 'scaleY'>,
  input: ElementResizeInput
): ResizedElementGeometry {
  const minDimension = input.minDimension ?? 1;
  assertFinite([
    element.x,
    element.y,
    element.width,
    element.height,
    input.width,
    input.height,
    input.center.x,
    input.center.y,
    input.scaleX ?? 1,
    input.scaleY ?? 1,
    minDimension,
  ]);
  if (element.width <= 0 || element.height <= 0 || minDimension <= 0) {
    throw new RangeError('Element and minimum dimensions must be greater than zero');
  }
  if (input.width < 0 || input.height < 0) {
    throw new RangeError('Resized dimensions must be non-negative');
  }

  let width = Math.max(input.width, minDimension);
  let height = Math.max(input.height, minDimension);

  if (input.preserveAspectRatio) {
    const aspectRatio = element.width / element.height;
    const widthChange = Math.abs(width / element.width - 1);
    const heightChange = Math.abs(height / element.height - 1);
    if (widthChange >= heightChange) {
      height = width / aspectRatio;
    } else {
      width = height * aspectRatio;
    }

    if (width < minDimension || height < minDimension) {
      const scale = minDimension / Math.min(element.width, element.height);
      width = element.width * scale;
      height = element.height * scale;
    }
  } else {
    width = Math.max(width, minDimension);
    height = Math.max(height, minDimension);
  }

  return {
    x: input.center.x - width / 2,
    y: input.center.y - height / 2,
    width,
    height,
    scaleX: nonZeroSign(input.scaleX ?? element.scaleX ?? 1, element.scaleX ?? 1),
    scaleY: nonZeroSign(input.scaleY ?? element.scaleY ?? 1, element.scaleY ?? 1),
    rotation: element.rotation ?? 0,
  };
}

function assertFinite(values: number[]): void {
  if (!values.every(Number.isFinite)) {
    throw new RangeError('Element geometry values must be finite numbers');
  }
}

function nonZeroSign(value: number, fallback: number): number {
  return Math.sign(value) || Math.sign(fallback) || 1;
}
