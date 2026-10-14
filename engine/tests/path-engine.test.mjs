import assert from 'node:assert/strict';
import test from 'node:test';
import engine from '../dist/index.js';

const polygon = (points, closed = true) => {
  const anchors = points.map(([x, y], index) => ({
    id: `a${index}`,
    x,
    y,
    type: 'CORNER',
  }));
  const segmentCount = closed ? anchors.length : anchors.length - 1;
  return {
    id: 'test-path',
    closed,
    anchors,
    segments: Array.from({ length: segmentCount }, (_, index) => ({
      id: `s${index}`,
      type: 'LINE',
      startAnchorId: anchors[index].id,
      endAnchorId: anchors[(index + 1) % anchors.length].id,
    })),
  };
};

test('path selection rasterizes at requested pixel dimensions with antialiased edges', () => {
  const mask = engine.rasterizePathSelection(
    polygon([[1.5, 1.5], [4.5, 1.5], [4.5, 4.5], [1.5, 4.5]]),
    8,
    8,
  );

  assert.equal(mask.width, 8);
  assert.equal(mask.height, 8);
  assert.equal(mask.values[0], 0);
  assert.equal(mask.values[3 * 8 + 3], 255);
  assert.ok(mask.values[1 * 8 + 1] > 0 && mask.values[1 * 8 + 1] < 255);
  assert.equal(mask.values[6 * 8 + 6], 0);
});

test('closed path selection preserves its interior and excludes the exterior', () => {
  const mask = engine.rasterizePathSelection(
    polygon([[2, 1], [6, 1], [6, 6], [2, 6]]),
    8,
    8,
    { samplesPerAxis: 1 },
  );
  assert.equal(mask.values[3 * 8 + 3], 255);
  assert.equal(mask.values[0], 0);
  assert.equal(mask.values[7 * 8 + 7], 0);
});

test('cubic Bézier segments flatten to a deterministic polyline', () => {
  const path = {
    id: 'curve',
    closed: true,
    anchors: [
      { id: 'a', x: 1, y: 4, type: 'SMOOTH', handleOut: { x: 1, y: 0 } },
      { id: 'b', x: 7, y: 4, type: 'SMOOTH', handleIn: { x: 7, y: 0 } },
      { id: 'c', x: 7, y: 7, type: 'CORNER' },
      { id: 'd', x: 1, y: 7, type: 'CORNER' },
    ],
    segments: [
      { id: 'ab', type: 'CUBIC_BEZIER', startAnchorId: 'a', endAnchorId: 'b' },
      { id: 'bc', type: 'LINE', startAnchorId: 'b', endAnchorId: 'c' },
      { id: 'cd', type: 'LINE', startAnchorId: 'c', endAnchorId: 'd' },
      { id: 'da', type: 'LINE', startAnchorId: 'd', endAnchorId: 'a' },
    ],
  };
  const flattened = engine.flattenPath(path, { flatness: 0.1 });
  const mask = engine.rasterizePathSelection(path, 8, 8);

  assert.ok(flattened.length > path.anchors.length);
  assert.deepEqual(flattened, engine.flattenPath(path, { flatness: 0.1 }));
  assert.equal(mask.values[2 * 8 + 4], 255);
});

test('path bounds include anchors and Bézier handles in document coordinates', () => {
  const path = {
    id: 'bounds',
    closed: false,
    anchors: [
      { id: 'a', x: 10, y: 20, type: 'SMOOTH', handleIn: { x: 5, y: 25 }, handleOut: { x: 40, y: -10 } },
      { id: 'b', x: 60, y: 30, type: 'CORNER' },
    ],
    segments: [{ id: 'ab', type: 'CUBIC_BEZIER', startAnchorId: 'a', endAnchorId: 'b' }],
  };

  assert.deepEqual(engine.getPathBounds(path), { x: 5, y: -10, width: 55, height: 40 });
});

test('vectorizeImage converts raster image into valid VectorPath and SVG', () => {
  // Create a 16x16 buffer with a 8x8 black square in the middle
  const data = new Uint8Array(16 * 16 * 4);
  data.fill(255); // White background
  for (let y = 4; y < 12; y++) {
    for (let x = 4; x < 12; x++) {
      const idx = (y * 16 + x) * 4;
      data[idx] = 0;
      data[idx + 1] = 0;
      data[idx + 2] = 0;
      data[idx + 3] = 255;
    }
  }
  const img = engine.createImageBuffer(16, 16, data);
  const result = engine.vectorizeImage(img, { threshold: 128, simplification: 1.0 });

  assert.equal(result.status, 'succeeded');
  assert.ok(result.paths.length >= 1);
  assert.ok(result.svgString.includes('<path'));
  assert.ok(result.svgString.includes('viewBox="0 0 16 16"'));

  // Ensure each generated path passes assertion
  for (const path of result.paths) {
    engine.assertValidVectorPath(path);
  }
});

test('vectorizeImage preserves multiple opaque colors and skips transparent pixels', () => {
  const data = new Uint8Array(12 * 8 * 4);
  for (let pixel = 0; pixel < data.length; pixel += 4) {
    data[pixel] = 255;
    data[pixel + 1] = 255;
    data[pixel + 2] = 255;
    data[pixel + 3] = 0;
  }
  for (let y = 2; y < 6; y += 1) {
    for (let x = 1; x < 5; x += 1) {
      const index = (y * 12 + x) * 4;
      data[index] = 235;
      data[index + 1] = 30;
      data[index + 2] = 30;
      data[index + 3] = 255;
    }
    for (let x = 7; x < 11; x += 1) {
      const index = (y * 12 + x) * 4;
      data[index] = 25;
      data[index + 1] = 85;
      data[index + 2] = 220;
      data[index + 3] = 255;
    }
  }

  const result = engine.vectorizeImage(engine.createImageBuffer(12, 8, data), {
    colors: 4,
    colormode: 'color',
    simplification: 0.5,
  });

  assert.equal(result.status, 'succeeded');
  assert.ok(result.colors.length >= 2);
  assert.ok(result.svgString.includes('#eb1e1e'));
  assert.ok(result.svgString.includes('#1955dc'));
  assert.ok(!result.svgString.includes('fill="#000000"'));
  assert.ok(result.paths.every((path) => path.fill));
  assert.ok(result.svgString.includes('<path'));
});

test('vectorizeImage retains opaque regions that touch the raster edge', () => {
  const data = new Uint8Array(6 * 6 * 4);
  for (let pixel = 0; pixel < data.length; pixel += 4) data[pixel + 3] = 0;
  for (let y = 0; y < 4; y += 1) {
    for (let x = 0; x < 4; x += 1) {
      const index = (y * 6 + x) * 4;
      data[index] = 24;
      data[index + 1] = 180;
      data[index + 2] = 96;
      data[index + 3] = 255;
    }
  }

  const result = engine.vectorizeImage(engine.createImageBuffer(6, 6, data), {
    colors: 2,
    colormode: 'color',
    simplification: 0.25,
  });

  assert.equal(result.status, 'succeeded');
  assert.ok(result.paths.some((path) => path.anchors.some((anchor) => anchor.x === 0 || anchor.y === 0)));
});

test('upscaleImageLocal increases image resolution using bicubic interpolation', () => {
  const data = new Uint8Array([
    10, 20, 30, 255,   40, 50, 60, 255,
    70, 80, 90, 255,   100, 110, 120, 255,
  ]);
  const source = engine.createImageBuffer(2, 2, data);
  const upscaled = engine.upscaleImageLocal(source, 2, 'bicubic');

  assert.equal(upscaled.width, 4);
  assert.equal(upscaled.height, 4);
  assert.equal(upscaled.data.length, 4 * 4 * 4);
  // Interpolated middle pixels should not be 0
  assert.ok(upscaled.data[0] > 0);
  assert.ok(upscaled.data[upscaled.data.length - 1] === 255);
});

test('upscaleImageLocalToTarget reaches the requested 4K long edge without distortion', () => {
  const source = engine.createImageBuffer(2, 1, new Uint8Array([
    220, 40, 30, 255,
    30, 80, 220, 128,
  ]));
  const result = engine.upscaleImageLocalToTarget(source, { maxDimension: 3840 }, 'bilinear');

  assert.equal(result.width, 3840);
  assert.equal(result.height, 1920);
  assert.equal(result.data.length, 3840 * 1920 * 4);
  assert.ok(result.data.some((value, index) => index % 4 === 3 && value > 0 && value < 255));

  const alreadyLarge = engine.upscaleImageLocalToTarget(source, { maxDimension: 2 }, 'bicubic');
  assert.deepEqual([...alreadyLarge.data], [...source.data]);
});
