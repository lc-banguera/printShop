import { createAlphaData, type AlphaData } from '../processing/image-processing';

export type PathAnchorType = 'CORNER' | 'SMOOTH';
export type PathSegmentType = 'LINE' | 'CUBIC_BEZIER';

export interface PathPoint {
  x: number;
  y: number;
}

export interface PathAnchor {
  id: string;
  x: number;
  y: number;
  type: PathAnchorType;
  handleIn?: PathPoint;
  handleOut?: PathPoint;
}

export interface PathSegment {
  id: string;
  type: PathSegmentType;
  startAnchorId: string;
  endAnchorId: string;
}

export interface VectorPath {
  id: string;
  closed: boolean;
  anchors: readonly PathAnchor[];
  segments: readonly PathSegment[];
}

export interface PathRasterizationOptions {
  samplesPerAxis?: 1 | 2 | 4 | 8;
  flatness?: number;
}

function isFinitePoint(point: PathPoint): boolean {
  return Number.isFinite(point.x) && Number.isFinite(point.y);
}

function validatePath(path: VectorPath): void {
  if (!path.id.trim()) throw new TypeError('Path id must not be empty.');
  if (!Array.isArray(path.anchors) || !Array.isArray(path.segments)) {
    throw new TypeError('Path anchors and segments must be arrays.');
  }
  if (path.anchors.length < (path.closed ? 3 : 2)) {
    throw new RangeError('Path has too few anchors.');
  }
  const expectedSegments = path.closed ? path.anchors.length : path.anchors.length - 1;
  if (path.segments.length !== expectedSegments) {
    throw new RangeError('Path segment count does not match its anchors.');
  }

  const anchorIds = new Set<string>();
  for (const anchor of path.anchors) {
    if (!anchor.id.trim() || anchorIds.has(anchor.id)) {
      throw new TypeError('Path anchor ids must be non-empty and unique.');
    }
    if (!isFinitePoint(anchor)) throw new TypeError('Path anchors must have finite coordinates.');
    if (anchor.type !== 'CORNER' && anchor.type !== 'SMOOTH') {
      throw new TypeError(`Unsupported path anchor type: ${String(anchor.type)}`);
    }
    if (
      (anchor.handleIn && !isFinitePoint(anchor.handleIn)) ||
      (anchor.handleOut && !isFinitePoint(anchor.handleOut))
    ) {
      throw new TypeError('Path handles must have finite coordinates.');
    }
    anchorIds.add(anchor.id);
  }

  for (let index = 0; index < path.segments.length; index += 1) {
    const segment = path.segments[index];
    const start = path.anchors[index];
    const end = path.anchors[(index + 1) % path.anchors.length];
    if (
      !segment.id.trim() ||
      segment.startAnchorId !== start.id ||
      segment.endAnchorId !== end.id
    ) {
      throw new TypeError('Path segments must connect consecutive anchors in order.');
    }
    if (segment.type !== 'LINE' && segment.type !== 'CUBIC_BEZIER') {
      throw new TypeError(`Unsupported path segment type: ${String(segment.type)}`);
    }
  }
}

function pointLineDistance(point: PathPoint, start: PathPoint, end: PathPoint): number {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy);
  if (length === 0) return Math.hypot(point.x - start.x, point.y - start.y);
  return Math.abs(dy * point.x - dx * point.y + end.x * start.y - end.y * start.x) / length;
}

function midpoint(left: PathPoint, right: PathPoint): PathPoint {
  return { x: (left.x + right.x) / 2, y: (left.y + right.y) / 2 };
}

function appendBezier(
  output: PathPoint[],
  p0: PathPoint,
  p1: PathPoint,
  p2: PathPoint,
  p3: PathPoint,
  flatness: number,
  depth: number,
): void {
  if (
    depth >= 12 ||
    Math.max(pointLineDistance(p1, p0, p3), pointLineDistance(p2, p0, p3)) <= flatness
  ) {
    output.push(p3);
    return;
  }

  const p01 = midpoint(p0, p1);
  const p12 = midpoint(p1, p2);
  const p23 = midpoint(p2, p3);
  const p012 = midpoint(p01, p12);
  const p123 = midpoint(p12, p23);
  const split = midpoint(p012, p123);
  appendBezier(output, p0, p01, p012, split, flatness, depth + 1);
  appendBezier(output, split, p123, p23, p3, flatness, depth + 1);
}

export function flattenPath(
  path: VectorPath,
  options: Pick<PathRasterizationOptions, 'flatness'> = {},
): readonly PathPoint[] {
  validatePath(path);
  const flatness = options.flatness ?? 0.25;
  if (!Number.isFinite(flatness) || flatness <= 0 || flatness > 16) {
    throw new RangeError('Path flatness must be greater than 0 and at most 16 pixels.');
  }

  const points: PathPoint[] = [{ x: path.anchors[0].x, y: path.anchors[0].y }];
  for (let index = 0; index < path.segments.length; index += 1) {
    const segment = path.segments[index];
    const start = path.anchors[index];
    const end = path.anchors[(index + 1) % path.anchors.length];
    const p0 = { x: start.x, y: start.y };
    const p3 = { x: end.x, y: end.y };
    if (segment.type === 'LINE') {
      points.push(p3);
    } else {
      appendBezier(
        points,
        p0,
        start.handleOut ?? p0,
        end.handleIn ?? p3,
        p3,
        flatness,
        0,
      );
    }
  }

  if (path.closed) points.pop();
  return points;
}

function countCoveredSamples(left: number, right: number, pixel: number, samples: number): number {
  const start = Math.max(0, Math.ceil((left - pixel) * samples - 0.5));
  const end = Math.min(samples, Math.ceil((right - pixel) * samples - 0.5));
  return Math.max(0, end - start);
}

export function rasterizePathSelection(
  path: VectorPath,
  width: number,
  height: number,
  options: PathRasterizationOptions = {},
): AlphaData {
  if (!path.closed) throw new TypeError('Only closed paths can create a selection mask.');
  if (!Number.isSafeInteger(width) || width <= 0 || !Number.isSafeInteger(height) || height <= 0) {
    throw new RangeError('Path mask dimensions must be positive safe integers.');
  }
  const samples = options.samplesPerAxis ?? 4;
  if (samples !== 1 && samples !== 2 && samples !== 4 && samples !== 8) {
    throw new RangeError('Path antialias samples per axis must be 1, 2, 4, or 8.');
  }

  const points = flattenPath(path, options);
  const coverage = new Uint8Array(width * height);
  const intersections: number[] = [];
  const sampleCount = samples * samples;
  const edgeCount = points.length;

  for (let y = 0; y < height; y += 1) {
    for (let sampleY = 0; sampleY < samples; sampleY += 1) {
      const scanY = y + (sampleY + 0.5) / samples;
      intersections.length = 0;
      for (let edgeIndex = 0; edgeIndex < edgeCount; edgeIndex += 1) {
        const start = points[edgeIndex];
        const end = points[(edgeIndex + 1) % edgeCount];
        if ((start.y <= scanY && end.y > scanY) || (end.y <= scanY && start.y > scanY)) {
          intersections.push(
            start.x + ((scanY - start.y) * (end.x - start.x)) / (end.y - start.y),
          );
        }
      }
      intersections.sort((left, right) => left - right);

      for (let intersection = 0; intersection + 1 < intersections.length; intersection += 2) {
        const left = Math.max(0, intersections[intersection]);
        const right = Math.min(width, intersections[intersection + 1]);
        if (right <= left) continue;
        const firstPixel = Math.max(0, Math.floor(left));
        const lastPixel = Math.min(width - 1, Math.ceil(right) - 1);
        for (let x = firstPixel; x <= lastPixel; x += 1) {
          coverage[y * width + x] += countCoveredSamples(left, right, x, samples);
        }
      }
    }
  }

  for (let index = 0; index < coverage.length; index += 1) {
    coverage[index] = Math.round((coverage[index] * 255) / sampleCount);
  }
  return createAlphaData(width, height, coverage);
}
