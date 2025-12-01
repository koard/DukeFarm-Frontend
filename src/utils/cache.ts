/**
 * Cache utility with TTL (Time-To-Live) support
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // milliseconds
}

export class CacheManager {
  /**
   * Set cache with TTL
   * @param key - Cache key
   * @param data - Data to cache
   * @param ttlMinutes - Time to live in minutes (default: 30 minutes)
   */
  static set<T>(key: string, data: T, ttlMinutes: number = 30): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000, // convert to milliseconds
    };
    sessionStorage.setItem(key, JSON.stringify(item));
  }

  /**
   * Get cache if not expired
   * @param key - Cache key
   * @returns Cached data or null if expired/not found
   */
  static get<T>(key: string): T | null {
    try {
      const itemStr = sessionStorage.getItem(key);
      if (!itemStr) return null;

      const item: CacheItem<T> = JSON.parse(itemStr);
      const now = Date.now();
      const age = now - item.timestamp;

      // Check if expired
      if (age > item.ttl) {
        console.log(`Cache expired for key: ${key} (age: ${Math.round(age / 1000 / 60)}min)`);
        this.remove(key);
        return null;
      }

      console.log(`Cache hit for key: ${key} (age: ${Math.round(age / 1000 / 60)}min)`);
      return item.data;
    } catch (error) {
      console.error(`Error reading cache for key: ${key}`, error);
      return null;
    }
  }

  /**
   * Remove cache item
   */
  static remove(key: string): void {
    sessionStorage.removeItem(key);
  }

  /**
   * Clear all cache
   */
  static clear(): void {
    sessionStorage.clear();
  }

  /**
   * Check if cache exists and is valid
   */
  static has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Get cache age in minutes
   */
  static getAge(key: string): number | null {
    try {
      const itemStr = sessionStorage.getItem(key);
      if (!itemStr) return null;

      const item: CacheItem<unknown> = JSON.parse(itemStr);
      const age = Date.now() - item.timestamp;
      return Math.round(age / 1000 / 60); // return in minutes
    } catch {
      return null;
    }
  }
}

// Cache TTL configurations (in minutes)
export const CACHE_TTL = {
  DASHBOARD: 15,      // Dashboard data: 15 minutes
  WEATHER: 30,        // Weather data: 30 minutes  
  USER_PROFILE: 60,   // User profile: 1 hour
  STATIC: 1440,       // Static data: 24 hours
} as const;
