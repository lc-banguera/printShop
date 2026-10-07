import assert from 'node:assert/strict';
import test from 'node:test';
import engine from '../dist/index.js';

const {
  composeAffineTransforms,
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
