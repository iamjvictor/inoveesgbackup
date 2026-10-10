/**
 * Generic Cache Interface.
 * All methods return Promises to ensure compatibility with remote caches like Redis.
 */
export interface CacheProvider {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T, ttlMs?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * In-Memory Implementation of CacheProvider.
 */
class InMemoryCacheProvider implements CacheProvider {
  private store = new Map<string, CacheEntry<any>>();
  private sweepInterval: NodeJS.Timeout;

  constructor() {
    // Varre entradas expiradas a cada 5 minutos
    this.sweepInterval = setInterval(() => this.sweep(), 5 * 60 * 1000);
    this.sweepInterval.unref(); // não mantém o processo ativo no fechamento
  }

  private sweep() {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  async get<T>(key: string): Promise<T | undefined> {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    const duration = ttlMs ?? 5 * 60 * 1000; // Default: 5 minutes
    this.store.set(key, { value, expiresAt: Date.now() + duration });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}

// Export the active provider instance.
// In the future, this can switch to RedisCacheProvider based on env variables.
export const cache: CacheProvider = new InMemoryCacheProvider();
