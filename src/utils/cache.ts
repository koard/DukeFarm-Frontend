type CacheRecord<T> = {
  value: T;
  expiresAt: number | null;
};

const store = new Map<string, CacheRecord<unknown>>();

export const CACHE_TTL = {
  DASHBOARD: 5 * 60 * 1000, // 5 minutes
  WEATHER: 2 * 60 * 1000, // 2 minutes
  SHORT: 30 * 1000, // fallback for quick fetches
} as const;

const now = () => Date.now();

const isExpired = (record?: CacheRecord<unknown> | null) => {
  if (!record) {
    return true;
  }

  if (record.expiresAt === null) {
    return false;
  }

  return record.expiresAt <= now();
};

export const CacheManager = {
  get<T>(key: string): T | null {
    const record = store.get(key);
    if (isExpired(record)) {
      if (record) {
        store.delete(key);
      }
      return null;
    }

    return (record?.value as T) ?? null;
  },

  set<T>(key: string, value: T, ttlMs: number | null = CACHE_TTL.SHORT): void {
    const expiresAt = typeof ttlMs === 'number' && ttlMs > 0 ? now() + ttlMs : null;
    store.set(key, { value, expiresAt });
  },

  remove(key: string): void {
    store.delete(key);
  },

  clear(): void {
    store.clear();
  },
};
