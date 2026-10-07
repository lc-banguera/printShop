import assert from 'node:assert/strict';
import test from 'node:test';
import engine from '../dist/index.js';

test('alpha extraction and mask composition preserve dimensions and input buffers', () => {
  const source = engine.createImageBuffer(2, 1, new Uint8Array([10, 20, 30, 255, 40, 50, 60, 128]));
  const mask = engine.createAlphaData(2, 1, new Uint8Array([128, 255]));
  const output = engine.applyAlphaDataToImage(source, mask);
  assert.deepEqual([...engine.extractAlpha(output).values], [128, 128]);
  assert.deepEqual([...source.data], [10, 20, 30, 255, 40, 50, 60, 128]);
  assert.throws(() => engine.applyAlphaDataToImage(
    source,
    engine.createAlphaData(1, 2, new Uint8Array([255, 255])),
  ), RangeError);
});

test('effect stack is stable, composable, and non-destructive', () => {
  const source = engine.createImageBuffer(1, 1, new Uint8Array([10, 20, 30, 255]));
  const stack = {
    effects: [
      { id: 'brightness', kind: 'brightness', enabled: true, parameters: { amount: 20 } },
      { id: 'invert', kind: 'invert', enabled: true, parameters: {} },
    ],
  };
  const output = engine.applyImageEffectStack(source, stack);
  assert.deepEqual([...output.data], [225, 215, 205, 255]);
  assert.deepEqual([...source.data], [10, 20, 30, 255]);
  assert.deepEqual(engine.composeEffectStacks(stack, {
    mode: 'replace',
    effects: [{ id: 'gray', kind: 'grayscale', enabled: true, parameters: {} }],
  }).effects.map((effect) => effect.id), ['gray']);
});
