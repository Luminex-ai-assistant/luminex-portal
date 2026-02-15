/**
 * IndexedDB Cache for Offline Support
 * 
 * Provides caching and offline mutation queuing for the Google Sheets API layer.
 * Stores entities, query results, and pending mutations.
 */

// Database configuration
const DB_NAME = 'portal-sheets-cache';
const DB_VERSION = 1;

// Store names
const STORES = {
  ENTITIES: 'entities',
  QUERIES: 'queries',
  MUTATIONS: 'mutations',
} as const;

// Pending mutation types
export type MutationType = 'create' | 'update' | 'delete';

export interface PendingMutation<T = unknown> {
  /** Unique mutation ID */
  id: number;
  /** Entity type */
  entityType: string;
  /** Mutation type */
  type: MutationType;
  /** Entity data (for create/update) */
  data?: T;
  /** Entity ID (for update/delete) */
  entityId?: string;
  /** Timestamp when mutation was queued */
  timestamp: number;
  /** Number of retry attempts */
  retryCount: number;
  /** Last error message */
  lastError?: string;
}

export interface CacheEntry<T> {
  /** Cached data */
  data: T;
  /** Timestamp when cached */
  cachedAt: number;
  /** Time-to-live in milliseconds */
  ttlMs: number;
}

export interface QueryCacheEntry<T> {
  /** Query key */
  key: string;
  /** Query results */
  results: T[];
  /** Timestamp when cached */
  cachedAt: number;
  /** Time-to-live in milliseconds */
  ttlMs: number;
}

/**
 * IndexedDB Cache for offline support and performance.
 */
export class IndexedDBCache {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize the database connection.
   */
  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this.initializeDB();
    return this.initPromise;
  }

  /**
   * Get an entity from the cache.
   */
  async get<T>(entityType: string, entityId: string): Promise<T | null> {
    await this.init();
    
    const entry = await this.getFromStore<CacheEntry<T>>(
      STORES.ENTITIES,
      `${entityType}:${entityId}`
    );

    if (!entry) return null;

    // Check if expired
    if (Date.now() > entry.cachedAt + entry.ttlMs) {
      await this.delete(STORES.ENTITIES, `${entityType}:${entityId}`);
      return null;
    }

    return entry.data;
  }

  /**
   * Store an entity in the cache.
   */
  async set<T>(
    entityType: string,
    entityId: string,
    data: T,
    ttlMs: number = 5 * 60 * 1000
  ): Promise<void> {
    await this.init();

    const entry: CacheEntry<T> = {
      data,
      cachedAt: Date.now(),
      ttlMs,
    };

    await this.putInStore(STORES.ENTITIES, `${entityType}:${entityId}`, entry);
  }

  /**
   * Store multiple entities in the cache.
   */
  async setMany<T>(
    entityType: string,
    entities: Array<{ id: string; data: T }>,
    ttlMs: number = 5 * 60 * 1000
  ): Promise<void> {
    await this.init();

    const entries = entities.map(({ id, data }) => ({
      key: `${entityType}:${id}`,
      entry: {
        data,
        cachedAt: Date.now(),
        ttlMs,
      },
    }));

    await this.putManyInStore(STORES.ENTITIES, entries);
  }

  /**
   * Remove an entity from the cache.
   */
  async remove(entityType: string, entityId: string): Promise<void> {
    await this.init();
    await this.delete(STORES.ENTITIES, `${entityType}:${entityId}`);
  }

  /**
   * Clear all entities of a specific type.
   */
  async clearType(entityType: string): Promise<void> {
    await this.init();
    const store = this.db!.transaction(STORES.ENTITIES, 'readwrite').objectStore(STORES.ENTITIES);
    const index = store.index('entityType');
    
    return new Promise((resolve, reject) => {
      const request = index.openCursor(IDBKeyRange.only(entityType));
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Queue a mutation for later synchronization.
   */
  async queueMutation<T>(mutation: Omit<PendingMutation<T>, 'id' | 'timestamp' | 'retryCount'>): Promise<number> {
    await this.init();

    const pendingMutation: PendingMutation<T> = {
      ...mutation,
      id: Date.now() + Math.random(), // Simple ID generation
      timestamp: Date.now(),
      retryCount: 0,
    };

    await this.putInStore(STORES.MUTATIONS, pendingMutation.id, pendingMutation);
    return pendingMutation.id;
  }

  /**
   * Get all pending mutations.
   */
  async getPendingMutations<T>(): Promise<PendingMutation<T>[]> {
    await this.init();
    return this.getAllFromStore<PendingMutation<T>>(STORES.MUTATIONS);
  }

  /**
   * Get pending mutations for a specific entity type.
   */
  async getPendingMutationsForType<T>(entityType: string): Promise<PendingMutation<T>[]> {
    await this.init();
    return this.getAllFromIndex<PendingMutation<T>>(
      STORES.MUTATIONS,
      'entityType',
      entityType
    );
  }

  /**
   * Remove a pending mutation after successful sync.
   */
  async removeMutation(mutationId: number): Promise<void> {
    await this.init();
    await this.delete(STORES.MUTATIONS, mutationId);
  }

  /**
   * Update a mutation's retry status.
   */
  async updateMutationRetry(mutationId: number, error?: string): Promise<void> {
    await this.init();
    
    const mutation = await this.getFromStore<PendingMutation>(STORES.MUTATIONS, mutationId);
    if (mutation) {
      mutation.retryCount++;
      mutation.lastError = error;
      await this.putInStore(STORES.MUTATIONS, mutationId, mutation);
    }
  }

  /**
   * Cache query results.
   */
  async cacheQuery<T>(key: string, results: T[], ttlMs: number = 5 * 60 * 1000): Promise<void> {
    await this.init();

    const entry: QueryCacheEntry<T> = {
      key,
      results,
      cachedAt: Date.now(),
      ttlMs,
    };

    await this.putInStore(STORES.QUERIES, key, entry);
  }

  /**
   * Get cached query results.
   */
  async getCachedQuery<T>(key: string): Promise<T[] | null> {
    await this.init();

    const entry = await this.getFromStore<QueryCacheEntry<T>>(STORES.QUERIES, key);
    
    if (!entry) return null;

    // Check if expired
    if (Date.now() > entry.cachedAt + entry.ttlMs) {
      await this.delete(STORES.QUERIES, key);
      return null;
    }

    return entry.results;
  }

  /**
   * Clear all cached queries.
   */
  async clearQueries(): Promise<void> {
    await this.init();
    await this.clearStore(STORES.QUERIES);
  }

  /**
   * Clean up expired entries.
   */
  async cleanup(): Promise<void> {
    await this.init();
    const now = Date.now();

    // Clean up expired entities
    await this.cleanupStore(STORES.ENTITIES, (entry: CacheEntry<unknown>) => {
      return now > entry.cachedAt + entry.ttlMs;
    });

    // Clean up expired queries
    await this.cleanupStore(STORES.QUERIES, (entry: QueryCacheEntry<unknown>) => {
      return now > entry.cachedAt + entry.ttlMs;
    });

    // Clean up old mutations (older than 30 days)
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    await this.cleanupStore(STORES.MUTATIONS, (entry: PendingMutation) => {
      return entry.timestamp < thirtyDaysAgo && entry.retryCount > 10;
    });
  }

  /**
   * Clear all cached data.
   */
  async clearAll(): Promise<void> {
    await this.init();
    await Promise.all([
      this.clearStore(STORES.ENTITIES),
      this.clearStore(STORES.QUERIES),
      this.clearStore(STORES.MUTATIONS),
    ]);
  }

  /**
   * Check if online (wraps navigator.onLine).
   */
  isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  /**
   * Get cache statistics.
   */
  async getStats(): Promise<{
    entities: number;
    queries: number;
    pendingMutations: number;
  }> {
    await this.init();

    const [entities, queries, mutations] = await Promise.all([
      this.countStore(STORES.ENTITIES),
      this.countStore(STORES.QUERIES),
      this.countStore(STORES.MUTATIONS),
    ]);

    return { entities, queries, pendingMutations: mutations };
  }

  // ==================== Private Methods ====================

  private async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Entities store
        if (!db.objectStoreNames.contains(STORES.ENTITIES)) {
          const entityStore = db.createObjectStore(STORES.ENTITIES, { keyPath: 'key' });
          entityStore.createIndex('entityType', 'entityType', { unique: false });
          entityStore.createIndex('cachedAt', 'cachedAt', { unique: false });
        }

        // Queries store
        if (!db.objectStoreNames.contains(STORES.QUERIES)) {
          const queryStore = db.createObjectStore(STORES.QUERIES, { keyPath: 'key' });
          queryStore.createIndex('cachedAt', 'cachedAt', { unique: false });
        }

        // Mutations store
        if (!db.objectStoreNames.contains(STORES.MUTATIONS)) {
          const mutationStore = db.createObjectStore(STORES.MUTATIONS, { keyPath: 'id' });
          mutationStore.createIndex('entityType', 'entityType', { unique: false });
          mutationStore.createIndex('timestamp', 'timestamp', { unique: false });
          mutationStore.createIndex('retryCount', 'retryCount', { unique: false });
        }
      };
    });
  }

  private async getFromStore<T>(storeName: string, key: IDBValidKey): Promise<T | null> {
    return new Promise((resolve, reject) => {
      const store = this.db!.transaction(storeName, 'readonly').objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  private async getAllFromStore<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const store = this.db!.transaction(storeName, 'readonly').objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  private async getAllFromIndex<T>(
    storeName: string,
    indexName: string,
    key: IDBValidKey
  ): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const store = this.db!.transaction(storeName, 'readonly').objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(key);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  private async putInStore<T>(storeName: string, _key: IDBValidKey, value: T): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.db!.transaction(storeName, 'readwrite').objectStore(storeName);
      const request = store.put(value);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async putManyInStore<T>(
    storeName: string,
    entries: Array<{ key: string; entry: T }>
  ): Promise<void> {
    const transaction = this.db!.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      entries.forEach(({ entry }) => store.put(entry));

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  private async delete(storeName: string, key: IDBValidKey): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.db!.transaction(storeName, 'readwrite').objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async clearStore(storeName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.db!.transaction(storeName, 'readwrite').objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async countStore(storeName: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const store = this.db!.transaction(storeName, 'readonly').objectStore(storeName);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async cleanupStore<T>(
    storeName: string,
    shouldDelete: (entry: T) => boolean
  ): Promise<void> {
    const store = this.db!.transaction(storeName, 'readwrite').objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
        if (cursor) {
          if (shouldDelete(cursor.value)) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }
}

// Singleton instance
export const indexedDBCache = new IndexedDBCache();
