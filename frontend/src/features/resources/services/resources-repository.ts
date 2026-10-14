import type { PrintResource, ResourceFileRef } from '../data/resources.data';
import { resourceFixtures } from '../data/resources.data';
import { findResourceCreatorProfile, getResourceCreatorSession } from './resources-auth-repository';
const PREFIX = 'printshop-resources:';
const RESOURCE_KEY = `${PREFIX}records:v1`;
const DB_NAME = 'printshop-resources-assets';
const STORE = 'assets';
const read = <T,>(key: string, fallback: T): T => { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; } };
const write = <T,>(key: string, value: T) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* The in-memory UI remains usable. */ } };
export function listResources(): PrintResource[] { return [...read<PrintResource[]>(RESOURCE_KEY, []), ...resourceFixtures]; }
export function findResource(id: string): PrintResource | null { return listResources().find((item) => item.id === id) ?? null; }
export function saveResource(resource: PrintResource): PrintResource { write(RESOURCE_KEY, [...read<PrintResource[]>(RESOURCE_KEY, []).filter((item) => item.id !== resource.id), resource]); return resource; }
export function removeResource(id: string) { write(RESOURCE_KEY, read<PrintResource[]>(RESOURCE_KEY, []).filter((item) => item.id !== id)); }
export function currentCreator() {
  const session = getResourceCreatorSession();
  return session ? findResourceCreatorProfile(session.email) : null;
}
function openDb() { return new Promise<IDBDatabase>((resolve, reject) => { const request = indexedDB.open(DB_NAME, 1); request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE, { keyPath: 'id' }); }; request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error ?? new Error('No se pudo abrir el almacenamiento de archivos.')); }); }
export async function storeResourceFile(file: File, kind: ResourceFileRef['kind']): Promise<ResourceFileRef> { const id = `resource-file-${crypto.randomUUID()}`; const ref: ResourceFileRef = { id, name: file.name, mimeType: file.type || 'application/octet-stream', sizeBytes: file.size, storageKey: id, kind }; const db = await openDb(); try { await new Promise<void>((resolve, reject) => { const request = db.transaction(STORE, 'readwrite').objectStore(STORE).put({ id, blob: file }); request.onsuccess = () => resolve(); request.onerror = () => reject(request.error ?? new Error('No se pudo guardar el archivo.')); }); } finally { db.close(); } return ref; }
export async function getResourceBlob(ref: ResourceFileRef): Promise<Blob | null> { if (!ref.storageKey) return null; const storageKey = ref.storageKey; const db = await openDb(); try { return await new Promise<Blob | null>((resolve, reject) => { const request = db.transaction(STORE, 'readonly').objectStore(STORE).get(storageKey); request.onsuccess = () => resolve((request.result?.blob as Blob | undefined) ?? null); request.onerror = () => reject(request.error ?? new Error('No se pudo leer el archivo.')); }); } finally { db.close(); } }
export async function resolveResourceUrl(ref?: ResourceFileRef): Promise<string | null> { if (!ref) return null; if (ref.assetUrl) return ref.assetUrl; const blob = await getResourceBlob(ref); return blob ? URL.createObjectURL(blob) : null; }
export async function downloadResource(resource: PrintResource) {
  let downloaded = 0;
  for (const ref of resource.originals) {
    const blob = await getResourceBlob(ref);
    const href = blob ? URL.createObjectURL(blob) : ref.assetUrl;
    if (!href) continue;
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.download = ref.name;
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    downloaded += 1;
    if (blob) window.setTimeout(() => URL.revokeObjectURL(href), 1000);
  }
  if (!downloaded) throw new Error('No hay archivos originales disponibles.');
}
