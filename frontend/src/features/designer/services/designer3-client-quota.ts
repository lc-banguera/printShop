export const DESIGNER3_CLIENT_DAILY_LIMIT = (() => {
  const configured = Number(import.meta.env.VITE_DESIGNER3_CLIENT_DAILY_LIMIT);
  return Number.isFinite(configured) && configured >= 0 ? Math.floor(configured) : null;
})();

const STORAGE_KEY = 'printshop:designer3-client-quota:v1';
const QUOTA_UPDATED_EVENT = 'printshop:designer3-client-quota-updated';

interface StoredQuotaUsage {
  userId: string;
  date: string;
  used: number;
}

export interface Designer3ClientQuota {
  limit: number | null;
  used: number;
  remaining: number | null;
}

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function readUsage(userId: string): StoredQuotaUsage {
  const fallback = { userId, date: getTodayKey(), used: 0 };
  if (typeof window === 'undefined') return fallback;

  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null') as Partial<StoredQuotaUsage> | null;
    if (parsed?.userId !== userId || parsed.date !== fallback.date || !Number.isFinite(parsed.used)) return fallback;
    return { userId, date: fallback.date, used: Math.max(0, Math.floor(Number(parsed.used))) };
  } catch {
    return fallback;
  }
}

function writeUsage(usage: StoredQuotaUsage) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
  window.dispatchEvent(new CustomEvent(QUOTA_UPDATED_EVENT));
}

export function getDesigner3ClientQuota(userId: string | null | undefined): Designer3ClientQuota | null {
  if (!userId) return null;
  const usage = readUsage(userId);
  return {
    limit: DESIGNER3_CLIENT_DAILY_LIMIT,
    used: usage.used,
    remaining: DESIGNER3_CLIENT_DAILY_LIMIT === null
      ? null
      : Math.max(0, DESIGNER3_CLIENT_DAILY_LIMIT - usage.used),
  };
}

export function canConsumeDesigner3ClientOperation(userId: string | null | undefined): boolean {
  const quota = getDesigner3ClientQuota(userId);
  return Boolean(quota && (quota.limit === null || (quota.remaining !== null && quota.remaining > 0)));
}

export function consumeDesigner3ClientOperation(userId: string | null | undefined): Designer3ClientQuota | null {
  if (!userId || !canConsumeDesigner3ClientOperation(userId)) return getDesigner3ClientQuota(userId);
  const usage = readUsage(userId);
  writeUsage({ ...usage, used: usage.used + 1 });
  return getDesigner3ClientQuota(userId);
}

export function getDesigner3ClientQuotaUpdatedEventName() {
  return QUOTA_UPDATED_EVENT;
}
