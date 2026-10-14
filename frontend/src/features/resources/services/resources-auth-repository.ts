export interface ResourceCreatorProfile {
  id: string;
  email: string;
  publicName: string;
  bio: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceCreatorSession {
  profileId: string;
  email: string;
  verifiedAt: string;
}

const PREFIX = 'printshop-resources-creator:';
const PROFILE_KEY = `${PREFIX}profiles:v1`;
const SESSION_KEY = `${PREFIX}session:v1`;

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
    // The current session can still be used when persistent storage is unavailable.
  }
}

export function listResourceCreatorProfiles(): ResourceCreatorProfile[] {
  return readJson<ResourceCreatorProfile[]>(PROFILE_KEY, []);
}

export function findResourceCreatorProfile(email: string): ResourceCreatorProfile | null {
  const normalized = email.trim().toLowerCase();
  return listResourceCreatorProfiles().find((profile) => profile.email === normalized) ?? null;
}

export function saveResourceCreatorProfile(input: { email: string; publicName: string; bio: string }): ResourceCreatorProfile {
  const email = input.email.trim().toLowerCase();
  const existing = findResourceCreatorProfile(email);
  const now = new Date().toISOString();
  const profile: ResourceCreatorProfile = {
    id: existing?.id ?? `resource-creator-${crypto.randomUUID()}`,
    email,
    publicName: input.publicName.trim(),
    bio: input.bio.trim(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  writeJson(PROFILE_KEY, [...listResourceCreatorProfiles().filter((item) => item.email !== email), profile]);
  return profile;
}

export function getResourceCreatorSession(): ResourceCreatorSession | null {
  return readJson<ResourceCreatorSession | null>(SESSION_KEY, null);
}

export function setResourceCreatorSession(profile: ResourceCreatorProfile): ResourceCreatorSession {
  const session = { profileId: profile.id, email: profile.email, verifiedAt: new Date().toISOString() };
  writeJson(SESSION_KEY, session);
  return session;
}

export function clearResourceCreatorSession(): void {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // Ignore storage failures.
  }
}
