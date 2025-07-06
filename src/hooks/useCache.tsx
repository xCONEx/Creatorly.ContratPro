import { useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
}

class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes
  private maxSize = 100;

  constructor(options: CacheOptions = {}) {
    this.defaultTTL = options.ttl || this.defaultTTL;
    this.maxSize = options.maxSize || this.maxSize;
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.defaultTTL);

    // Remove expired entries
    this.cleanup();

    // Check if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) return false;

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Global cache instance
const globalCache = new CacheManager();

export const useCache = () => {
  const cacheRef = useRef(globalCache);

  const setCache = useCallback(<T,>(key: string, data: T, ttl?: number): void => {
    cacheRef.current.set(key, data, ttl);
  }, []);

  const getCache = useCallback(<T,>(key: string): T | null => {
    return cacheRef.current.get<T>(key);
  }, []);

  const hasCache = useCallback((key: string): boolean => {
    return cacheRef.current.has(key);
  }, []);

  const deleteCache = useCallback((key: string): boolean => {
    return cacheRef.current.delete(key);
  }, []);

  const clearCache = useCallback((): void => {
    cacheRef.current.clear();
  }, []);

  const getCacheStats = useCallback(() => {
    return cacheRef.current.getStats();
  }, []);

  return {
    setCache,
    getCache,
    hasCache,
    deleteCache,
    clearCache,
    getCacheStats
  };
};

// Hook específico para dados com cache
export const useCachedData = <T,>(
  key: string,
  fetcher: () => Promise<T>,
  options: { ttl?: number; enabled?: boolean } = {}
) => {
  const { setCache, getCache, hasCache } = useCache();
  const { ttl, enabled = true } = options;

  const getData = useCallback(async (forceRefresh = false): Promise<T | null> => {
    if (!enabled) return null;

    // Check cache first
    if (!forceRefresh && hasCache(key)) {
      return getCache<T>(key);
    }

    try {
      const data = await fetcher();
      setCache(key, data, ttl);
      return data;
    } catch (error) {
      console.error('Error fetching cached data:', error);
      return null;
    }
  }, [key, fetcher, setCache, getCache, hasCache, ttl, enabled]);

  return {
    getData,
    hasCachedData: () => hasCache(key),
    getCachedData: () => getCache<T>(key)
  };
}; 