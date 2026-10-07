import { assertImageBuffer, type ImageBuffer } from './image-buffer';
import { createImageBuffer } from './image-buffer';

export type RasterExportFormat = 'png' | 'jpeg';

export interface RasterExportOptions {
  format: RasterExportFormat;
  quality?: number;
  dpi?: number;
  metadata?: Readonly<Record<string, string>>;
  jpegBackground?: string;
}

export interface JpegEncoder {
  encode(image: ImageBuffer, quality: number, metadata?: Readonly<Record<string, string>>): Uint8Array;
}

export type RasterExportResult =
  | {
      status: 'succeeded';
      format: RasterExportFormat;
      mediaType: 'image/png' | 'image/jpeg';
      width: number;
      height: number;
      bytes: Uint8Array;
      dpi?: number;
      metadata: Readonly<Record<string, string>>;
    }
  | {
      status: 'not-configured';
      code: 'NOT_CONFIGURED';
      message: string;
    };

const PNG_SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

function writeUint32(target: Uint8Array, offset: number, value: number): void {
  target[offset] = (value >>> 24) & 255;
  target[offset + 1] = (value >>> 16) & 255;
  target[offset + 2] = (value >>> 8) & 255;
  target[offset + 3] = value & 255;
}

function concat(parts: readonly Uint8Array[]): Uint8Array {
  const length = parts.reduce((total, part) => total + part.length, 0);
  const result = new Uint8Array(length);
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }
  return result;
}

function ascii(value: string): Uint8Array {
  return new Uint8Array(Array.from(value, (character) => character.charCodeAt(0) & 255));
}

function isLatin1(value: string): boolean {
  return Array.from(value).every((character) => character.charCodeAt(0) <= 255);
}

function parseMatte(value: string): [number, number, number] {
  const hex = value.replace(/^#/, '');
  const normalized = hex.length === 3 ? hex.split('').map((item) => item + item).join('') : hex;
  if (!/^[\da-f]{6}$/i.test(normalized)) throw new TypeError(`Invalid JPEG matte color: ${value}`);
  const packed = Number.parseInt(normalized, 16);
  return [(packed >> 16) & 255, (packed >> 8) & 255, packed & 255];
}

function flattenAlpha(image: ImageBuffer, matte: readonly [number, number, number]): ImageBuffer {
  const output = createImageBuffer(image.width, image.height, image.data);
  for (let index = 0; index < output.data.length; index += 4) {
    const alpha = output.data[index + 3] / 255;
    for (let channel = 0; channel < 3; channel += 1) {
      output.data[index + channel] = Math.round(
        output.data[index + channel] * alpha + matte[channel] * (1 - alpha),
      );
    }
    output.data[index + 3] = 255;
  }
  return output;
}

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Uint8Array): Uint8Array {
  const typeBytes = ascii(type);
  const content = concat([typeBytes, data]);
  const result = new Uint8Array(data.length + 12);
  writeUint32(result, 0, data.length);
  result.set(content, 4);
  writeUint32(result, result.length - 4, crc32(content));
  return result;
}

function adler32(data: Uint8Array): number {
  let a = 1;
  let b = 0;
  for (const value of data) {
    a = (a + value) % 65521;
    b = (b + a) % 65521;
  }
  return ((b << 16) | a) >>> 0;
}

function zlibStore(data: Uint8Array): Uint8Array {
  const blocks: Uint8Array[] = [new Uint8Array([0x78, 0x01])];
  for (let offset = 0; offset < data.length;) {
    const length = Math.min(65535, data.length - offset);
    const final = offset + length === data.length;
    const block = new Uint8Array(length + 5);
    block[0] = final ? 1 : 0;
    block[1] = length & 255;
    block[2] = (length >>> 8) & 255;
    const invertedLength = (~length) & 0xffff;
    block[3] = invertedLength & 255;
    block[4] = (invertedLength >>> 8) & 255;
    block.set(data.subarray(offset, offset + length), 5);
    blocks.push(block);
    offset += length;
  }
  const checksum = new Uint8Array(4);
  writeUint32(checksum, 0, adler32(data));
  blocks.push(checksum);
  return concat(blocks);
}

function encodePng(image: ImageBuffer, dpi?: number, metadata: Readonly<Record<string, string>> = {}): Uint8Array {
  const scanlines = new Uint8Array((image.width * 4 + 1) * image.height);
  for (let y = 0; y < image.height; y += 1) {
    const destination = y * (image.width * 4 + 1);
    scanlines[destination] = 0;
    scanlines.set(image.data.subarray(y * image.width * 4, (y + 1) * image.width * 4), destination + 1);
  }

  const header = new Uint8Array(13);
  writeUint32(header, 0, image.width);
  writeUint32(header, 4, image.height);
  header[8] = 8;
  header[9] = 6;
  const chunks: Uint8Array[] = [PNG_SIGNATURE, pngChunk('IHDR', header)];
  if (dpi !== undefined) {
    const pixelsPerMeter = Math.round(dpi / 0.0254);
    if (pixelsPerMeter > 0xffffffff) throw new RangeError('Export DPI exceeds the PNG pHYs field range.');
    const physical = new Uint8Array(9);
    writeUint32(physical, 0, pixelsPerMeter);
    writeUint32(physical, 4, pixelsPerMeter);
    physical[8] = 1;
    chunks.push(pngChunk('pHYs', physical));
  }
  for (const [key, value] of Object.entries(metadata)) {
    if (!key || key.length > 79 || !isLatin1(key) || !isLatin1(value) ||
        key.includes('\0') || value.includes('\0')) continue;
    chunks.push(pngChunk('tEXt', concat([ascii(key), new Uint8Array([0]), ascii(value)])));
  }
  chunks.push(pngChunk('IDAT', zlibStore(scanlines)), pngChunk('IEND', new Uint8Array()));
  return concat(chunks);
}

export function exportRaster(
  image: ImageBuffer,
  options: RasterExportOptions,
  jpegEncoder?: JpegEncoder,
): RasterExportResult {
  assertImageBuffer(image);
  if (options.dpi !== undefined && (!Number.isFinite(options.dpi) || options.dpi <= 0)) {
    throw new RangeError('Export DPI must be a positive finite number.');
  }
  if (options.format === 'png') {
    return {
      status: 'succeeded',
      format: 'png',
      mediaType: 'image/png',
      width: image.width,
      height: image.height,
      bytes: encodePng(image, options.dpi, options.metadata),
      ...(options.dpi === undefined ? {} : { dpi: options.dpi }),
      metadata: { ...(options.metadata ?? {}) },
    };
  }
  if (options.format === 'jpeg') {
    if (!jpegEncoder) {
      return {
        status: 'not-configured',
        code: 'NOT_CONFIGURED',
        message: 'No JPEG encoder is configured for the portable engine.',
      };
    }
    const quality = options.quality ?? 0.92;
    if (!Number.isFinite(quality) || quality < 0 || quality > 1) {
      throw new RangeError('JPEG quality must be between 0 and 1.');
    }
    const flattened = flattenAlpha(image, parseMatte(options.jpegBackground ?? '#ffffff'));
    const bytes = jpegEncoder.encode(flattened, quality, options.metadata);
    if (!(bytes instanceof Uint8Array) || bytes.length === 0) {
      throw new TypeError('JPEG encoder returned an empty or invalid byte array.');
    }
    return {
      status: 'succeeded',
      format: 'jpeg',
      mediaType: 'image/jpeg',
      width: image.width,
      height: image.height,
      bytes,
      ...(options.dpi === undefined ? {} : { dpi: options.dpi }),
      metadata: { ...(options.metadata ?? {}) },
    };
  }
  throw new TypeError(`Unsupported raster export format: ${String(options.format)}`);
}
