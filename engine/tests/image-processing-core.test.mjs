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

test('image buffers extract and copy bounded regions without corrupting overlapping copies', () => {
  const source = engine.createImageBuffer(3, 2, new Uint8Array([
    1, 0, 0, 255, 2, 0, 0, 255, 3, 0, 0, 255,
    4, 0, 0, 255, 5, 0, 0, 255, 6, 0, 0, 255,
  ]));
  const extracted = engine.cloneImageRegion(source, { x: 1, y: 0, width: 2, height: 2 });
  assert.equal(extracted.width, 2);
  assert.equal(extracted.height, 2);
  assert.deepEqual([...extracted.data].filter((_, index) => index % 4 === 0), [2, 3, 5, 6]);

  engine.copyImageRegion(source, { x: 0, y: 0, width: 2, height: 2 }, source, 1, 0);
  assert.deepEqual([...source.data].filter((_, index) => index % 4 === 0), [1, 1, 2, 4, 4, 5]);
  assert.deepEqual([...extracted.data].filter((_, index) => index % 4 === 0), [2, 3, 5, 6]);
  assert.throws(
    () => engine.cloneImageRegion(source, { x: 2, y: 0, width: 2, height: 1 }),
    RangeError,
  );
});

test('image buffer pixel access requires integral in-bounds coordinates and clamps channels', () => {
  const source = engine.createImageBuffer(1, 1);
  assert.throws(() => engine.getPixel(source, 0.5, 0), RangeError);
  assert.throws(() => engine.getPixel(source, Number.NaN, 0), RangeError);
  assert.throws(() => engine.setPixel(source, 1, 0, 0, 0, 0, 0), RangeError);
  engine.setPixel(source, 0, 0, -1, 12.4, 300, 128);
  assert.deepEqual(engine.getPixel(source, 0, 0), [0, 12, 255, 128]);
});

test('image compositing source-over handles partial alpha without mutating either input', () => {
  const backdrop = engine.createImageBuffer(1, 1, new Uint8Array([0, 0, 255, 128]));
  const source = engine.createImageBuffer(1, 1, new Uint8Array([255, 0, 0, 128]));

  const output = engine.compositeImageBuffer(backdrop, source);

  assert.deepEqual(engine.getPixel(output, 0, 0), [170, 0, 85, 192]);
  assert.deepEqual([...backdrop.data], [0, 0, 255, 128]);
  assert.deepEqual([...source.data], [255, 0, 0, 128]);
});

test('image compositing supports offsets, opacity, blend modes and clipped edges', () => {
  const backdrop = engine.createImageBuffer(2, 1, new Uint8Array([
    0, 0, 255, 255, 255, 255, 255, 255,
  ]));
  const source = engine.createImageBuffer(2, 1, new Uint8Array([
    255, 0, 0, 255, 0, 255, 0, 255,
  ]));

  const multiplied = engine.compositeImageBuffer(backdrop, source, {
    x: -1,
    opacity: 0.5,
    blendMode: 'multiply',
  });
  assert.deepEqual(engine.getPixel(multiplied, 0, 0), [0, 0, 128, 255]);
  assert.deepEqual(engine.getPixel(multiplied, 1, 0), [255, 255, 255, 255]);

  const screened = engine.compositeImageBuffer(
    engine.createImageBuffer(1, 1, new Uint8Array([0, 0, 255, 255])),
    engine.createImageBuffer(1, 1, new Uint8Array([255, 0, 0, 255])),
    { blendMode: 'screen' }
  );
  assert.deepEqual(engine.getPixel(screened, 0, 0), [255, 0, 255, 255]);
});

test('image compositing rejects invalid placement and opacity', () => {
  const pixel = engine.createImageBuffer(1, 1);
  assert.throws(() => engine.compositeImageBuffer(pixel, pixel, { x: 0.5 }), RangeError);
  assert.throws(() => engine.compositeImageBuffer(pixel, pixel, { opacity: 1.1 }), RangeError);
});

test('raster layer composition transforms and composites layers bottom-to-top', () => {
  const bottom = engine.createImageBuffer(1, 1, new Uint8Array([0, 0, 255, 255]));
  const top = engine.createImageBuffer(1, 1, new Uint8Array([255, 0, 0, 255]));
  const output = engine.compositeRasterLayers([
    {
      image: bottom,
      transform: engine.createAffineTransform({ translateX: 1 }),
    },
    {
      image: top,
      transform: engine.createAffineTransform({ translateX: 1 }),
      opacity: 0.5,
    },
  ], { width: 3, height: 1, resampling: 'nearest' });

  assert.deepEqual(engine.getPixel(output, 0, 0), [0, 0, 0, 0]);
  assert.deepEqual(engine.getPixel(output, 1, 0), [128, 0, 128, 255]);
  assert.deepEqual(engine.getPixel(output, 2, 0), [0, 0, 0, 0]);
  assert.deepEqual([...bottom.data], [0, 0, 255, 255]);
  assert.deepEqual([...top.data], [255, 0, 0, 255]);
});

test('raster layer composition applies rotation, flips, visibility, and blend modes', () => {
  const source = engine.createImageBuffer(2, 1, new Uint8Array([
    255, 0, 0, 255,
    0, 255, 0, 255,
  ]));
  const flipped = engine.compositeRasterLayers([{
    image: source,
    transform: engine.createAffineTransform({
      scaleX: -1,
      translateX: 3,
    }),
  }], { width: 5, height: 1, resampling: 'nearest' });
  assert.deepEqual(engine.getPixel(flipped, 1, 0), [0, 255, 0, 255]);
  assert.deepEqual(engine.getPixel(flipped, 2, 0), [255, 0, 0, 255]);

  const hiddenLayer = engine.compositeRasterLayers([
    {
      image: source,
      transform: engine.createAffineTransform(),
      visible: false,
    },
  ], { width: 2, height: 1, resampling: 'nearest' });
  assert.deepEqual([...hiddenLayer.data], [0, 0, 0, 0, 0, 0, 0, 0]);

  const screen = engine.compositeRasterLayers([
    {
      image: engine.createImageBuffer(1, 1, new Uint8Array([0, 0, 255, 255])),
      transform: engine.createAffineTransform(),
    },
    {
      image: engine.createImageBuffer(1, 1, new Uint8Array([255, 0, 0, 255])),
      transform: engine.createAffineTransform(),
      blendMode: 'screen',
    },
  ], { width: 1, height: 1, resampling: 'nearest' });
  assert.deepEqual(engine.getPixel(screen, 0, 0), [255, 0, 255, 255]);
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
