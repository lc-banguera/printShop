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

test('open paths and out-of-order path segments cannot create selection masks', () => {
  assert.throws(
    () => engine.rasterizePathSelection(polygon([[1, 1], [5, 1], [3, 5]], false), 8, 8),
    /closed paths/,
  );
  const path = polygon([[1, 1], [5, 1], [3, 5]]);
  path.segments[0].endAnchorId = 'a2';
  assert.throws(() => engine.flattenPath(path), /consecutive anchors/);
});
