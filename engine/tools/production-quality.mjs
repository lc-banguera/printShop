import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import * as engine from '../dist/index.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const outputDir = path.join(repoRoot, 'docs', 'processing-validation', 'latest');
fs.mkdirSync(outputDir, { recursive: true });

function readPng(filePath) {
  const bytes = fs.readFileSync(filePath);
  if (bytes.length < 33 || bytes.readUInt32BE(0) !== 0x89504e47) {
    throw new Error(`Unsupported PNG input: ${filePath}`);
  }
  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idat = [];
  while (offset < bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.toString('ascii', offset + 4, offset + 8);
    const data = bytes.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === 'IDAT') {
      idat.push(data);
    } else if (type === 'IEND') {
      break;
    }
    offset += length + 12;
  }
  if (bitDepth !== 8 || (colorType !== 6 && colorType !== 2)) {
    throw new Error(`Only 8-bit RGB/RGBA PNGs are supported: ${filePath}`);
  }
  const bytesPerPixel = colorType === 6 ? 4 : 3;
  const rowLength = width * bytesPerPixel;
  const inflated = zlib.inflateSync(Buffer.concat(idat));
  const pixels = new Uint8Array(width * height * 4);
  const previous = new Uint8Array(rowLength);
  const current = new Uint8Array(rowLength);
  let inputOffset = 0;
  const paeth = (left, up, upperLeft) => {
    const estimate = left + up - upperLeft;
    const leftDistance = Math.abs(estimate - left);
    const upDistance = Math.abs(estimate - up);
    const upperLeftDistance = Math.abs(estimate - upperLeft);
    if (leftDistance <= upDistance && leftDistance <= upperLeftDistance) return left;
    if (upDistance <= upperLeftDistance) return up;
    return upperLeft;
  };
  for (let y = 0; y < height; y += 1) {
    const filter = inflated[inputOffset++];
    for (let x = 0; x < rowLength; x += 1) {
      const raw = inflated[inputOffset++];
      const left = x >= bytesPerPixel ? current[x - bytesPerPixel] : 0;
      const up = previous[x];
      const upperLeft = x >= bytesPerPixel ? previous[x - bytesPerPixel] : 0;
      if (filter === 0) current[x] = raw;
      else if (filter === 1) current[x] = (raw + left) & 255;
      else if (filter === 2) current[x] = (raw + up) & 255;
      else if (filter === 3) current[x] = (raw + Math.floor((left + up) / 2)) & 255;
      else if (filter === 4) current[x] = (raw + paeth(left, up, upperLeft)) & 255;
      else throw new Error(`Unsupported PNG filter ${filter}`);
    }
    for (let x = 0; x < width; x += 1) {
      const source = x * bytesPerPixel;
      const destination = (y * width + x) * 4;
      pixels[destination] = current[source];
      pixels[destination + 1] = current[source + 1];
      pixels[destination + 2] = current[source + 2];
      pixels[destination + 3] = bytesPerPixel === 4 ? current[source + 3] : 255;
    }
    previous.set(current);
  }
  return engine.createImageBuffer(width, height, pixels);
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const value of bytes) {
    crc ^= value;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const payload = Buffer.concat([typeBytes, Buffer.from(data)]);
  const result = Buffer.alloc(data.length + 12);
  result.writeUInt32BE(data.length, 0);
  payload.copy(result, 4);
  result.writeUInt32BE(crc32(payload), result.length - 4);
  return result;
}

function writePng(filePath, image, dpi = 300) {
  const scanlines = Buffer.alloc((image.width * 4 + 1) * image.height);
  for (let y = 0; y < image.height; y += 1) {
    const row = y * (image.width * 4 + 1);
    scanlines[row] = 0;
    Buffer.from(image.data.buffer, image.data.byteOffset + y * image.width * 4, image.width * 4)
      .copy(scanlines, row + 1);
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(image.width, 0);
  header.writeUInt32BE(image.height, 4);
  header[8] = 8;
  header[9] = 6;
  const ppm = Math.round(dpi / 0.0254);
  const physical = Buffer.alloc(9);
  physical.writeUInt32BE(ppm, 0);
  physical.writeUInt32BE(ppm, 4);
  physical[8] = 1;
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', header),
    pngChunk('pHYs', physical),
    pngChunk('IDAT', zlib.deflateSync(scanlines, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
  fs.writeFileSync(filePath, png);
}

function changedRatio(left, right) {
  if (left.width !== right.width || left.height !== right.height) return 1;
  let changed = 0;
  for (let index = 0; index < left.data.length; index += 1) {
    if (left.data[index] !== right.data[index]) changed += 1;
  }
  return changed / left.data.length;
}

const upscaleInputPath = path.join(repoRoot, 'frontend', 'src', 'resources', 'designs', 'img2.png');
const illustrationInputPath = path.join(repoRoot, 'frontend', 'src', 'resources', 'designs', 'img4.png');
const upscaleInput = readPng(upscaleInputPath);
const illustrationInput = readPng(illustrationInputPath);
fs.copyFileSync(upscaleInputPath, path.join(outputDir, 'before-upscale-img2.png'));
fs.copyFileSync(illustrationInputPath, path.join(outputDir, 'before-illustration-img4.png'));

const fourK = engine.upscaleImageLocalToTarget(upscaleInput, { maxDimension: 3840 }, 'lanczos');
const fourKPath = path.join(outputDir, 'after-upscale-img2-4k-lanczos.png');
writePng(fourKPath, fourK);

const adjustments = engine.applyImageAdjustments(illustrationInput, {
  brightness: 12,
  contrast: 18,
  saturation: 14,
  temperature: 6,
  hue: 3,
  sharpen: 22,
});
const adjustmentsPath = path.join(outputDir, 'after-adjust-img4.png');
writePng(adjustmentsPath, adjustments);

const halftone = engine.applyHalftone(illustrationInput, {
  cellSize: 8,
  angle: 35,
  dotColor: 'original',
  bgColor: 'transparent',
  intensity: 92,
  contrast: 118,
  shape: 'circle',
  invert: false,
});
const halftonePath = path.join(outputDir, 'after-halftone-img4.png');
writePng(halftonePath, halftone);

const vector = engine.vectorizeImage(illustrationInput, {
  colors: 12,
  colormode: 'color',
  simplification: 1.25,
  minPathLength: 6,
});
fs.writeFileSync(path.join(outputDir, 'after-vectorize-img4.svg'), vector.svgString, 'utf8');
const reopenedFourK = readPng(fourKPath);
const reopenedAdjustments = readPng(adjustmentsPath);
const reopenedHalftone = readPng(halftonePath);
if (reopenedFourK.width !== 2160 || reopenedFourK.height !== 3840 ||
    reopenedAdjustments.width !== illustrationInput.width ||
    reopenedHalftone.height !== illustrationInput.height) {
  throw new Error('Independent PNG reopen validation failed.');
}

const report = {
  generatedAt: new Date().toISOString(),
  inputs: {
    upscale: { file: 'before-upscale-img2.png', width: upscaleInput.width, height: upscaleInput.height },
    illustration: { file: 'before-illustration-img4.png', width: illustrationInput.width, height: illustrationInput.height },
  },
  operations: {
    upscale4k: {
      output: 'after-upscale-img2-4k-lanczos.png',
      method: 'lanczos',
      targetMaxDimension: 3840,
      width: fourK.width,
      height: fourK.height,
      reopened: { width: reopenedFourK.width, height: reopenedFourK.height },
      changedRatio: changedRatio(upscaleInput, fourK),
    },
    adjustments: {
      output: 'after-adjust-img4.png',
      parameters: { brightness: 12, contrast: 18, saturation: 14, temperature: 6, hue: 3, sharpen: 22 },
      changedRatio: changedRatio(illustrationInput, adjustments),
      reopened: true,
    },
    halftone: {
      output: 'after-halftone-img4.png',
      parameters: { cellSize: 8, angle: 35, intensity: 92, contrast: 118, shape: 'circle', invert: false },
      changedRatio: changedRatio(illustrationInput, halftone),
      reopened: true,
    },
    vectorize: {
      output: 'after-vectorize-img4.svg',
      paths: vector.paths.length,
      colors: vector.colors,
      containsRasterImageTag: /<image\b/i.test(vector.svgString),
      status: vector.status,
    },
  },
};
fs.writeFileSync(path.join(outputDir, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
