import { assertPrintShopDocument } from './document-manager';
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
  const parsed: unknown = JSON.parse(serialized);
  assertPrintShopDocument(parsed);
  return parsed;
}
