import { clampByte, createAlphaData, type AlphaData, type MaskCompositionMode } from './image-processing';

/**
 * image-buffer.ts
 * Portable RGBA image representation for the PrintShop engine.
 *
 * The engine must not depend on browser APIs (Canvas, Image, Blob, OffscreenCanvas).
 * This module provides a single immutable-ish buffer type that every raster
 * operation consumes and produces. Callers in the browser layer are responsible
 * for decoding/encoding between this representation and canvas pixels.
 */

export interface ImageBuffer {
  width: number;
  height: number;
  /** RGBA bytes, length = width * height * 4 */
  data: Uint8ClampedArray | Uint8Array;
}

export interface ImageRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function isImageBuffer(value: unknown): value is ImageBuffer {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  if (
    !Number.isSafeInteger(candidate.width) ||
    (candidate.width as number) <= 0 ||
    !Number.isSafeInteger(candidate.height) ||
    (candidate.height as number) <= 0
  ) {
    return false;
  }
  const data = candidate.data;
  if (!(data instanceof Uint8Array) && !(data instanceof Uint8ClampedArray)) return false;
  const expectedLength = (candidate.width as number) * (candidate.height as number) * 4;
  return Number.isSafeInteger(expectedLength) && data.length === expectedLength;
}

export function assertImageBuffer(value: unknown): asserts value is ImageBuffer {
  if (!isImageBuffer(value)) {
    throw new TypeError('Invalid ImageBuffer structure.');
  }
}

export function createImageBuffer(
  width: number,
  height: number,
  data?: Uint8Array | Uint8ClampedArray,
): ImageBuffer {
  if (!Number.isSafeInteger(width) || width <= 0) {
    throw new RangeError('Image width must be a positive safe integer.');
  }
  if (!Number.isSafeInteger(height) || height <= 0) {
    throw new RangeError('Image height must be a positive safe integer.');
  }
  const expectedLength = width * height * 4;
  if (!Number.isSafeInteger(expectedLength)) {
    throw new RangeError('Image dimensions exceed the maximum safe pixel count.');
  }
  const values = data ?? new Uint8ClampedArray(expectedLength);
  if (values.length !== expectedLength) {
    throw new RangeError('Image data length must equal width * height * 4.');
  }
  return { width, height, data: new Uint8ClampedArray(values) };
}

export function cloneImageBuffer(buffer: ImageBuffer): ImageBuffer {
  return createImageBuffer(buffer.width, buffer.height, buffer.data);
}

export function imageBufferPixelCount(buffer: ImageBuffer): number {
  return buffer.width * buffer.height;
}

export function getPixel(buffer: ImageBuffer, x: number, y: number): [number, number, number, number] {
  if (!Number.isSafeInteger(x) || !Number.isSafeInteger(y) ||
      x < 0 || y < 0 || x >= buffer.width || y >= buffer.height) {
    throw new RangeError(`Pixel (${x}, ${y}) is outside ImageBuffer bounds.`);
  }
  const idx = (y * buffer.width + x) * 4;
  return [buffer.data[idx], buffer.data[idx + 1], buffer.data[idx + 2], buffer.data[idx + 3]];
}

export function setPixel(
  buffer: ImageBuffer,
  x: number,
  y: number,
  r: number,
  g: number,
  b: number,
  a: number,
): void {
  if (!Number.isSafeInteger(x) || !Number.isSafeInteger(y) ||
      x < 0 || y < 0 || x >= buffer.width || y >= buffer.height) {
    throw new RangeError(`Pixel (${x}, ${y}) is outside ImageBuffer bounds.`);
  }
  const idx = (y * buffer.width + x) * 4;
  buffer.data[idx] = clampByte(r);
  buffer.data[idx + 1] = clampByte(g);
  buffer.data[idx + 2] = clampByte(b);
  buffer.data[idx + 3] = clampByte(a);
}

function assertRegion(buffer: ImageBuffer, region: ImageRegion): void {
  if (
    !Number.isSafeInteger(region.x) ||
    !Number.isSafeInteger(region.y) ||
    !Number.isSafeInteger(region.width) ||
    !Number.isSafeInteger(region.height) ||
    region.x < 0 ||
    region.y < 0 ||
    region.width <= 0 ||
    region.height <= 0 ||
    region.x + region.width > buffer.width ||
    region.y + region.height > buffer.height
  ) {
    throw new RangeError('Image region must be a positive integer rectangle within the buffer.');
  }
}

export function cloneImageRegion(buffer: ImageBuffer, region: ImageRegion): ImageBuffer {
  assertImageBuffer(buffer);
  assertRegion(buffer, region);
  const result = createImageBuffer(region.width, region.height);
  for (let row = 0; row < region.height; row += 1) {
    const sourceStart = ((region.y + row) * buffer.width + region.x) * 4;
    const targetStart = row * region.width * 4;
    result.data.set(buffer.data.subarray(sourceStart, sourceStart + region.width * 4), targetStart);
  }
  return result;
}

export function copyImageRegion(
  source: ImageBuffer,
  region: ImageRegion,
  target: ImageBuffer,
  targetX: number,
  targetY: number,
): void {
  assertImageBuffer(source);
  assertImageBuffer(target);
  assertRegion(source, region);
  if (
    !Number.isSafeInteger(targetX) ||
    !Number.isSafeInteger(targetY) ||
    targetX < 0 ||
    targetY < 0 ||
    targetX + region.width > target.width ||
    targetY + region.height > target.height
  ) {
    throw new RangeError('Image region destination must fit within the target buffer.');
  }

  const input = source.data.buffer === target.data.buffer ? cloneImageBuffer(source) : source;
  for (let row = 0; row < region.height; row += 1) {
    const sourceStart = ((region.y + row) * input.width + region.x) * 4;
    const targetStart = ((targetY + row) * target.width + targetX) * 4;
    target.data.set(input.data.subarray(sourceStart, sourceStart + region.width * 4), targetStart);
  }
}

export function sampleLuminance(buffer: ImageBuffer, x: number, y: number): number {
  const [r, g, b] = getPixel(buffer, x, y);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export function hasTransparency(buffer: ImageBuffer): boolean {
  const data = buffer.data;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 250) return true;
  }
  return false;
}

export interface AlphaSummary {
  transparentPixels: number;
  semitransparentPixels: number;
  opaquePixels: number;
  minimum: number;
  maximum: number;
}

export function analyzeAlpha(buffer: ImageBuffer): AlphaSummary {
  assertImageBuffer(buffer);
  let transparentPixels = 0;
  let semitransparentPixels = 0;
  let opaquePixels = 0;
  let minimum = 255;
  let maximum = 0;

  for (let index = 3; index < buffer.data.length; index += 4) {
    const alpha = buffer.data[index];
    minimum = Math.min(minimum, alpha);
    maximum = Math.max(maximum, alpha);
    if (alpha === 0) transparentPixels += 1;
    else if (alpha === 255) opaquePixels += 1;
    else semitransparentPixels += 1;
  }
  return { transparentPixels, semitransparentPixels, opaquePixels, minimum, maximum };
}

export function extractAlpha(buffer: ImageBuffer): AlphaData {
  assertImageBuffer(buffer);
  const values = new Uint8Array(buffer.width * buffer.height);
  for (let pixel = 0; pixel < values.length; pixel += 1) {
    values[pixel] = buffer.data[pixel * 4 + 3];
  }
  return createAlphaData(buffer.width, buffer.height, values);
}

export function applyAlphaDataToImage(
  source: ImageBuffer,
  alpha: AlphaData,
  composition: MaskCompositionMode = 'multiply',
): ImageBuffer {
  assertImageBuffer(source);
  if (alpha.width !== source.width || alpha.height !== source.height ||
      alpha.values.length !== source.width * source.height) {
    throw new RangeError('Alpha dimensions must match the source image.');
  }
  const result = cloneImageBuffer(source);
  for (let pixel = 0; pixel < alpha.values.length; pixel += 1) {
    const sourceAlpha = source.data[pixel * 4 + 3];
    const maskAlpha = alpha.values[pixel];
    switch (composition) {
      case 'screen':
        result.data[pixel * 4 + 3] = clampByte(255 - ((255 - sourceAlpha) * (255 - maskAlpha)) / 255);
        break;
      case 'min':
        result.data[pixel * 4 + 3] = Math.min(sourceAlpha, maskAlpha);
        break;
      case 'max':
        result.data[pixel * 4 + 3] = Math.max(sourceAlpha, maskAlpha);
        break;
      case 'overwrite':
        result.data[pixel * 4 + 3] = maskAlpha;
        break;
      case 'multiply':
      default:
        result.data[pixel * 4 + 3] = clampByte((sourceAlpha * maskAlpha) / 255);
        break;
    }
  }
  return result;
}

export function resizeImageBuffer(
  buffer: ImageBuffer,
  width: number,
  height: number,
): ImageBuffer {
  if (!Number.isSafeInteger(width) || width <= 0 || !Number.isSafeInteger(height) || height <= 0) {
    throw new RangeError('Resize dimensions must be positive safe integers.');
  }
  const out = createImageBuffer(width, height);
  const sx = buffer.width / width;
  const sy = buffer.height / height;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcX = Math.min(buffer.width - 1, Math.floor(x * sx));
      const srcY = Math.min(buffer.height - 1, Math.floor(y * sy));
      const srcIdx = (srcY * buffer.width + srcX) * 4;
      const dstIdx = (y * width + x) * 4;
      out.data[dstIdx] = buffer.data[srcIdx];
      out.data[dstIdx + 1] = buffer.data[srcIdx + 1];
      out.data[dstIdx + 2] = buffer.data[srcIdx + 2];
      out.data[dstIdx + 3] = buffer.data[srcIdx + 3];
    }
  }
  return out;
}
