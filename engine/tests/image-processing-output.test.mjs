import assert from 'node:assert/strict';
import { inflateSync } from 'node:zlib';
import test from 'node:test';
import engine from '../dist/index.js';

test('PNG export retains RGBA pixels, dimensions, DPI and metadata', () => {
  const image = engine.createImageBuffer(1, 1, new Uint8Array([12, 34, 56, 78]));
  const result = engine.exportRaster(image, {
    format: 'png',
    dpi: 300,
    metadata: { title: 'print test' },
  });
  assert.equal(result.status, 'succeeded');
  assert.equal(result.width, 1);
  assert.equal(result.height, 1);
  assert.equal(result.dpi, 300);
  assert.equal(result.metadata.title, 'print test');
  assert.deepEqual([...result.bytes.slice(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);

  const chunks = [];
  let offset = 8;
  while (offset < result.bytes.length) {
    const length = new DataView(result.bytes.buffer, result.bytes.byteOffset + offset, 4).getUint32(0);
    const kind = String.fromCharCode(...result.bytes.slice(offset + 4, offset + 8));
    if (kind === 'IDAT') chunks.push(result.bytes.slice(offset + 8, offset + 8 + length));
    offset += length + 12;
    if (kind === 'IEND') break;
  }
  const raw = inflateSync(Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))));
  assert.deepEqual([...raw], [0, 12, 34, 56, 78]);
});

test('PNG DPI metadata updates or inserts one valid pHYs chunk', () => {
  const image = engine.createImageBuffer(1, 1, new Uint8Array([12, 34, 56, 78]));
  const original = engine.exportRaster(image, { format: 'png', dpi: 96 });
  const updated = engine.setPngDpiMetadata(original.bytes, 300);
  const physicalChunks = [];
  let offset = 8;

  while (offset < updated.length) {
    const length = new DataView(
      updated.buffer,
      updated.byteOffset + offset,
      4,
    ).getUint32(0);
    const type = String.fromCharCode(...updated.slice(offset + 4, offset + 8));
    if (type === 'pHYs') {
      physicalChunks.push(updated.slice(offset + 8, offset + 8 + length));
    }
    offset += length + 12;
    if (type === 'IEND') break;
  }

  assert.equal(physicalChunks.length, 1);
  const resolution = new DataView(
    physicalChunks[0].buffer,
    physicalChunks[0].byteOffset,
    physicalChunks[0].byteLength,
  );
  assert.equal(resolution.getUint32(0), 11811);
  assert.equal(resolution.getUint32(4), 11811);
  assert.equal(resolution.getUint8(8), 1);
  const withoutResolution = engine.exportRaster(image, { format: 'png' });
  const inserted = engine.setPngDpiMetadata(withoutResolution.bytes, 300);
  let insertedPhysicalChunks = 0;
  offset = 8;
  while (offset < inserted.length) {
    const length = new DataView(inserted.buffer, inserted.byteOffset + offset, 4).getUint32(0);
    const type = String.fromCharCode(...inserted.slice(offset + 4, offset + 8));
    if (type === 'pHYs') insertedPhysicalChunks += 1;
    offset += length + 12;
    if (type === 'IEND') break;
  }
  assert.equal(insertedPhysicalChunks, 1);
  assert.throws(() => engine.setPngDpiMetadata(original.bytes, 0), { name: 'RangeError' });
  assert.throws(() => engine.setPngDpiMetadata(new Uint8Array([1, 2, 3]), 300), { name: 'TypeError' });
});

test('JPEG export flattens alpha through a configured encoder and reports missing encoders', () => {
  const image = engine.createImageBuffer(1, 1, new Uint8Array([12, 34, 56, 78]));
  assert.deepEqual(engine.exportRaster(image, { format: 'jpeg' }), {
    status: 'not-configured',
    code: 'NOT_CONFIGURED',
    message: 'No JPEG encoder is configured for the portable engine.',
  });
  let pixels;
  const result = engine.exportRaster(image, { format: 'jpeg' }, {
    encode(flattened, quality) {
      assert.equal(quality, 0.92);
      pixels = [...flattened.data];
      return new Uint8Array([255, 216, 255]);
    },
  });
  assert.equal(result.status, 'succeeded');
  assert.deepEqual(pixels, [181, 187, 194, 255]);
});

test('DTF preflight checks documented DPI, supplied print limits, and alpha properties', () => {
  const image = engine.createImageBuffer(2, 1, new Uint8Array([10, 20, 30, 128, 40, 50, 60, 255]));
  const result = engine.runDtfPreflight(image, {
    dpiX: 150,
    dpiY: 300,
    printAreaMm: { width: 120, height: 240 },
    maximumPrintAreaMm: { width: 100, height: 250 },
  });
  assert.equal(result.status, 'failed');
  assert.ok(result.errors.some((issue) => issue.code === 'LOW_DPI'));
  assert.ok(result.errors.some((issue) => issue.code === 'PRINT_AREA_EXCEEDED'));
  assert.ok(result.warnings.some((issue) => issue.code === 'SEMITRANSPARENCY_PRESENT'));
  assert.equal(result.metrics.semitransparentPixels, 1);
});

test('raster dimension planning preserves aspect ratio only when explicitly requested', () => {
  assert.deepEqual(engine.calculateRasterDimensions(
    { widthPx: 1200, heightPx: 1800 },
    { widthPx: 600, preserveAspectRatio: true },
  ), { widthPx: 600, heightPx: 900 });
  assert.deepEqual(engine.calculateRasterDimensions(
    { widthPx: 1200, heightPx: 1800 },
    { widthPx: 1800, preserveAspectRatio: true },
  ), { widthPx: 1800, heightPx: 2700 });
  assert.deepEqual(engine.calculateRasterDimensions(
    { widthPx: 1200, heightPx: 1800 },
    { widthPx: 800, heightPx: 400, preserveAspectRatio: true },
  ), { widthPx: 267, heightPx: 400 });
  assert.deepEqual(engine.calculateRasterDimensions(
    { widthPx: 1200, heightPx: 1800 },
    { widthPx: 800, heightPx: 400 },
  ), { widthPx: 800, heightPx: 400 });
});

test('print dimensions and effective DPI convert physical units without involving viewport zoom', () => {
  const raster = { widthPx: 1200, heightPx: 1800 };
  const printSize = engine.pixelsToPrintDimensions(raster, { dpiX: 300, dpiY: 300 }, 'cm');
  assert.deepEqual(printSize, { width: 10.16, height: 15.24, unit: 'cm' });
  assert.deepEqual(engine.calculateEffectiveResolution(raster, printSize), { dpiX: 300, dpiY: 300 });
  assert.deepEqual(engine.pixelsToPrintDimensions(raster, { dpiX: 300, dpiY: 300 }, 'mm'), {
    width: 101.6,
    height: 152.4,
    unit: 'mm',
  });
});

test('bilinear raster resizing interpolates premultiplied alpha without color fringes', () => {
  const source = engine.createImageBuffer(2, 1, new Uint8Array([
    255, 0, 0, 0,
    0, 0, 255, 255,
  ]));
  const resized = engine.resizeImageBuffer(source, 3, 1, 'bilinear');
  assert.deepEqual([...resized.data], [
    0, 0, 0, 0,
    0, 0, 255, 128,
    0, 0, 255, 255,
  ]);
  assert.deepEqual([...source.data], [255, 0, 0, 0, 0, 0, 255, 255]);
});
