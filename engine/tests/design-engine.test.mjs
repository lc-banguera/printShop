import assert from 'node:assert/strict';
import test from 'node:test';
import engine from '../dist/index.js';

const { DesignEngine, createPrintShopDocument } = engine;

test('document, layer, selection, transform, command undo and redo work together', () => {
  const document = createPrintShopDocument({
    id: 'document-1',
    createdAt: '2026-10-06T00:00:00.000Z',
    updatedAt: '2026-10-06T00:00:00.000Z',
    product: { id: 'shirt-1' },
    surfaces: [{
      id: 'front',
      name: 'Front',
      printableArea: {
        id: 'front',
        name: 'Front area',
        x: 0,
        y: 0,
        width: 400,
        height: 500,
        enabled: true,
        visible: true,
      },
      layers: [],
      coordinateSystem: { origin: 'top-left', unit: 'px', width: 400, height: 500 },
    }],
  });
  const designEngine = new DesignEngine(document);
  const layer = {
    id: 'layer-artwork',
    name: 'Artwork',
    order: 0,
    locked: false,
    visible: true,
    elements: [],
  };
  const secondLayer = {
    id: 'layer-decoration',
    name: 'Decoration',
    order: 1,
    locked: false,
    visible: true,
    elements: [],
  };
  const element = {
    id: 'artwork-1',
    type: 'image',
    layer: 'user',
    zoneId: 'front',
    x: 10,
    y: 20,
    width: 100,
    height: 80,
  };
  const secondElement = {
    ...element,
    id: 'artwork-2',
    x: 200,
    y: 100,
  };

  designEngine.createLayer('front', layer);
  designEngine.createLayer('front', secondLayer);
  designEngine.addElement(layer.id, element);
  designEngine.addElement(secondLayer.id, secondElement);
  designEngine.selectMany([element.id, secondElement.id]);

  assert.equal(designEngine.moveSelected({ x: 5, y: -3 }), true);
  assert.deepEqual(designEngine.document.surfaces[0].layers[0].elements[0], {
    ...element,
    x: 15,
    y: 17,
  });
  assert.deepEqual(designEngine.document.surfaces[0].layers[1].elements[0], {
    ...secondElement,
    x: 205,
    y: 97,
  });
  assert.equal(designEngine.undo(), true);
  assert.deepEqual(designEngine.document.surfaces[0].layers[0].elements[0], element);
  assert.deepEqual(designEngine.document.surfaces[0].layers[1].elements[0], secondElement);
  assert.equal(designEngine.redo(), true);
  assert.deepEqual(designEngine.document.surfaces[0].layers[0].elements[0], {
    ...element,
    x: 15,
    y: 17,
  });
  assert.deepEqual(designEngine.document.surfaces[0].layers[1].elements[0], {
    ...secondElement,
    x: 205,
    y: 97,
  });
  assert.equal(designEngine.canUndo(), true);
  assert.equal(designEngine.canRedo(), false);
});
