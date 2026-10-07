export { createDocumentFromCanvasState } from './document-adapter';
export type { CreateDocumentFromCanvasStateInput } from './document-adapter';
export {
  assertPrintShopDocument,
  createPrintShopDocument,
  deserializeDocument,
  isPrintShopDocument,
  serializeDocument,
} from '../../../../../engine/src/document';
export type { CreatePrintShopDocumentInput } from '../../../../../engine/src/document';
export { CURRENT_DOCUMENT_SCHEMA_VERSION } from '../../../../../engine/src/document';
