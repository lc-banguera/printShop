export { assertPrintShopDocument, createPrintShopDocument, isPrintShopDocument } from './document-manager';
export type { CreatePrintShopDocumentInput } from './document-manager';
export { deserializeDocument, serializeDocument } from './serializer';
export {
	CURRENT_DOCUMENT_SCHEMA_VERSION,
	LEGACY_DOCUMENT_SCHEMA_VERSION,
} from './schema-version';
