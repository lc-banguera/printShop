import assert from 'node:assert/strict';
import test from 'node:test';
import engine from '../dist/index.js';

const {
  CURRENT_DOCUMENT_SCHEMA_VERSION,
  createPrintShopDocument,
  deserializeDocument,
  serializeDocument,
} = engine;

function createDocument(element) {
  return createPrintShopDocument({
    id: 'path-document',
    createdAt: '2026-10-08T00:00:00.000Z',
    updatedAt: '2026-10-08T00:00:00.000Z',
    product: { id: 'designer3-canvas' },
    surfaces: [{
      id: 'front',
      name: 'Canvas',
      printableArea: {
        id: 'front',
        name: 'Canvas',
        x: 0,
        y: 0,
        width: 600,
        height: 800,
        enabled: true,
        visible: true,
      },
      layers: [{
        id: 'path-layer',
        name: 'Path',
        order: 0,
        locked: false,
        visible: true,
        elements: element ? [element] : [],
      }],
      coordinateSystem: { origin: 'top-left', unit: 'px', width: 600, height: 800 },
    }],
  });
}

const pathElement = {
  id: 'path-1',
  type: 'path',
  layer: 'user',
  zoneId: 'front',
  x: 80,
  y: 100,
  width: 240,
  height: 180,
  path: {
    schemaVersion: '1.0.0',
    id: 'vector-path-1',
    closed: true,
    anchors: [
      { id: 'a', x: 80, y: 100, type: 'CORNER' },
      {
        id: 'b',
        x: 320,
        y: 100,
        type: 'SMOOTH',
        handleIn: { x: 260, y: 100 },
        handleOut: { x: 380, y: 100 },
      },
      { id: 'c', x: 200, y: 280, type: 'CORNER' },
    ],
    segments: [
      { id: 'ab', type: 'CUBIC_BEZIER', startAnchorId: 'a', endAnchorId: 'b' },
      { id: 'bc', type: 'LINE', startAnchorId: 'b', endAnchorId: 'c' },
      { id: 'ca', type: 'LINE', startAnchorId: 'c', endAnchorId: 'a' },
    ],
  },
};

test('versioned path elements survive document JSON round-trip', () => {
  const document = createDocument(pathElement);
  const roundTrip = deserializeDocument(serializeDocument(document));

  assert.equal(CURRENT_DOCUMENT_SCHEMA_VERSION, '1.1.0');
  assert.equal(roundTrip.surfaces[0].layers[0].elements[0].path.schemaVersion, '1.0.0');
  assert.deepEqual(roundTrip.surfaces[0].layers[0].elements[0], pathElement);
});

test('open path elements retain their segments and anchors after serialization', () => {
  const openElement = structuredClone(pathElement);
  openElement.path.closed = false;
  openElement.path.anchors = openElement.path.anchors.slice(0, 2);
  openElement.path.segments = openElement.path.segments.slice(0, 1);

  const roundTrip = deserializeDocument(serializeDocument(createDocument(openElement)));

  assert.deepEqual(roundTrip.surfaces[0].layers[0].elements[0], openElement);
});

test('legacy 1.0 documents migrate without changing their existing content', () => {
  const legacy = createDocument(null);
  legacy.schemaVersion = '1.0.0';
  legacy.metadata = { title: 'Legacy canvas', widthPx: 600, heightPx: 800 };

  const migrated = deserializeDocument(JSON.stringify(legacy));

  assert.equal(migrated.schemaVersion, CURRENT_DOCUMENT_SCHEMA_VERSION);
  assert.deepEqual(migrated.surfaces, legacy.surfaces);
  assert.deepEqual(migrated.metadata, legacy.metadata);
});

test('path elements require supported versioned and structurally valid geometry', () => {
  const missingVersion = structuredClone(pathElement);
  delete missingVersion.path.schemaVersion;
  assert.throws(() => createDocument(missingVersion), /Invalid PrintShopDocument/);

  const malformedSegment = structuredClone(pathElement);
  malformedSegment.path.segments[0].endAnchorId = 'missing-anchor';
  assert.throws(() => createDocument(malformedSegment), /Invalid PrintShopDocument/);

  const wrongElementType = structuredClone(pathElement);
  wrongElementType.type = 'image';
  assert.throws(() => createDocument(wrongElementType), /Invalid PrintShopDocument/);
});

test('unsupported document schema versions remain rejected', () => {
  const unsupported = createDocument(null);
  unsupported.schemaVersion = '9.0.0';
  assert.throws(() => deserializeDocument(JSON.stringify(unsupported)), /Unsupported document schema version/);
});