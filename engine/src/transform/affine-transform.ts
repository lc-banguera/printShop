import type { TransformBounds } from './transform-system';

export interface TransformPoint {
  x: number;
  y: number;
}

export interface AffineTransform {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
}

export interface AffineTransformOptions {
  translateX?: number;
  translateY?: number;
  scaleX?: number;
  scaleY?: number;
  rotationDegrees?: number;
  origin?: TransformPoint;
}

export interface TransformRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function createCenteredTransform(
  bounds: TransformRectangle,
  options: Omit<AffineTransformOptions, 'origin'> = {}
): AffineTransform {
  assertFiniteValues([bounds.x, bounds.y, bounds.width, bounds.height]);
  if (bounds.width < 0 || bounds.height < 0) {
    throw new RangeError('Transform bounds width and height must be non-negative');
  }
  return createAffineTransform({
    ...options,
    origin: {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2,
    },
  });
}

export function createAffineTransform(options: AffineTransformOptions = {}): AffineTransform {
  const translateX = options.translateX ?? 0;
  const translateY = options.translateY ?? 0;
  const scaleX = options.scaleX ?? 1;
  const scaleY = options.scaleY ?? 1;
  const rotationDegrees = options.rotationDegrees ?? 0;
  const origin = options.origin ?? { x: 0, y: 0 };

  assertFiniteValues([translateX, translateY, scaleX, scaleY, rotationDegrees, origin.x, origin.y]);

  const radians = (rotationDegrees * Math.PI) / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  const a = cosine * scaleX;
  const b = sine * scaleX;
  const c = -sine * scaleY;
  const d = cosine * scaleY;

  const transform = {
    a,
    b,
    c,
    d,
    e: translateX + origin.x - a * origin.x - c * origin.y,
    f: translateY + origin.y - b * origin.x - d * origin.y,
  };
  assertFiniteValues([transform.a, transform.b, transform.c, transform.d, transform.e, transform.f]);
  return transform;
}

export function composeAffineTransforms(
  outer: AffineTransform,
  inner: AffineTransform
): AffineTransform {
  assertFiniteValues([outer.a, outer.b, outer.c, outer.d, outer.e, outer.f,
    inner.a, inner.b, inner.c, inner.d, inner.e, inner.f]);

  const result = {
    a: outer.a * inner.a + outer.c * inner.b,
    b: outer.b * inner.a + outer.d * inner.b,
    c: outer.a * inner.c + outer.c * inner.d,
    d: outer.b * inner.c + outer.d * inner.d,
    e: outer.a * inner.e + outer.c * inner.f + outer.e,
    f: outer.b * inner.e + outer.d * inner.f + outer.f,
  };
  assertFiniteValues([result.a, result.b, result.c, result.d, result.e, result.f]);
  return result;
}

export function transformPoint(point: TransformPoint, transform: AffineTransform): TransformPoint {
  assertFiniteValues([point.x, point.y, transform.a, transform.b, transform.c, transform.d,
    transform.e, transform.f]);

  const result = {
    x: transform.a * point.x + transform.c * point.y + transform.e,
    y: transform.b * point.x + transform.d * point.y + transform.f,
  };
  assertFiniteValues([result.x, result.y]);
  return result;
}

export function invertAffineTransform(transform: AffineTransform): AffineTransform {
  assertFiniteValues([transform.a, transform.b, transform.c, transform.d, transform.e, transform.f]);
  const determinant = transform.a * transform.d - transform.b * transform.c;
  if (!Number.isFinite(determinant) || determinant === 0) {
    throw new RangeError('Cannot invert a singular affine transform');
  }

  const inverseDeterminant = 1 / determinant;
  const a = transform.d * inverseDeterminant;
  const b = -transform.b * inverseDeterminant;
  const c = -transform.c * inverseDeterminant;
  const d = transform.a * inverseDeterminant;

  const inverse = {
    a,
    b,
    c,
    d,
    e: -(a * transform.e + c * transform.f),
    f: -(b * transform.e + d * transform.f),
  };
  assertFiniteValues([inverse.a, inverse.b, inverse.c, inverse.d, inverse.e, inverse.f]);
  return inverse;
}

export function transformBounds(
  bounds: TransformBounds,
  transform: AffineTransform
): TransformBounds {
  assertFiniteValues([bounds.x, bounds.y, bounds.width, bounds.height]);
  if (bounds.width < 0 || bounds.height < 0) {
    throw new RangeError('Transform bounds width and height must be non-negative');
  }

  const corners = [
    transformPoint({ x: bounds.x, y: bounds.y }, transform),
    transformPoint({ x: bounds.x + bounds.width, y: bounds.y }, transform),
    transformPoint({ x: bounds.x + bounds.width, y: bounds.y + bounds.height }, transform),
    transformPoint({ x: bounds.x, y: bounds.y + bounds.height }, transform),
  ];
  const minX = Math.min(...corners.map(({ x }) => x));
  const minY = Math.min(...corners.map(({ y }) => y));
  const maxX = Math.max(...corners.map(({ x }) => x));
  const maxY = Math.max(...corners.map(({ y }) => y));

  const result = { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  assertFiniteValues([result.x, result.y, result.width, result.height]);
  return result;
}

export function rotatePoint(
  point: TransformPoint,
  origin: TransformPoint,
  angleDegrees: number
): TransformPoint {
  return transformPoint(point, createAffineTransform({ rotationDegrees: angleDegrees, origin }));
}

function assertFiniteValues(values: number[]): void {
  if (!values.every(Number.isFinite)) {
    throw new RangeError('Affine transform values must be finite numbers');
  }
}
