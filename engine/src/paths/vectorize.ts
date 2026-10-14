import { assertImageBuffer, type ImageBuffer } from '../processing/image-buffer';
import type { PathAnchor, PathPoint, PathSegment, VectorPath } from './path-engine';

export interface VectorizeOptions {
  /** Maximum number of colors or threshold mode */
  colors?: number; // e.g. 2 to 16
  /** Tolerance / threshold (0 to 255) for binarization or color grouping */
  threshold?: number;
  /** Contour curve simplification epsilon in pixels (Ramer-Douglas-Peucker) */
  simplification?: number; // default 1.5
  /** Minimum path length in pixels to keep */
  minPathLength?: number;
  /** Preserve the source palette instead of tracing a luminance mask. */
  colormode?: 'color' | 'binary';
  /** Curve mode is accepted by the shared contract; local tracing emits polygons. */
  mode?: 'spline' | 'polygon' | 'none';
}

export interface VectorizeResult {
  status: 'succeeded' | 'no-paths';
  svgString: string;
  paths: VectorPath[];
  colors: string[];
}

function getLuminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

interface PaletteEntry {
  r: number;
  g: number;
  b: number;
  count: number;
}

function colorKey(r: number, g: number, b: number): number {
  const qr = Math.min(7, Math.floor(r / 32));
  const qg = Math.min(7, Math.floor(g / 32));
  const qb = Math.min(7, Math.floor(b / 32));
  return (qr << 6) | (qg << 3) | qb;
}

function toHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((channel) => Math.max(0, Math.min(255, Math.round(channel)))
    .toString(16).padStart(2, '0')).join('')}`;
}

function nearestPaletteEntry(
  r: number,
  g: number,
  b: number,
  palette: readonly PaletteEntry[],
): number {
  let best = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (let index = 0; index < palette.length; index += 1) {
    const entry = palette[index];
    const distance = (r - entry.r) ** 2 + (g - entry.g) ** 2 + (b - entry.b) ** 2;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = index;
    }
  }
  return best;
}

/**
 * Traces contours of connected components using marching squares / Moore-Neighbor tracing
 */
export function traceContours(
  binaryGrid: Uint8Array,
  width: number,
  height: number,
  minPathLength = 4,
): PathPoint[][] {
  const visited = new Uint8Array(width * height);
  const contours: PathPoint[][] = [];

  // Moore neighborhood 8-directional offsets (dx, dy)
  const directions: [number, number][] = [
    [1, 0], [1, 1], [0, 1], [-1, 1],
    [-1, 0], [-1, -1], [0, -1], [1, -1],
  ];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (binaryGrid[idx] === 1 && !visited[idx]) {
        // Check if on boundary (at least one 4-neighbor is 0)
        const isBoundary =
          x === 0 ||
          x === width - 1 ||
          y === 0 ||
          y === height - 1 ||
          binaryGrid[idx - 1] === 0 ||
          binaryGrid[idx + 1] === 0 ||
          binaryGrid[idx - width] === 0 ||
          binaryGrid[idx + width] === 0;

        if (!isBoundary) continue;

        // Trace boundary contour
        const contour: PathPoint[] = [];
        let currX = x;
        let currY = y;
        let dir = 0;
        let startX = x;
        let startY = y;

        const maxSteps = width * height;
        let steps = 0;

        while (steps < maxSteps) {
          contour.push({ x: currX, y: currY });
          visited[currY * width + currX] = 1;
          steps++;

          // Scan clockwise starting from (dir + 5) % 8
          let foundNext = false;
          const searchStart = (dir + 5) % 8;
          for (let i = 0; i < 8; i++) {
            const checkDir = (searchStart + i) % 8;
            const nx = currX + directions[checkDir][0];
            const ny = currY + directions[checkDir][1];
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              if (binaryGrid[ny * width + nx] === 1) {
                currX = nx;
                currY = ny;
                dir = checkDir;
                foundNext = true;
                break;
              }
            }
          }

          if (!foundNext || (currX === startX && currY === startY)) {
            break;
          }
        }

        if (contour.length >= minPathLength) {
          contours.push(contour);
        }
      }
    }
  }

  return contours;
}

/**
 * Ramer-Douglas-Peucker path simplification
 */
export function simplifyPathRDP(points: PathPoint[], epsilon: number): PathPoint[] {
  if (points.length <= 2) return points;

  let maxDist = 0;
  let index = 0;
  const start = points[0];
  const end = points[points.length - 1];

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lineLen = Math.hypot(dx, dy);

  for (let i = 1; i < points.length - 1; i++) {
    const pt = points[i];
    let dist = 0;
    if (lineLen === 0) {
      dist = Math.hypot(pt.x - start.x, pt.y - start.y);
    } else {
      dist = Math.abs(dy * pt.x - dx * pt.y + end.x * start.y - end.y * start.x) / lineLen;
    }
    if (dist > maxDist) {
      maxDist = dist;
      index = i;
    }
  }

  if (maxDist > epsilon) {
    const left = simplifyPathRDP(points.slice(0, index + 1), epsilon);
    const right = simplifyPathRDP(points.slice(index), epsilon);
    return [...left.slice(0, left.length - 1), ...right];
  }

  return [start, end];
}

/**
 * Vectorizes a raster ImageBuffer into VectorPath representations and SVG markup
 */
export function vectorizeImage(
  source: ImageBuffer,
  options: VectorizeOptions = {},
): VectorizeResult {
  assertImageBuffer(source);
  const threshold = options.threshold ?? 128;
  const epsilon = options.simplification ?? 1.5;
  const minLength = options.minPathLength ?? 4;
  const colorMode = options.colormode ?? ((options.colors ?? 2) > 2 ? 'color' : 'binary');

  const w = source.width;
  const h = source.height;
  const maxColors = Math.max(2, Math.min(64, Math.round(options.colors ?? 8)));
  const paletteByKey = new Map<number, PaletteEntry>();
  if (colorMode === 'color') {
    for (let pixel = 0; pixel < w * h; pixel += 1) {
      const index = pixel * 4;
      if (source.data[index + 3] < 64) continue;
      const key = colorKey(source.data[index], source.data[index + 1], source.data[index + 2]);
      const existing = paletteByKey.get(key) ?? { r: 0, g: 0, b: 0, count: 0 };
      existing.r += source.data[index];
      existing.g += source.data[index + 1];
      existing.b += source.data[index + 2];
      existing.count += 1;
      paletteByKey.set(key, existing);
    }
  }

  const palette: PaletteEntry[] = colorMode === 'binary'
    ? [{ r: 0, g: 0, b: 0, count: 1 }]
    : [...paletteByKey.values()]
      .sort((left, right) => right.count - left.count)
      .slice(0, maxColors)
      .map((entry) => ({
        r: entry.r / entry.count,
        g: entry.g / entry.count,
        b: entry.b / entry.count,
        count: entry.count,
      }));

  if (palette.length === 0) {
    return {
      status: 'no-paths',
      svgString: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"></svg>`,
      paths: [],
      colors: [],
    };
  }

  const vectorPaths: VectorPath[] = [];
  const svgPaths: string[] = [];
  let pathIndex = 0;
  const traceColor = (binary: Uint8Array, color: string) => {
    traceContours(binary, w, h, minLength).forEach((contour) => {
      const simplified = simplifyPathRDP(contour, epsilon);
      if (simplified.length < 3) return;

      const pathId = `vec-path-${pathIndex++}`;
      const anchors: PathAnchor[] = simplified.map((pt, anchorIdx) => ({
        id: `${pathId}-a-${anchorIdx}`,
        x: pt.x,
        y: pt.y,
        type: 'CORNER',
      }));
      const segments: PathSegment[] = anchors.map((anchor, index) => ({
        id: `${pathId}-s-${index}`,
        type: 'LINE',
        startAnchorId: anchor.id,
        endAnchorId: anchors[(index + 1) % anchors.length].id,
      }));
      vectorPaths.push({ id: pathId, closed: true, anchors, segments, fill: color });

      const d = simplified
        .map((pt, index) => `${index === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
        .join(' ') + ' Z';
      svgPaths.push(`<path d="${d}" fill="${color}" fill-rule="evenodd" />`);
    });
  };

  if (colorMode === 'binary') {
    const binary = new Uint8Array(w * h);
    for (let pixel = 0; pixel < w * h; pixel += 1) {
      const index = pixel * 4;
      binary[pixel] = source.data[index + 3] >= 64 &&
        getLuminance(source.data[index], source.data[index + 1], source.data[index + 2]) <= threshold
        ? 1
        : 0;
    }
    traceColor(binary, '#000000');
  } else {
    const pixelLabels = new Uint8Array(w * h);
    for (let pixel = 0; pixel < w * h; pixel += 1) {
      const index = pixel * 4;
      if (source.data[index + 3] < 64) {
        pixelLabels[pixel] = 255;
        continue;
      }
      pixelLabels[pixel] = nearestPaletteEntry(
        source.data[index], source.data[index + 1], source.data[index + 2], palette,
      );
    }
    palette.forEach((entry, paletteIndex) => {
      const binary = new Uint8Array(w * h);
      for (let pixel = 0; pixel < pixelLabels.length; pixel += 1) {
        binary[pixel] = pixelLabels[pixel] === paletteIndex ? 1 : 0;
      }
      traceColor(binary, toHex(entry.r, entry.g, entry.b));
    });
  }

  const svgString = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  ${svgPaths.join('\n  ')}
</svg>`;

  return {
    status: vectorPaths.length > 0 ? 'succeeded' : 'no-paths',
    svgString,
    paths: vectorPaths,
    colors: [...new Set(vectorPaths.map((path) => path.fill).filter((fill): fill is string => Boolean(fill)))],
  };
}
