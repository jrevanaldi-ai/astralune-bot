import { SimpleCache } from './index.js';

export class GlobalCache {
  constructor() {
    this.caches = new Map();
  }

  createCache(name, ttl = 60000) {
    if (!this.caches.has(name)) {
      this.caches.set(name, new SimpleCache(ttl));
    }
    return this.caches.get(name);
  }

  getCache(name) {
    return this.caches.get(name);
  }

  removeCache(name) {
    return this.caches.delete(name);
  }

  clearAll() {
    this.caches.clear();
  }

  getStats() {
    const stats = {};
    for (const [name, cache] of this.caches) {
      stats[name] = {
        size: 'N/A',
        ttl: cache.ttl
      };
    }
    return stats;
  }
}

export const globalCache = new GlobalCache();

export class MemoryStore {
  constructor() {
    this.store = new Map();
  }

  set(key, value, ttl = null) {
    if (ttl) {
      setTimeout(() => {
        this.store.delete(key);
      }, ttl);
    }
    this.store.set(key, { value, timestamp: Date.now() });
  }

  get(key) {
    const item = this.store.get(key);
    if (!item) return undefined;
    return item.value;
  }

  delete(key) {
    return this.store.delete(key);
  }

  has(key) {
    return this.store.has(key);
  }

  clear() {
    this.store.clear();
  }

  size() {
    return this.store.size;
  }

  keys() {
    return Array.from(this.store.keys());
  }

  values() {
    return Array.from(this.store.values()).map(item => item.value);
  }
}

export const memoryStore = new MemoryStore();