import { createPrintShopDocument } from "@/core/design/document";
import type {
  DocumentMetadata,
  Layer,
  PrintShopDocument,
  ProductSurface,
} from "@/core/design/types";

const DATABASE_NAME = "printshop-designer3-documents";
const DATABASE_VERSION = 1;
const DOCUMENT_STORE = "documents";
const writeQueues = new Map<string, Promise<void>>();

export type Designer3Mode = "easy" | "advanced";

export interface Designer3CanvasConfig {
  widthPx: number;
  heightPx: number;
  dpi: number;
  background: "transparent" | "white" | "color";
  backgroundColor: string;
}

export interface Designer3DocumentSession {
  id: string;
  document: PrintShopDocument;
  easySnapshot?: unknown;
  easyUpdatedAt?: string;
  advancedSnapshot?: unknown;
  advancedUpdatedAt?: string;
  updatedAt: string;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(DOCUMENT_STORE)) {
        database.createObjectStore(DOCUMENT_STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("No se pudo abrir IndexedDB."));
    request.onblocked = () => reject(new Error("La base de documentos está bloqueada por otra pestaña."));
  });
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Error al acceder al documento."));
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("No se pudo leer el recurso del documento."));
    };
    reader.onerror = () => reject(reader.error ?? new Error("No se pudo leer el recurso del documento."));
    reader.readAsDataURL(blob);
  });
}

async function makeSnapshotPersistent(value: unknown): Promise<unknown> {
  if (typeof value === "string" && value.startsWith("blob:")) {
    const response = await fetch(value);
    if (!response.ok) throw new Error("No se pudo conservar un recurso temporal del documento.");
    return blobToDataUrl(await response.blob());
  }
  if (Array.isArray(value)) {
    return Promise.all(value.map((item) => makeSnapshotPersistent(item)));
  }
  if (typeof value === "object" && value !== null && !(value instanceof Blob)) {
    const entries = await Promise.all(
      Object.entries(value).map(async ([key, item]) => [key, await makeSnapshotPersistent(item)] as const),
    );
    return Object.fromEntries(entries);
  }
  return value;
}

function createCanvasSurface(config: Designer3CanvasConfig): ProductSurface {
  return {
    id: "front",
    name: "Lienzo",
    printableArea: {
      id: "front",
      name: "Lienzo",
      x: 0,
      y: 0,
      width: config.widthPx,
      height: config.heightPx,
      enabled: true,
      visible: true,
    },
    layers: [],
    coordinateSystem: {
      origin: "top-left",
      unit: "px",
      width: config.widthPx,
      height: config.heightPx,
    },
  };
}

export function updateDesigner3DocumentModel(
  document: PrintShopDocument,
  config: Designer3CanvasConfig,
  layers: Layer[],
  metadata: DocumentMetadata = {},
): PrintShopDocument {
  const currentSurface =
    document.surfaces.find((surface) => surface.id === "front") ??
    createCanvasSurface(config);
  const now = new Date().toISOString();
  const surface: ProductSurface = {
    ...currentSurface,
    printableArea: {
      ...currentSurface.printableArea,
      width: config.widthPx,
      height: config.heightPx,
    },
    coordinateSystem: {
      ...currentSurface.coordinateSystem,
      width: config.widthPx,
      height: config.heightPx,
    },
    layers,
  };
  return createPrintShopDocument({
    ...document,
    updatedAt: now,
    surfaces: [
      surface,
      ...document.surfaces.filter((item) => item.id !== "front"),
    ],
    metadata: {
      ...document.metadata,
      ...metadata,
      widthPx: config.widthPx,
      heightPx: config.heightPx,
      dpi: config.dpi,
      unit: "px",
      background: config.background,
      backgroundColor: config.backgroundColor,
    },
  });
}

export function createDesigner3DocumentId(): string {
  return crypto.randomUUID();
}

export async function createDesigner3Document(
  id: string,
  title: string,
  config: Designer3CanvasConfig,
): Promise<Designer3DocumentSession> {
  const now = new Date().toISOString();
  const document = createPrintShopDocument({
    id,
    createdAt: now,
    updatedAt: now,
    product: { id: "designer3-canvas" },
    surfaces: [createCanvasSurface(config)],
    metadata: {
      title,
      widthPx: config.widthPx,
      heightPx: config.heightPx,
      dpi: config.dpi,
      unit: "px",
      background: config.background,
      backgroundColor: config.backgroundColor,
    },
  });
  const session: Designer3DocumentSession = {
    id,
    document,
    updatedAt: now,
  };
  const database = await openDatabase();
  try {
    await requestResult(
      database.transaction(DOCUMENT_STORE, "readwrite")
        .objectStore(DOCUMENT_STORE)
        .put(session),
    );
  } finally {
    database.close();
  }
  return session;
}

export async function loadDesigner3Document(
  id: string,
): Promise<Designer3DocumentSession | null> {
  const database = await openDatabase();
  try {
    const result = await requestResult<Designer3DocumentSession | undefined>(
      database.transaction(DOCUMENT_STORE, "readonly")
        .objectStore(DOCUMENT_STORE)
        .get(id),
    );
    return result ?? null;
  } finally {
    database.close();
  }
}

async function writeDesigner3Snapshot(
  id: string,
  mode: Designer3Mode,
  snapshot: unknown,
  document?: PrintShopDocument,
): Promise<void> {
  const persistentSnapshot = await makeSnapshotPersistent(snapshot);
  const persistentDocument = document
    ? (await makeSnapshotPersistent(document)) as PrintShopDocument
    : undefined;
  const database = await openDatabase();
  try {
    const transaction = database.transaction(DOCUMENT_STORE, "readwrite");
    const transactionComplete = new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("No se pudo guardar el documento."));
      transaction.onabort = () => reject(transaction.error ?? new Error("Se canceló el guardado del documento."));
    });
    const store = transaction.objectStore(DOCUMENT_STORE);
    const existing = await requestResult<Designer3DocumentSession | undefined>(
      store.get(id),
    );
    if (!existing) {
      transaction.abort();
      await transactionComplete.catch(() => undefined);
      throw new Error(`No existe el documento Designer 3 "${id}".`);
    }
    const updatedAt = new Date().toISOString();
    const changedDocument = persistentDocument
      ? { ...persistentDocument, updatedAt }
      : { ...existing.document, updatedAt };
    store.put({
      ...existing,
      document: changedDocument,
      [mode === "easy" ? "easySnapshot" : "advancedSnapshot"]: persistentSnapshot,
      [mode === "easy" ? "easyUpdatedAt" : "advancedUpdatedAt"]: updatedAt,
      updatedAt,
    } satisfies Designer3DocumentSession);
    await transactionComplete;
  } finally {
    database.close();
  }
}

export function saveDesigner3Snapshot(
  id: string,
  mode: Designer3Mode,
  snapshot: unknown,
  document?: PrintShopDocument,
): Promise<void> {
  const previous = writeQueues.get(id) ?? Promise.resolve();
  const next = previous
    .catch(() => undefined)
    .then(() => writeDesigner3Snapshot(id, mode, snapshot, document));
  writeQueues.set(id, next);
  return next.finally(() => {
    if (writeQueues.get(id) === next) writeQueues.delete(id);
  });
}
