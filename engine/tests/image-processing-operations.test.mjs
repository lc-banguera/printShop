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

test('background removal learns multiple edge colors while preserving enclosed foreground', () => {
  const width = 9;
  const height = 5;
  const pixels = [];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const color = x < 4 ? [12, 24, 36] : [232, 218, 198];
      const foreground = x === 4 && y > 0 && y < height - 1;
      pixels.push(...(foreground ? [32, 180, 80] : color), 255);
    }
  }
  const source = buffer(width, height, pixels);
  const result = engine.removeBackgroundLocal(source, { tolerance: 8, feather: 0 });

  assert.equal(result.image.data[(2 * width + 1) * 4 + 3], 0);
  assert.equal(result.image.data[(2 * width + 7) * 4 + 3], 0);
  assert.equal(result.image.data[(2 * width + 4) * 4 + 3], 255);
  assert.deepEqual([...source.data], pixels);
});

test('background removal exposes connectivity without changing the default 4-connectivity', () => {
  const source = buffer(3, 3, [
    0, 0, 0, 255, 30, 40, 50, 255, 30, 40, 50, 255,
    30, 40, 50, 255, 0, 0, 0, 255, 30, 40, 50, 255,
    30, 40, 50, 255, 30, 40, 50, 255, 30, 40, 50, 255,
  ]);
  const fourConnected = engine.removeBackgroundLocal(source, {
    tolerance: 1,
    feather: 0,
    sampleColor: [0, 0, 0],
  });
  const eightConnected = engine.removeBackgroundLocal(source, {
    tolerance: 1,
    feather: 0,
    connectivity: 8,
    sampleColor: [0, 0, 0],
  });
  assert.equal(fourConnected.image.data[(1 * 3 + 1) * 4 + 3], 255);
  assert.equal(eightConnected.image.data[(1 * 3 + 1) * 4 + 3], 0);
});

test('background feather is limited to the mask edge and preserves opaque interior', () => {
  const source = buffer(5, 3, Array.from({ length: 15 }, (_, pixel) =>
    pixel % 5 < 2 ? [255, 255, 255, 255] : [20, 40, 80, 255],
  ).flat());
  const result = engine.removeBackgroundLocal(source, {
    tolerance: 1,
    feather: 1,
    sampleColor: [255, 255, 255],
  });

  assert.ok(result.foregroundMask.values[2] > 0 && result.foregroundMask.values[2] < 255);
  assert.equal(result.foregroundMask.values[3], 255);
  assert.equal(result.image.data[0 * 4 + 3], 0);
});

test('mask refinement supports morphology and only fills holes when explicitly requested', () => {
  const values = new Uint8Array([
    0, 0, 0, 0, 0,
    0, 255, 255, 255, 0,
    0, 255, 0, 255, 0,
    0, 255, 255, 255, 0,
    0, 0, 0, 0, 0,
  ]);
  const sourceMask = engine.createAlphaData(5, 5, values);
  const preserved = engine.refineForegroundMask(sourceMask, { operation: 'none' });
  const filled = engine.refineForegroundMask(sourceMask, { fillHoles: true });
  const opened = engine.refineForegroundMask(sourceMask, { operation: 'opening', radius: 1 });

  assert.equal(preserved.values[12], 0);
  assert.equal(filled.values[12], 255);
  assert.equal(opened.values[12], 0);
  assert.equal(sourceMask.values[12], 0);
});

test('mask refinement removes small foreground islands without deleting a larger subject', () => {
  const values = new Uint8Array(7 * 7);
  for (let y = 1; y <= 5; y += 1) {
    for (let x = 1; x <= 5; x += 1) values[y * 7 + x] = 255;
  }
  values[0] = 255;
  const refined = engine.refineForegroundMask(engine.createAlphaData(7, 7, values), {
    minimumForegroundRegionSize: 2,
  });

  assert.equal(refined.values[0], 0);
  assert.equal(refined.values[24], 255);
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

test('semitransparency cleanup can remove isolated alpha noise and preserve connected edge alpha', () => {
  const source = buffer(5, 1, [
    10, 20, 30, 255,
    10, 20, 30, 128,
    10, 20, 30, 0,
    10, 20, 30, 96,
    10, 20, 30, 0,
  ]);
  const result = engine.cleanupSemitransparency(source, {
    strategy: 'remove-isolated',
    maximumIsolatedPixels: 1,
  });

  assert.deepEqual([0, 1, 2, 3, 4].map((pixel) => result.image.data[pixel * 4 + 3]), [255, 128, 0, 0, 0]);
  assert.equal(result.changedPixels, 1);
  assert.equal(result.after.semitransparentPixels, 1);
  assert.deepEqual([...source.data].filter((_, index) => index % 4 === 3), [255, 128, 0, 96, 0]);
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
