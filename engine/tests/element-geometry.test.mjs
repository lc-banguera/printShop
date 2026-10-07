import assert from 'node:assert/strict';
import test from 'node:test';
import engine from '../dist/index.js';

const { getElementGeometry, resizeElementGeometry } = engine;

const element = {
  id: 'artwork',
  type: 'image',
  layer: 'user',
  zoneId: 'front',
  x: 20,
  y: 30,
  width: 120,
  height: 60,
  rotation: 0,
  scaleX: 1,
  scaleY: 1,
};

test('element geometry reports the canonical center and rotated, flipped bounds', () => {
  const geometry = getElementGeometry({
    ...element,
    rotation: 90,
    scaleX: -1,
  });

  assert.deepEqual(geometry.center, { x: 80, y: 60 });
  assert.ok(Math.abs(geometry.bounds.x - 50) < 1e-10);
  assert.ok(Math.abs(geometry.bounds.y) < 1e-10);
  assert.ok(Math.abs(geometry.bounds.width - 60) < 1e-10);
  assert.ok(Math.abs(geometry.bounds.height - 120) < 1e-10);
});

test('resize preserves center, rotation, flip signs, and locked aspect ratio', () => {
  const resized = resizeElementGeometry(
    { ...element, rotation: 37, scaleX: -1, scaleY: 1 },
    {
      width: 240,
      height: 80,
      center: { x: 200, y: 150 },
      preserveAspectRatio: true,
    }
  );

  assert.equal(resized.width, 240);
  assert.equal(resized.height, 120);
  assert.equal(resized.x, 80);
  assert.equal(resized.y, 90);
  assert.equal(resized.scaleX, -1);
  assert.equal(resized.scaleY, 1);
  assert.equal(resized.rotation, 37);
});

test('resize enforces the minimum valid dimensions and preserves the anchor center', () => {
  const resized = resizeElementGeometry(element, {
    width: 0,
    height: 0,
    center: { x: 10, y: 10 },
    scaleX: 0,
    scaleY: 0,
    minDimension: 12,
  });

  assert.equal(resized.width, 12);
  assert.equal(resized.height, 12);
  assert.equal(resized.x, 4);
  assert.equal(resized.y, 4);
  assert.equal(resized.scaleX, 1);
  assert.equal(resized.scaleY, 1);
});

test('resize rejects invalid geometry instead of persisting non-finite values', () => {
  assert.throws(
    () => resizeElementGeometry(element, {
      width: Number.NaN,
      height: 10,
      center: { x: 0, y: 0 },
    }),
    { name: 'RangeError' }
  );
});
