import assert from 'node:assert/strict';
import test from 'node:test';
import engine from '../dist/index.js';

const {
  composeAffineTransforms,
  createArtworkTransformMatrix,
  createAffineTransform,
  createCenteredTransform,
  invertAffineTransform,
  rotatePoint,
  transformBounds,
  transformPoint,
} = engine;

test('rotation around an origin preserves the existing designer coordinate convention', () => {
  assert.deepEqual(
    rotatePoint({ x: 14, y: 10 }, { x: 10, y: 10 }, 90),
    { x: 10, y: 14 }
  );
  assert.deepEqual(
    rotatePoint({ x: 14, y: 10 }, { x: 10, y: 10 }, 0),
    { x: 14, y: 10 }
  );
});

test('affine transform composition applies the inner transform before the outer transform', () => {
  const scale = createAffineTransform({ scaleX: 2, scaleY: 3 });
  const rotate = createAffineTransform({ rotationDegrees: 90 });
  const composed = composeAffineTransforms(rotate, scale);

  const transformed = transformPoint({ x: 2, y: 1 }, composed);
  assert.ok(Math.abs(transformed.x + 3) < 1e-10);
  assert.ok(Math.abs(transformed.y - 4) < 1e-10);
});

test('affine transforms invert and round-trip points', () => {
  const transform = createAffineTransform({
    translateX: 12,
    translateY: -8,
    scaleX: 1.5,
    scaleY: 0.75,
    rotationDegrees: 31,
    origin: { x: 4, y: 9 },
  });
  const point = { x: 19, y: -6 };
  const restored = transformPoint(transformPoint(point, transform), invertAffineTransform(transform));

  assert.ok(Math.abs(restored.x - point.x) < 1e-10);
  assert.ok(Math.abs(restored.y - point.y) < 1e-10);
});

test('transformed rectangle bounds include all rotated corners', () => {
  const bounds = transformBounds(
    { x: 0, y: 0, width: 20, height: 10 },
    createAffineTransform({ rotationDegrees: 90, origin: { x: 10, y: 5 } })
  );

  assert.ok(Math.abs(bounds.x - 5) < 1e-10);
  assert.ok(Math.abs(bounds.y + 5) < 1e-10);
  assert.ok(Math.abs(bounds.width - 10) < 1e-10);
  assert.ok(Math.abs(bounds.height - 20) < 1e-10);
});

test('centered global flips and rotations match exact raster orientation', () => {
  const source = engine.createImageBuffer(2, 2, new Uint8Array([
    255, 0, 0, 255, 0, 255, 0, 255,
    0, 0, 255, 255, 255, 255, 0, 255,
  ]));
  const center = { x: 0, y: 0, width: 2, height: 2 };
  const render = (options) => engine.transformImageBuffer(
    source,
    createCenteredTransform(center, options),
    2,
    2,
    'nearest'
  );

  assert.deepEqual([...render({ scaleX: -1 }).data], [
    0, 255, 0, 255, 255, 0, 0, 255,
    255, 255, 0, 255, 0, 0, 255, 255,
  ]);
  assert.deepEqual([...render({ scaleY: -1 }).data], [
    0, 0, 255, 255, 255, 255, 0, 255,
    255, 0, 0, 255, 0, 255, 0, 255,
  ]);
  assert.deepEqual([...render({ rotationDegrees: 90, scaleX: -1 }).data], [
    255, 255, 0, 255, 0, 255, 0, 255,
    0, 0, 255, 255, 255, 0, 0, 255,
  ]);
  assert.deepEqual([...render({ rotationDegrees: 90, scaleY: -1 }).data], [
    255, 0, 0, 255, 0, 0, 255, 255,
    0, 255, 0, 255, 255, 255, 0, 255,
  ]);
});

test('preview-scale and export-scale document transforms have identical normalized geometry', () => {
  const options = [
    { scaleX: -1 },
    { scaleY: -1 },
    { rotationDegrees: 37, scaleX: -1 },
    { rotationDegrees: 37, scaleY: -1 },
  ];
  const previewBounds = { x: 0, y: 0, width: 480, height: 320 };
  const exportBounds = { x: 0, y: 0, width: 960, height: 640 };

  for (const transformOptions of options) {
    const preview = createCenteredTransform(previewBounds, transformOptions);
    const exported = createCenteredTransform(exportBounds, transformOptions);
    for (const key of ['a', 'b', 'c', 'd']) {
      assert.ok(Math.abs(exported[key] - preview[key]) < 1e-10);
    }
    assert.ok(Math.abs(exported.e - preview.e * 2) < 1e-10);
    assert.ok(Math.abs(exported.f - preview.f * 2) < 1e-10);

    const previewPoint = transformPoint({ x: 127, y: 81 }, preview);
    const exportPoint = transformPoint({ x: 254, y: 162 }, exported);
    assert.ok(Math.abs(exportPoint.x - previewPoint.x * 2) < 1e-10);
    assert.ok(Math.abs(exportPoint.y - previewPoint.y * 2) < 1e-10);
  }
});

test('artwork transform keeps normalized preview and export geometry in sync', () => {
  const artworkTransform = {
    scale: 1.35,
    rotationDegrees: 37,
    flipX: true,
    flipY: false,
    offsetX: 0.125,
    offsetY: -0.05,
  };
  const preview = createArtworkTransformMatrix(480, 320, artworkTransform);
  const exported = createArtworkTransformMatrix(960, 640, artworkTransform);

  for (const key of ['a', 'b', 'c', 'd']) {
    assert.ok(Math.abs(exported[key] - preview[key]) < 1e-10);
  }
  assert.ok(Math.abs(exported.e - preview.e * 2) < 1e-10);
  assert.ok(Math.abs(exported.f - preview.f * 2) < 1e-10);

  const previewPoint = transformPoint({ x: 127, y: 81 }, preview);
  const exportPoint = transformPoint({ x: 254, y: 162 }, exported);
  assert.ok(Math.abs(exportPoint.x - previewPoint.x * 2) < 1e-10);
  assert.ok(Math.abs(exportPoint.y - previewPoint.y * 2) < 1e-10);
});

test('artwork transform matrix preserves flip and rotation orientation for raster output', () => {
  const source = engine.createImageBuffer(2, 2, new Uint8Array([
    255, 0, 0, 255, 0, 255, 0, 255,
    0, 0, 255, 255, 255, 255, 0, 255,
  ]));
  const render = (transform) => engine.transformImageBuffer(
    source,
    createArtworkTransformMatrix(2, 2, {
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      ...transform,
    }),
    2,
    2,
    'nearest'
  );

  assert.deepEqual([...render({ rotationDegrees: 0, flipX: true, flipY: false }).data], [
    0, 255, 0, 255, 255, 0, 0, 255,
    255, 255, 0, 255, 0, 0, 255, 255,
  ]);
  assert.deepEqual([...render({ rotationDegrees: 0, flipX: false, flipY: true }).data], [
    0, 0, 255, 255, 255, 255, 0, 255,
    255, 0, 0, 255, 0, 255, 0, 255,
  ]);
  assert.deepEqual([...render({ rotationDegrees: 90, flipX: true, flipY: false }).data], [
    255, 255, 0, 255, 0, 255, 0, 255,
    0, 0, 255, 255, 255, 0, 0, 255,
  ]);
  assert.deepEqual([...render({ rotationDegrees: 90, flipX: false, flipY: true }).data], [
    255, 0, 0, 255, 0, 0, 255, 255,
    0, 255, 0, 255, 255, 255, 0, 255,
  ]);
});

test('artwork transform matrix rejects invalid dimensions and scale', () => {
  const transform = {
    scale: 1,
    rotationDegrees: 0,
    flipX: false,
    flipY: false,
    offsetX: 0,
    offsetY: 0,
  };

  assert.throws(() => createArtworkTransformMatrix(0, 10, transform), { name: 'RangeError' });
  assert.throws(() => createArtworkTransformMatrix(10, Number.NaN, transform), { name: 'RangeError' });
  assert.throws(
    () => createArtworkTransformMatrix(10, 10, { ...transform, scale: 0 }),
    { name: 'RangeError' }
  );
});

test('invalid or singular transforms fail explicitly', () => {
  assert.throws(
    () => createAffineTransform({ scaleX: Number.NaN }),
    { name: 'RangeError' }
  );
  assert.throws(
    () => createAffineTransform({ rotationDegrees: Number.MAX_VALUE }),
    { name: 'RangeError' }
  );
  assert.throws(
    () => transformPoint({ x: Number.MAX_VALUE, y: 0 }, createAffineTransform({ scaleX: 2 })),
    { name: 'RangeError' }
  );
  assert.throws(
    () => invertAffineTransform(createAffineTransform({ scaleX: 0 })),
    { name: 'RangeError' }
  );
  assert.throws(
    () => transformBounds({ x: 0, y: 0, width: -1, height: 2 }, createAffineTransform()),
    { name: 'RangeError' }
  );
});
