import assert from 'node:assert/strict';
import test from 'node:test';
import engine from '../dist/index.js';

test('alpha data validates dimensions and owns a stable byte copy', () => {
  const source = new Uint8Array([0, 127, 255, 64]);
  const alpha = engine.createAlphaData(2, 2, source);

  source[0] = 255;
  assert.equal(alpha.width, 2);
  assert.equal(alpha.height, 2);
  assert.deepEqual([...alpha.values], [0, 127, 255, 64]);
  assert.throws(() => engine.createAlphaData(2, 2, new Uint8Array([1])), RangeError);
  assert.throws(() => engine.createAlphaData(0, 2, new Uint8Array()), RangeError);
});
