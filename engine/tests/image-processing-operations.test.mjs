import assert from 'node:assert/strict';
import test from 'node:test';
import engine from '../dist/index.js';

const buffer = (width, height, pixels) => engine.createImageBuffer(width, height, new Uint8Array(pixels));

test('background removal flood-fills edge-connected background without mutating source', () => {
  const pixels = Array(9).fill([255, 255, 255, 255]).flat();
  const center = 4 * 4;
  pixels[center] = 20;
  pixels[center + 1] = 30;
  pixels[center + 2] = 40;
  const source = buffer(3, 3, pixels);
  const result = engine.removeBackgroundLocal(source, { tolerance: 5, feather: 0 });
  assert.equal(result.image.data[3], 0);
  assert.deepEqual([...result.image.data.slice(center, center + 4)], [20, 30, 40, 255]);
  assert.deepEqual([...source.data], pixels);
});

test('halftone preserves source alpha input and output dimensions', () => {
  const pixels = Array(8 * 8).fill([0, 0, 0, 255]).flat();
  const source = buffer(8, 8, pixels);
  const output = engine.applyHalftone(source, {
    cellSize: 4,
    angle: 30,
    intensity: 100,
    contrast: 100,
    dotColor: '#000000',
    bgColor: 'transparent',
    shape: 'circle',
  });
  assert.equal(output.width, 8);
  assert.equal(output.height, 8);
  assert.ok([...output.data].some((value, index) => index % 4 === 3 && value > 0));
  assert.deepEqual([...source.data], pixels);
});

test('semitransparency cleanup applies a deterministic threshold and reports changed alpha', () => {
  const source = buffer(4, 1, [1, 2, 3, 0, 4, 5, 6, 64, 7, 8, 9, 192, 10, 11, 12, 255]);
  const result = engine.cleanupSemitransparency(source, { strategy: 'threshold', threshold: 128 });
  assert.deepEqual([0, 1, 2, 3].map((pixel) => result.image.data[pixel * 4 + 3]), [0, 0, 255, 255]);
  assert.equal(result.changedPixels, 2);
  assert.equal(result.before.semitransparentPixels, 2);
  assert.equal(result.after.semitransparentPixels, 0);
});

test('color analysis groups by tolerance and recolor preserves other colors and alpha', () => {
  const source = buffer(3, 1, [250, 0, 0, 255, 245, 0, 0, 128, 0, 0, 255, 255]);
  const analysis = engine.analyzeColors(source, 'asset', { tolerance: 6 });
  assert.equal(analysis.regions.length, 2);
  assert.deepEqual(analysis.dominantColors.map((item) => item.pixelCount), [2, 1]);
  const recolored = engine.recolorImage(source, {
    sourceColor: '#ff0000',
    targetColor: '#00ff00',
    tolerance: 6,
  });
  assert.equal(recolored.recoloredPixels, 2);
  assert.deepEqual([...recolored.image.data], [0, 255, 0, 255, 0, 255, 0, 128, 0, 0, 255, 255]);
  assert.deepEqual([...source.data], [250, 0, 0, 255, 245, 0, 0, 128, 0, 0, 255, 255]);
});

test('upscaling requires a configured processor and validates its output scale', async () => {
  const source = buffer(1, 1, [1, 2, 3, 255]);
  const missing = await engine.upscaleImage(source, 2);
  assert.equal(missing.status, 'not-configured');
  assert.equal(missing.code, 'NOT_CONFIGURED');
  await assert.rejects(() => engine.upscaleImage(source, 2, {
    providerId: 'bad-provider',
    async upscale() {
      return buffer(1, 1, [1, 2, 3, 255]);
    },
  }), /below the requested scale factor/);
});
