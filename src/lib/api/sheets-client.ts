/**
 * Google Sheets API Client
 * 
 * Handles authentication, rate limiting, retry logic, and batch operations.
 * Uses the Google Sheets API v4.
 */

import { readBucket, writeBucket } from './token-bucket';

// Google API configuration
const GOOGLE_SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 30000;

export interface SheetsAPIErrorInterface extends Error {
  code: number;
  status: string;
  details?: unknown;
}

export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

export interface SheetsClientConfig {
  apiKey?: string;
  accessToken?: string;
  retry?: Partial<RetryConfig>;
}

export class SheetsAPIClient {
  private apiKey: string | null = null;
  private accessToken: string | null = null;
  private retryConfig: RetryConfig;

  constructor(config: SheetsClientConfig = {}) {
    this.apiKey = config.apiKey || null;
    this.accessToken = config.accessToken || null;
    this.retryConfig = {
      maxRetries: config.retry?.maxRetries ?? MAX_RETRIES,
      initialDelayMs: config.retry?.initialDelayMs ?? INITIAL_RETRY_DELAY_MS,
      maxDelayMs: config.retry?.maxDelayMs ?? MAX_RETRY_DELAY_MS,
      backoffMultiplier: config.retry?.backoffMultiplier ?? 2,
    };
  }

  /**
   * Set the API key for public spreadsheets.
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Set the OAuth access token for private spreadsheets.
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  /**
   * Check if the client is authenticated.
   */
  isAuthenticated(): boolean {
    return !!this.apiKey || !!this.accessToken;
  }

  /**
   * Read values from a range in a spreadsheet.
   * Rate limited: 300 reads/minute
   */
  async readRange(spreadsheetId: string, range: string): Promise<any[][]> {
    await readBucket.consumeAsync(1);

    const url = `${GOOGLE_SHEETS_API_BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}`;
    const response = await this.fetchWithRetry(url, { method: 'GET' });
    
    if (!response.values) {
      return [];
    }
    
    return response.values as any[][];
  }

  /**
   * Write values to a range in a spreadsheet.
   * Rate limited: 60 writes/minute
   */
  async writeRange(
    spreadsheetId: string, 
    range: string, 
    values: any[][]
  ): Promise<void> {
    await writeBucket.consumeAsync(1);

    const url = `${GOOGLE_SHEETS_API_BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
    
    await this.fetchWithRetry(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ values }),
    });
  }

  /**
   * Append rows to the end of a sheet.
   * Rate limited: 60 writes/minute
   */
  async appendRows(
    spreadsheetId: string,
    sheetName: string,
    rows: any[][]
  ): Promise<void> {
    await writeBucket.consumeAsync(1);

    const url = `${GOOGLE_SHEETS_API_BASE}/${spreadsheetId}/values/${encodeURIComponent(sheetName)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
    
    await this.fetchWithRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: rows }),
    });
  }

  /**
   * Perform a batch update on a spreadsheet.
   * This allows multiple operations in a single request.
   * Rate limited: 60 writes/minute
   */
  async batchUpdate(spreadsheetId: string, requests: any[]): Promise<void> {
    if (requests.length === 0) return;

    await writeBucket.consumeAsync(1);

    const url = `${GOOGLE_SHEETS_API_BASE}/${spreadsheetId}:batchUpdate`;
    
    await this.fetchWithRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests }),
    });
  }

  /**
   * Clear values from a range.
   * Rate limited: 60 writes/minute
   */
  async clearRange(spreadsheetId: string, range: string): Promise<void> {
    await writeBucket.consumeAsync(1);

    const url = `${GOOGLE_SHEETS_API_BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}:clear`;
    
    await this.fetchWithRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
  }

  /**
   * Get spreadsheet metadata.
   * Rate limited: 300 reads/minute
   */
  async getSpreadsheet(spreadsheetId: string, fields?: string[]): Promise<unknown> {
    await readBucket.consumeAsync(1);

    let url = `${GOOGLE_SHEETS_API_BASE}/${spreadsheetId}`;
    if (fields && fields.length > 0) {
      url += `?fields=${encodeURIComponent(fields.join(','))}`;
    }

    return this.fetchWithRetry(url, { method: 'GET' });
  }

  /**
   * Internal fetch with retry logic and error handling.
   */
  private async fetchWithRetry(url: string, options: RequestInit): Promise<any> {
    let lastError: Error | null = null;
    let delay = this.retryConfig.initialDelayMs;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await this.fetchInternal(url, options);
      } catch (error) {
        lastError = error as Error;

        // Don't retry on client errors (4xx) except 429 (rate limit)
        if (error instanceof SheetsAPIErrorImpl) {
          if (error.code >= 400 && error.code < 500 && error.code !== 429) {
            throw error;
          }
        }

        // Last attempt failed
        if (attempt === this.retryConfig.maxRetries) {
          break;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(
          delay * this.retryConfig.backoffMultiplier,
          this.retryConfig.maxDelayMs
        );
      }
    }

    throw lastError;
  }

  /**
   * Internal fetch with authentication.
   */
  private async fetchInternal(url: string, options: RequestInit): Promise<any> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    };

    // Add authentication
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    } else if (this.apiKey) {
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}key=${encodeURIComponent(this.apiKey)}`;
    } else {
      throw new SheetsAPIErrorImpl(
        'Authentication required. Set API key or access token.',
        401,
        'UNAUTHENTICATED'
      );
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new SheetsAPIErrorImpl(
        errorBody.error?.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorBody.error?.status || 'UNKNOWN',
        errorBody
      );
    }

    // Some operations return 204 No Content
    if (response.status === 204) {
      return null;
    }

    return response.json();
  }
}

// Custom error class for Sheets API
class SheetsAPIErrorImpl extends Error implements SheetsAPIErrorInterface {
  code: number;
  status: string;
  details?: unknown;
  
  constructor(
    message: string,
    code: number,
    status: string,
    details?: unknown
  ) {
    super(message);
    this.name = 'SheetsAPIError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

// Singleton instance for convenience
export const sheetsClient = new SheetsAPIClient();

// Export error class
export { SheetsAPIErrorImpl };

// Export error type
export type SheetsAPIError = InstanceType<typeof SheetsAPIErrorImpl>;
