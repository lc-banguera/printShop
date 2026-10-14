import { assertPrintShopDocument } from './document-manager';
import { CURRENT_DOCUMENT_SCHEMA_VERSION, LEGACY_DOCUMENT_SCHEMA_VERSION } from './schema-version';
import type { PrintShopDocument } from '../types';

export function serializeDocument(document: PrintShopDocument): string {
  assertPrintShopDocument(document);

  const serialized = JSON.stringify(document);
  if (serialized === undefined) {
    throw new TypeError('PrintShopDocument could not be serialized.');
  }

  return serialized;
}

export function deserializeDocument(serialized: string): PrintShopDocument {
  const parsed: unknown = migrateDocument(JSON.parse(serialized));
  assertPrintShopDocument(parsed);
  return parsed;
}

function migrateDocument(value: unknown): unknown {
  if (
    typeof value !== 'object' ||
    value === null ||
    Array.isArray(value) ||
    (value as Record<string, unknown>).schemaVersion !== LEGACY_DOCUMENT_SCHEMA_VERSION
  ) {
    return value;
  }
  return {
    ...(value as Record<string, unknown>),
    schemaVersion: CURRENT_DOCUMENT_SCHEMA_VERSION,
  };
}
