/**
 * Google Sheets API Layer
 * 
 * Complete data layer for interacting with Google Sheets as a backend.
 * Includes rate limiting, retry logic, offline support, and generic CRUD operations.
 * 
 * @example
 * ```typescript
 * import { sheetsClient, EntityRepository, indexedDBCache } from '@/lib/api';
 * 
 * // Configure authentication
 * sheetsClient.setAccessToken('your-oauth-token');
 * 
 * // Create a repository for your entity
 * const userRepo = new EntityRepository(
 *   sheetsClient,
 *   'spreadsheet-id',
 *   'Users',
 *   userSerializer
 * );
 * 
 * // Use CRUD operations
 * const user = await userRepo.create({ name: 'John', email: 'john@example.com' });
 * const users = await userRepo.findAll();
 * await userRepo.update(user.id, { name: 'Jane' });
 * ```
 */

// Token Bucket Rate Limiting
export {
  TokenBucket,
  readBucket,
  writeBucket,
  type TokenBucketConfig,
  type TokenBucketState,
} from './token-bucket';

// Google Sheets API Client
export {
  SheetsAPIClient,
  sheetsClient,
  SheetsAPIErrorImpl,
  type SheetsClientConfig,
  type RetryConfig,
} from './sheets-client';

// Export SheetsAPIError type
export type SheetsAPIError = import('./sheets-client').SheetsAPIError;

// Entity Repository
export {
  EntityRepository,
  RepositoryError,
  type Entity,
  type Serializer,
  type Filter,
  type RepositoryOptions,
  type FindOptions,
  type SoftDeletable,
} from './repository';

// IndexedDB Cache
export {
  IndexedDBCache,
  indexedDBCache,
  type PendingMutation,
  type MutationType,
  type CacheEntry,
  type QueryCacheEntry,
} from './indexeddb-cache';

// Re-export React Query client from cache.ts for convenience
export { queryClient, entityConfig, queryKeys } from './cache';

// ==================== Utility Functions ====================

/**
 * Check if the Google Sheets API is accessible.
 * Useful for health checks and connection status indicators.
 */
export async function checkSheetsAPIAccess(): Promise<boolean> {
  try {
    const response = await fetch('https://sheets.googleapis.com/$discovery/rest?version=v4');
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Generate a unique ID for entities.
 * Uses timestamp + random for collision resistance.
 */
export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`;
}

/**
 * Format a date for storage in Google Sheets.
 * Uses ISO 8601 format for consistency.
 */
export function formatDate(date: Date): string {
  return date.toISOString();
}

/**
 * Parse a date from Google Sheets storage.
 * Handles both ISO strings and serial date numbers.
 */
export function parseDate(value: string | number | null): Date | null {
  if (value === null || value === undefined) return null;
  
  // Handle serial date numbers (Excel/Google Sheets format)
  if (typeof value === 'number') {
    // Google Sheets epoch is 1899-12-30
    const epoch = new Date(1899, 11, 30);
    return new Date(epoch.getTime() + value * 24 * 60 * 60 * 1000);
  }
  
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Escape special characters in sheet names for use in A1 notation.
 * Sheet names with spaces or special chars need single quotes.
 */
export function escapeSheetName(name: string): string {
  if (/[ '\[\]\*\?]/.test(name)) {
    return `'${name.replace(/'/g, "''")}'`;
  }
  return name;
}

/**
 * Convert column letter to number (A -> 1, B -> 2, etc.)
 */
export function columnToNumber(column: string): number {
  let result = 0;
  for (let i = 0; i < column.length; i++) {
    result = result * 26 + (column.charCodeAt(i) - 64);
  }
  return result;
}

/**
 * Convert column number to letter (1 -> A, 2 -> B, etc.)
 */
export function columnToLetter(column: number): string {
  let result = '';
  let n = column;
  
  while (n > 0) {
    n--;
    result = String.fromCharCode(65 + (n % 26)) + result;
    n = Math.floor(n / 26);
  }
  
  return result;
}

/**
 * Default serializer helpers for common field types.
 */
export const serializers = {
  /** Serialize string field */
  string: (value: string | null): string => value ?? '',
  
  /** Serialize number field */
  number: (value: number | null): number | '' => value ?? '',
  
  /** Serialize boolean field */
  boolean: (value: boolean | null): 'TRUE' | 'FALSE' | '' => {
    if (value === null || value === undefined) return '';
    return value ? 'TRUE' : 'FALSE';
  },
  
  /** Serialize date field */
  date: (value: Date | null): string => value?.toISOString() ?? '',
  
  /** Serialize array field (as JSON) */
  array: <T>(value: T[] | null): string => {
    if (!value || value.length === 0) return '';
    return JSON.stringify(value);
  },
  
  /** Serialize object field (as JSON) */
  object: <T>(value: T | null): string => {
    if (!value) return '';
    return JSON.stringify(value);
  },
};

/**
 * Default deserializer helpers for common field types.
 */
export const deserializers = {
  /** Deserialize string field */
  string: (value: string | null): string | null => {
    if (value === null || value === undefined || value === '') return null;
    return value;
  },
  
  /** Deserialize number field */
  number: (value: string | number | null): number | null => {
    if (value === null || value === undefined || value === '') return null;
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? null : num;
  },
  
  /** Deserialize boolean field */
  boolean: (value: string | boolean | null): boolean | null => {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'boolean') return value;
    return value.toUpperCase() === 'TRUE';
  },
  
  /** Deserialize date field */
  date: (value: string | number | null): Date | null => parseDate(value),
  
  /** Deserialize array field (from JSON) */
  array: <T>(value: string | null): T[] | null => {
    if (!value) return null;
    try {
      return JSON.parse(value) as T[];
    } catch {
      return null;
    }
  },
  
  /** Deserialize object field (from JSON) */
  object: <T>(value: string | null): T | null => {
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },
};
