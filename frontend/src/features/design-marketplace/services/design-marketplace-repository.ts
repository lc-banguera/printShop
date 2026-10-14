import type { DesignPack, MarketplaceAssetRef } from '../data/design-packs.data';
import { designPackFixtures } from '../data/design-packs.data';

const PREFIX = 'printshop-design-marketplace:';
const PROFILE_KEY = `${PREFIX}profiles:v1`;
const PACK_KEY = `${PREFIX}packs:v1`;
const ACQUISITION_KEY = `${PREFIX}acquisitions:v1`;
const SALES_KEY = `${PREFIX}sales:v1`;
const SESSION_KEY = `${PREFIX}session:v1`;
const PENDING_KEY = `${PREFIX}pending-action:v1`;
const DATABASE_NAME = 'printshop-design-marketplace-assets';
const DATABASE_VERSION = 1;
const ASSET_STORE = 'assets';

export interface DesignMarketplaceProfile {
  id: string;
  email: string;
  publicName: string;
  bio: string;
  createdAt: string;
  updatedAt: string;
}

export interface DesignMarketplaceSession {
  profileId: string;
  email: string;
  verifiedAt: string;
}

export interface DesignAcquisition {
  id: string;
  packId: string;
  email: string;
  acquiredAt: string;
  kind: 'free' | 'demo_purchase';
}

export interface DesignSale {
  id: string;
  packId: string;
  creatorId: string;
  buyerEmail: string;
  amount: number;
  currency: 'USD';
  createdAt: string;
  kind: 'demo_purchase' | 'free_access';
}

export interface PendingMarketplaceAction {
  packId: string;
  returnTo: string;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage may be unavailable in private browsing; the interface still works for the current session.
  }
}

export function listMarketplaceProfiles(): DesignMarketplaceProfile[] {
  return readJson<DesignMarketplaceProfile[]>(PROFILE_KEY, []);
}

export function findMarketplaceProfile(email: string): DesignMarketplaceProfile | null {
  const normalized = email.trim().toLowerCase();
  return listMarketplaceProfiles().find((profile) => profile.email === normalized) ?? null;
}

export function saveMarketplaceProfile(input: { email: string; publicName: string; bio: string }): DesignMarketplaceProfile {
  const email = input.email.trim().toLowerCase();
  const existing = findMarketplaceProfile(email);
  const now = new Date().toISOString();
  const profile: DesignMarketplaceProfile = {
    id: existing?.id ?? `design-profile-${crypto.randomUUID()}`,
    email,
    publicName: input.publicName.trim(),
    bio: input.bio.trim(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  const profiles = listMarketplaceProfiles().filter((item) => item.email !== email);
  writeJson(PROFILE_KEY, [...profiles, profile]);
  return profile;
}

export function getMarketplaceSession(): DesignMarketplaceSession | null {
  return readJson<DesignMarketplaceSession | null>(SESSION_KEY, null);
}

export function setMarketplaceSession(profile: DesignMarketplaceProfile): DesignMarketplaceSession {
  const session = { profileId: profile.id, email: profile.email, verifiedAt: new Date().toISOString() };
  writeJson(SESSION_KEY, session);
  return session;
}

export function clearMarketplaceSession(): void {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // Ignore storage failures.
  }
}

export function setPendingMarketplaceAction(action: PendingMarketplaceAction): void {
  writeJson(PENDING_KEY, action);
}

export function consumePendingMarketplaceAction(): PendingMarketplaceAction | null {
  const action = readJson<PendingMarketplaceAction | null>(PENDING_KEY, null);
  try {
    window.localStorage.removeItem(PENDING_KEY);
  } catch {
    // Ignore storage failures.
  }
  return action;
}

export function listMarketplacePacks(): DesignPack[] {
  const custom = readJson<DesignPack[]>(PACK_KEY, []);
  return [...custom, ...designPackFixtures];
}

export function findMarketplacePack(id: string): DesignPack | null {
  return listMarketplacePacks().find((pack) => pack.id === id) ?? null;
}

export function saveMarketplacePack(pack: DesignPack): DesignPack {
  const custom = readJson<DesignPack[]>(PACK_KEY, []).filter((item) => item.id !== pack.id);
  writeJson(PACK_KEY, [...custom, pack]);
  return pack;
}

export function removeMarketplacePack(id: string): void {
  writeJson(PACK_KEY, readJson<DesignPack[]>(PACK_KEY, []).filter((pack) => pack.id !== id));
}

export function listMarketplaceAcquisitions(email: string): DesignAcquisition[] {
  return readJson<DesignAcquisition[]>(ACQUISITION_KEY, []).filter((item) => item.email === email.trim().toLowerCase());
}

export function hasMarketplaceAcquisition(email: string, packId: string): boolean {
  return listMarketplaceAcquisitions(email).some((item) => item.packId === packId);
}

export function acquireMarketplacePack(email: string, pack: DesignPack): DesignAcquisition {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = listMarketplaceAcquisitions(normalizedEmail).find((item) => item.packId === pack.id);
  if (existing) return existing;
  const acquisition: DesignAcquisition = {
    id: `design-acquisition-${crypto.randomUUID()}`,
    packId: pack.id,
    email: normalizedEmail,
    acquiredAt: new Date().toISOString(),
    kind: pack.access === 'free' ? 'free' : 'demo_purchase',
  };
  writeJson(ACQUISITION_KEY, [...readJson<DesignAcquisition[]>(ACQUISITION_KEY, []), acquisition]);
  const sale: DesignSale = {
    id: `design-sale-${crypto.randomUUID()}`,
    packId: pack.id,
    creatorId: pack.creatorId,
    buyerEmail: normalizedEmail,
    amount: pack.price,
    currency: pack.currency,
    createdAt: acquisition.acquiredAt,
    kind: pack.access === 'free' ? 'free_access' : 'demo_purchase',
  };
  writeJson(SALES_KEY, [...readJson<DesignSale[]>(SALES_KEY, []), sale]);
  return acquisition;
}

export function listMarketplaceSales(creatorId: string): DesignSale[] {
  return readJson<DesignSale[]>(SALES_KEY, []).filter((sale) => sale.creatorId === creatorId);
}

function openAssetDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(ASSET_STORE)) {
        request.result.createObjectStore(ASSET_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('No se pudo abrir el almacenamiento de archivos.'));
  });
}

export async function storeMarketplaceAsset(file: File, kind: MarketplaceAssetRef['kind']): Promise<MarketplaceAssetRef> {
  const id = `design-asset-${crypto.randomUUID()}`;
  const ref: MarketplaceAssetRef = { id, name: file.name, mimeType: file.type || 'application/octet-stream', sizeBytes: file.size, storageKey: id, kind };
  const database = await openAssetDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const request = database.transaction(ASSET_STORE, 'readwrite').objectStore(ASSET_STORE).put({ id, blob: file });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error ?? new Error('No se pudo guardar el archivo.'));
    });
  } finally {
    database.close();
  }
  return ref;
}

export async function getMarketplaceAsset(ref: MarketplaceAssetRef): Promise<Blob | null> {
  const storageKey = ref.storageKey;
  if (!storageKey) return null;
  const database = await openAssetDatabase();
  try {
    return await new Promise<Blob | null>((resolve, reject) => {
      const request = database.transaction(ASSET_STORE, 'readonly').objectStore(ASSET_STORE).get(storageKey);
      request.onsuccess = () => resolve((request.result?.blob as Blob | undefined) ?? null);
      request.onerror = () => reject(request.error ?? new Error('No se pudo leer el archivo.'));
    });
  } finally {
    database.close();
  }
}

export async function resolveMarketplaceAssetUrl(ref: MarketplaceAssetRef): Promise<string | null> {
  if (ref.assetUrl) return ref.assetUrl;
  const blob = await getMarketplaceAsset(ref);
  return blob ? URL.createObjectURL(blob) : null;
}

export async function downloadMarketplacePack(pack: DesignPack): Promise<void> {
  for (const ref of pack.originals) {
    const blob = await getMarketplaceAsset(ref);
    const href = blob ? URL.createObjectURL(blob) : ref.assetUrl;
    if (!href) continue;
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.download = ref.name;
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    if (blob) window.setTimeout(() => URL.revokeObjectURL(href), 1000);
  }
}
