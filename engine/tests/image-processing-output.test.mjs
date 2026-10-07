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
