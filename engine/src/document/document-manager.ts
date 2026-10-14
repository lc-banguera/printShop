import type {
  BleedConfig,
  CoordinateSystem,
  DocumentMetadata,
  Layer,
  PrintableArea,
  PrintShopDocument,
  ProductSurface,
  SafeArea,
} from '../types';
import type { DesignElement } from '../types';
import { assertValidVectorPath } from '../paths';
import { CURRENT_DOCUMENT_SCHEMA_VERSION } from './schema-version';

export interface CreatePrintShopDocumentInput {
  id: string;
  createdAt: string;
  updatedAt: string;
  product: PrintShopDocument['product'];
  surfaces: ProductSurface[];
  metadata?: DocumentMetadata;
}

export function createPrintShopDocument(input: CreatePrintShopDocumentInput): PrintShopDocument {
  const document: PrintShopDocument = {
    ...input,
    schemaVersion: CURRENT_DOCUMENT_SCHEMA_VERSION,
    metadata: input.metadata === undefined ? {} : input.metadata,
  };

  assertPrintShopDocument(document);
  return document;
}

export function isPrintShopDocument(value: unknown): value is PrintShopDocument {
  if (!isRecord(value)) return false;

  return (
    isString(value.id) &&
    isString(value.schemaVersion) &&
    isString(value.createdAt) &&
    isString(value.updatedAt) &&
    isProductReference(value.product) &&
    Array.isArray(value.surfaces) &&
    value.surfaces.every(isProductSurface) &&
    isDocumentMetadata(value.metadata)
  );
}

export function assertPrintShopDocument(value: unknown): asserts value is PrintShopDocument {
  if (!isPrintShopDocument(value)) {
    throw new TypeError('Invalid PrintShopDocument structure.');
  }

  if (value.schemaVersion !== CURRENT_DOCUMENT_SCHEMA_VERSION) {
    throw new RangeError(`Unsupported document schema version: ${value.schemaVersion}`);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isOptional<T>(
  value: unknown,
  guard: (candidate: unknown) => candidate is T
): value is T | undefined {
  return value === undefined || guard(value);
}

function isProductReference(value: unknown): value is PrintShopDocument['product'] {
  return isRecord(value) && isString(value.id);
}

function isPrintableArea(value: unknown): value is PrintableArea {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.name) &&
    isFiniteNumber(value.x) &&
    isFiniteNumber(value.y) &&
    isFiniteNumber(value.width) &&
    isFiniteNumber(value.height) &&
    isOptional(value.rotation, isFiniteNumber) &&
    typeof value.enabled === 'boolean' &&
    typeof value.visible === 'boolean'
  );
}

function isSafeArea(value: unknown): value is SafeArea {
  return (
    isRecord(value) &&
    isFiniteNumber(value.x) &&
    isFiniteNumber(value.y) &&
    isFiniteNumber(value.width) &&
    isFiniteNumber(value.height)
  );
}

function isBleedConfig(value: unknown): value is BleedConfig {
  return (
    isRecord(value) &&
    isFiniteNumber(value.top) &&
    isFiniteNumber(value.right) &&
    isFiniteNumber(value.bottom) &&
    isFiniteNumber(value.left) &&
    (value.unit === 'px' || value.unit === 'mm')
  );
}

function isCoordinateSystem(value: unknown): value is CoordinateSystem {
  return (
    isRecord(value) &&
    value.origin === 'top-left' &&
    value.unit === 'px' &&
    isFiniteNumber(value.width) &&
    isFiniteNumber(value.height)
  );
}

function isLayer(value: unknown): value is Layer {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.name) &&
    isFiniteNumber(value.order) &&
    typeof value.locked === 'boolean' &&
    typeof value.visible === 'boolean' &&
    Array.isArray(value.elements) &&
    value.elements.every(isDesignElement)
  );
}

function isProductSurface(value: unknown): value is ProductSurface {
  return (
    isRecord(value) &&
    isPrintableZoneId(value.id) &&
    isString(value.name) &&
    isPrintableArea(value.printableArea) &&
    value.printableArea.id === value.id &&
    isOptional(value.safeArea, isSafeArea) &&
    isOptional(value.bleed, isBleedConfig) &&
    Array.isArray(value.layers) &&
    value.layers.every(
      (layer) => isLayer(layer) && layer.elements.every((element) => element.zoneId === value.id)
    ) &&
    isCoordinateSystem(value.coordinateSystem)
  );
}

function isPrintableZoneId(value: unknown): value is ProductSurface['id'] {
  return (
    value === 'front' ||
    value === 'back' ||
    value === 'sleeve_left' ||
    value === 'sleeve_right' ||
    value === 'label'
  );
}

function isDesignElement(value: unknown): value is DesignElement {
  if (
    !isRecord(value) ||
    !isString(value.id) ||
    !isElementType(value.type) ||
    (value.layer !== 'user' && value.layer !== 'guide') ||
    !isPrintableZoneId(value.zoneId) ||
    !isFiniteNumber(value.x) ||
    !isFiniteNumber(value.y) ||
    !isFiniteNumber(value.width) ||
    !isFiniteNumber(value.height)
  ) {
    return false;
  }

  return (
    isOptional(value.image, isString) &&
    isOptional(value.originalImageSrc, isString) &&
    isOptional(value.rotation, isFiniteNumber) &&
    isOptional(value.scaleX, isFiniteNumber) &&
    isOptional(value.scaleY, isFiniteNumber) &&
    isOptional(value.fill, isString) &&
    isOptional(value.stroke, isString) &&
    isOptional(value.strokeWidth, isFiniteNumber) &&
    isOptional(value.opacity, isFiniteNumber) &&
    isOptional(value.name, isString) &&
    isOptional(value.locked, isBoolean) &&
    isOptional(value.visible, isBoolean) &&
    isOptional(value.filters, isArtworkFilters) &&
    isOptional(value.textContent, isString) &&
    isOptional(value.fontFamily, isString) &&
    isOptional(value.fontWeight, isStringOrNumber) &&
    isOptional(value.fontSize, isFiniteNumber) &&
    isOptional(value.textAlign, isTextAlignment) &&
    isOptional(value.letterSpacing, isFiniteNumber) &&
    isOptional(value.lineHeight, isFiniteNumber) &&
    isOptional(value.path, isDocumentPath) &&
    (value.type !== 'path' || isDocumentPath(value.path)) &&
    (value.path === undefined || value.type === 'path')
  );
}

function isElementType(value: unknown): value is DesignElement['type'] {
  return value === 'rectangle' || value === 'circle' || value === 'text' || value === 'image' || value === 'group' || value === 'path';
}

function isDocumentPath(value: unknown): value is NonNullable<DesignElement['path']> {
  if (!isRecord(value) || value.schemaVersion !== '1.0.0' || typeof value.closed !== 'boolean') {
    return false;
  }
  try {
    assertValidVectorPath(value as unknown as NonNullable<DesignElement['path']>);
    return true;
  } catch {
    return false;
  }
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

function isStringOrNumber(value: unknown): value is string | number {
  return isString(value) || isFiniteNumber(value);
}

function isTextAlignment(value: unknown): value is 'left' | 'center' | 'right' {
  return value === 'left' || value === 'center' || value === 'right';
}

function isArtworkFilters(value: unknown): value is NonNullable<DesignElement['filters']> {
  if (!isRecord(value)) return false;

  return (
    isFiniteNumber(value.brightness) &&
    isFiniteNumber(value.contrast) &&
    isFiniteNumber(value.saturation) &&
    isFiniteNumber(value.grayscale) &&
    isFiniteNumber(value.sepia) &&
    isFiniteNumber(value.invert) &&
    isFiniteNumber(value.blur)
  );
}

function isDocumentMetadata(value: unknown): value is DocumentMetadata {
  if (
    !isRecord(value) ||
    (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null)
  ) {
    return false;
  }
  return Object.values(value).every((entry) => isJsonValue(entry, new Set()));
}

function isJsonValue(value: unknown, ancestors: Set<object>): boolean {
  if (value === null || isString(value) || typeof value === 'boolean') return true;
  if (isFiniteNumber(value)) return true;
  if (typeof value !== 'object') return false;

  if (ancestors.has(value)) return false;
  ancestors.add(value);

  const isPlainObject =
    Array.isArray(value) ||
    Object.getPrototypeOf(value) === Object.prototype ||
    Object.getPrototypeOf(value) === null;
  const isValid = isPlainObject && Object.values(value).every((entry) => isJsonValue(entry, ancestors));

  ancestors.delete(value);
  return isValid;
}
