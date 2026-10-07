import { createAlphaData, createMask, type ColorRegion } from './image-processing';
import { assertImageBuffer, type ImageBuffer } from './image-buffer';

export interface ColorAnalysisOptions {
  tolerance?: number;
  minimumAlpha?: number;
  maxColors?: number;
}

export interface ColorAnalysisResult {
  dominantColors: readonly { color: string; pixelCount: number }[];
  regions: readonly ColorRegion[];
  analyzedPixelCount: number;
}

interface ColorCluster {
  red: number;
  green: number;
  blue: number;
  pixelCount: number;
  pixels: number[];
  bucketKey: string;
}

function colorDistance(red: number, green: number, blue: number, cluster: ColorCluster): number {
  const dr = red - cluster.red / cluster.pixelCount;
  const dg = green - cluster.green / cluster.pixelCount;
  const db = blue - cluster.blue / cluster.pixelCount;
  return Math.sqrt(0.3 * dr * dr + 0.59 * dg * dg + 0.11 * db * db);
}

function bucketKey(red: number, green: number, blue: number, size: number): string {
  return `${Math.floor(red / size)},${Math.floor(green / size)},${Math.floor(blue / size)}`;
}

function toHex(red: number, green: number, blue: number): string {
  return `#${[red, green, blue].map((value) => Math.round(value).toString(16).padStart(2, '0')).join('')}`;
}

export function analyzeColors(
  image: ImageBuffer,
  assetId: string,
  options: ColorAnalysisOptions = {},
): ColorAnalysisResult {
  assertImageBuffer(image);
  if (!assetId.trim()) throw new TypeError('Color-region source asset id must not be empty.');
  const tolerance = options.tolerance ?? 0;
  const minimumAlpha = options.minimumAlpha ?? 1;
  const maxColors = options.maxColors ?? 32;
  if (!Number.isFinite(tolerance) || tolerance < 0 || tolerance > 441) {
    throw new RangeError('Color tolerance must be between 0 and 441.');
  }
  if (!Number.isInteger(minimumAlpha) || minimumAlpha < 0 || minimumAlpha > 255) {
    throw new RangeError('Minimum alpha must be an integer between 0 and 255.');
  }
  if (!Number.isInteger(maxColors) || maxColors < 1) {
    throw new RangeError('Maximum color count must be a positive integer.');
  }

  const clusters: ColorCluster[] = [];
  const exactColors = new Map<string, ColorCluster>();
  const spatialBuckets = new Map<string, ColorCluster[]>();
  const bucketSize = Math.max(1, tolerance);
  let analyzedPixelCount = 0;
  for (let pixel = 0; pixel < image.width * image.height; pixel += 1) {
    const index = pixel * 4;
    if (image.data[index + 3] < minimumAlpha) continue;
    analyzedPixelCount += 1;
    const red = image.data[index];
    const green = image.data[index + 1];
    const blue = image.data[index + 2];
    let closest: ColorCluster | undefined;
    let closestDistance = Number.POSITIVE_INFINITY;
    if (tolerance === 0) {
      closest = exactColors.get(`${red},${green},${blue}`);
    } else {
      const [bucketRed, bucketGreen, bucketBlue] = bucketKey(red, green, blue, bucketSize).split(',').map(Number);
      for (let redOffset = -1; redOffset <= 1; redOffset += 1) {
        for (let greenOffset = -1; greenOffset <= 1; greenOffset += 1) {
          for (let blueOffset = -1; blueOffset <= 1; blueOffset += 1) {
            const key = `${bucketRed + redOffset},${bucketGreen + greenOffset},${bucketBlue + blueOffset}`;
            for (const cluster of spatialBuckets.get(key) ?? []) {
              const distance = colorDistance(red, green, blue, cluster);
              if (distance <= tolerance && distance < closestDistance) {
                closest = cluster;
                closestDistance = distance;
              }
            }
          }
        }
      }
    }
    if (closest) {
      if (tolerance > 0) {
        const previous = spatialBuckets.get(closest.bucketKey);
        const previousIndex = previous?.indexOf(closest) ?? -1;
        if (previous && previousIndex >= 0) previous.splice(previousIndex, 1);
      }
      closest.red += red;
      closest.green += green;
      closest.blue += blue;
      closest.pixelCount += 1;
      closest.pixels.push(pixel);
      if (tolerance > 0) {
        closest.bucketKey = bucketKey(
          closest.red / closest.pixelCount,
          closest.green / closest.pixelCount,
          closest.blue / closest.pixelCount,
          bucketSize,
        );
        const bucket = spatialBuckets.get(closest.bucketKey) ?? [];
        bucket.push(closest);
        spatialBuckets.set(closest.bucketKey, bucket);
      }
    } else {
      const key = bucketKey(red, green, blue, bucketSize);
      const cluster = { red, green, blue, pixelCount: 1, pixels: [pixel], bucketKey: key };
      clusters.push(cluster);
      if (tolerance === 0) exactColors.set(`${red},${green},${blue}`, cluster);
      else {
        const bucket = spatialBuckets.get(key) ?? [];
        bucket.push(cluster);
        spatialBuckets.set(key, bucket);
      }
    }
  }

  clusters.sort((left, right) => right.pixelCount - left.pixelCount || left.pixels[0] - right.pixels[0]);
  const selected = clusters.slice(0, maxColors);
  const regions = selected.map((cluster, regionIndex) => {
    const average = [
      cluster.red / cluster.pixelCount,
      cluster.green / cluster.pixelCount,
      cluster.blue / cluster.pixelCount,
    ] as const;
    const values = new Uint8Array(image.width * image.height);
    for (const pixel of cluster.pixels) values[pixel] = 255;
    const alpha = createAlphaData(image.width, image.height, values);
    const color = toHex(...average);
    return {
      id: `${assetId}:color:${regionIndex}`,
      color,
      pixelCount: cluster.pixelCount,
      mask: createMask(`${assetId}:mask:${regionIndex}`, assetId, alpha),
    };
  });

  return {
    dominantColors: regions.map(({ color, pixelCount }) => ({ color, pixelCount })),
    regions,
    analyzedPixelCount,
  };
}
