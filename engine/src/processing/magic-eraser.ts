import {
  applyAlphaDataToImage,
  extractAlpha,
  type ImageBuffer,
} from "./image-buffer";
import {
  applyMaskToAlpha,
  createAlphaData,
  type AlphaData,
} from "./image-processing";

export interface ConnectedRegionOptions {
  x: number;
  y: number;
  tolerance: number;
  connectivity?: 4 | 8;
  alphaTolerance?: number;
}

export interface SimilarColorSelectionOptions {
  x: number;
  y: number;
  tolerance: number;
  alphaTolerance?: number;
}

export function createSimilarColorMask(
  source: ImageBuffer,
  options: SimilarColorSelectionOptions,
): AlphaData {
  const { width, height, data } = source;
  if (
    !Number.isInteger(options.x) ||
    !Number.isInteger(options.y) ||
    options.x < 0 ||
    options.y < 0 ||
    options.x >= width ||
    options.y >= height
  ) {
    throw new RangeError("The selected seed must be inside the image.");
  }
  if (!Number.isFinite(options.tolerance) || options.tolerance < 0 || options.tolerance > 441) {
    throw new RangeError("Color tolerance must be between 0 and 441.");
  }
  const alphaTolerance = options.alphaTolerance ?? Math.min(255, options.tolerance);
  if (!Number.isFinite(alphaTolerance) || alphaTolerance < 0 || alphaTolerance > 255) {
    throw new RangeError("Alpha tolerance must be between 0 and 255.");
  }

  const seedOffset = (options.y * width + options.x) * 4;
  const seedAlpha = data[seedOffset + 3];
  const mask = new Uint8Array(width * height);
  if (seedAlpha === 0) return createAlphaData(width, height, mask);

  const seedRed = data[seedOffset];
  const seedGreen = data[seedOffset + 1];
  const seedBlue = data[seedOffset + 2];
  const maxDistanceSquared = options.tolerance * options.tolerance;
  for (let pixel = 0; pixel < mask.length; pixel += 1) {
    const offset = pixel * 4;
    const alpha = data[offset + 3];
    if (alpha === 0 || Math.abs(alpha - seedAlpha) > alphaTolerance) continue;
    const red = data[offset] - seedRed;
    const green = data[offset + 1] - seedGreen;
    const blue = data[offset + 2] - seedBlue;
    if (red * red + green * green + blue * blue <= maxDistanceSquared) {
      mask[pixel] = 255;
    }
  }
  return createAlphaData(width, height, mask);
}

export function createConnectedColorMask(
  source: ImageBuffer,
  options: ConnectedRegionOptions,
): AlphaData {
  const { width, height, data } = source;
  if (
    !Number.isInteger(options.x) ||
    !Number.isInteger(options.y) ||
    options.x < 0 ||
    options.y < 0 ||
    options.x >= width ||
    options.y >= height
  ) {
    throw new RangeError("The selected seed must be inside the image.");
  }
  if (!Number.isFinite(options.tolerance) || options.tolerance < 0 || options.tolerance > 441) {
    throw new RangeError("Color tolerance must be between 0 and 441.");
  }
  const alphaTolerance = options.alphaTolerance ?? Math.min(255, options.tolerance);
  if (!Number.isFinite(alphaTolerance) || alphaTolerance < 0 || alphaTolerance > 255) {
    throw new RangeError("Alpha tolerance must be between 0 and 255.");
  }
  const connectivity = options.connectivity ?? 8;
  if (connectivity !== 4 && connectivity !== 8) {
    throw new RangeError("Mask connectivity must be 4 or 8.");
  }

  const pixelCount = width * height;
  const seedIndex = options.y * width + options.x;
  const seedOffset = seedIndex * 4;
  const seedRed = data[seedOffset];
  const seedGreen = data[seedOffset + 1];
  const seedBlue = data[seedOffset + 2];
  const seedAlpha = data[seedOffset + 3];
  const maxDistanceSquared = options.tolerance * options.tolerance;
  const mask = new Uint8Array(pixelCount);
  if (data[seedOffset + 3] === 0) {
    return createAlphaData(width, height, mask);
  }

  const queue = new Int32Array(pixelCount);
  let readIndex = 0;
  let writeIndex = 0;
  queue[writeIndex++] = seedIndex;
  mask[seedIndex] = 255;
  const neighbors =
    connectivity === 8
      ? [-width - 1, -width, -width + 1, -1, 1, width - 1, width, width + 1]
      : [-width, -1, 1, width];

  while (readIndex < writeIndex) {
    const index = queue[readIndex++];
    const x = index % width;
    for (const offset of neighbors) {
      const candidate = index + offset;
      if (candidate < 0 || candidate >= pixelCount || mask[candidate] !== 0) continue;
      const candidateX = candidate % width;
      if (Math.abs(candidateX - x) > 1) continue;
      const colorOffset = candidate * 4;
      const candidateAlpha = data[colorOffset + 3];
      if (
        candidateAlpha === 0 ||
        Math.abs(candidateAlpha - seedAlpha) > alphaTolerance
      ) {
        continue;
      }
      const red = data[colorOffset] - seedRed;
      const green = data[colorOffset + 1] - seedGreen;
      const blue = data[colorOffset + 2] - seedBlue;
      if (red * red + green * green + blue * blue > maxDistanceSquared) continue;
      mask[candidate] = 255;
      queue[writeIndex++] = candidate;
    }
  }

  return createAlphaData(width, height, mask);
}

export function eraseWithAlphaMask(
  source: ImageBuffer,
  eraseMask: AlphaData,
): ImageBuffer {
  if (source.width !== eraseMask.width || source.height !== eraseMask.height) {
    throw new RangeError("Image and eraser mask dimensions must match.");
  }
  const keepAlpha = new Uint8Array(eraseMask.values.length);
  for (let index = 0; index < keepAlpha.length; index += 1) {
    keepAlpha[index] = 255 - eraseMask.values[index];
  }
  const alpha = applyMaskToAlpha(extractAlpha(source), {
    width: eraseMask.width,
    height: eraseMask.height,
    values: keepAlpha,
  });
  return applyAlphaDataToImage(source, alpha);
}
