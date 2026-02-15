/**
 * Error Handlers
 * Utility functions for error handling and logging
 */

import {
  AppError,
  ErrorCode,
  NetworkError,
  AuthError,
  PermissionError,
  ValidationError,
  NotFoundError,
  RateLimitError,
  ConflictError,
  isAppError,
} from './classes';

/**
 * In-memory error buffer for debugging
 * Stores the last 100 errors with context
 */
interface ErrorEntry {
  timestamp: string;
  error: Error | unknown;
  context?: Record<string, unknown>;
  appError?: AppError;
}

const ERROR_BUFFER_SIZE = 100;
const errorBuffer: ErrorEntry[] = [];

/**
 * Add an error to the in-memory buffer
 */
function addToErrorBuffer(entry: ErrorEntry): void {
  errorBuffer.push(entry);
  if (errorBuffer.length > ERROR_BUFFER_SIZE) {
    errorBuffer.shift();
  }
}

/**
 * Handle API errors and convert them to appropriate AppError types
 * This normalizes errors from various sources (fetch, axios, etc.)
 */
export function handleApiError(error: unknown): AppError {
  // Already an AppError - return as-is
  if (isAppError(error)) {
    return error;
  }

  // Handle Response objects (from fetch)
  if (error instanceof Response) {
    return handleResponseError(error);
  }

  // Handle standard Error objects with HTTP status info
  if (error instanceof Error) {
    // Check for common HTTP status patterns in message
    const statusMatch = error.message.match(/\b(\d{3})\b/);
    const statusCode = statusMatch ? parseInt(statusMatch[1], 10) : undefined;

    if (statusCode) {
      return createErrorFromStatusCode(statusCode, error.message, error);
    }

    // Network-related errors
    if (
      error.name === 'TypeError' &&
      (error.message.includes('fetch') ||
        error.message.includes('network') ||
        error.message.includes('Failed to fetch'))
    ) {
      return new NetworkError('Network request failed', { cause: error });
    }

    // Timeout errors
    if (
      error.name === 'AbortError' ||
      error.message.toLowerCase().includes('timeout')
    ) {
      return new NetworkError('Request timed out', {
        cause: error,
        metadata: { timeout: true },
      });
    }

    // Generic error - wrap as unknown AppError
    return new AppError({
      message: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      cause: error,
    });
  }

  // Handle string errors
  if (typeof error === 'string') {
    return new AppError({
      message: error,
      code: 'UNKNOWN_ERROR',
      cause: error,
    });
  }

  // Handle objects with message property
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return new AppError({
      message: error.message,
      code: 'UNKNOWN_ERROR',
      cause: error,
    });
  }

  // Unknown error type
  return new AppError({
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    cause: error,
  });
}

/**
 * Handle fetch Response objects
 */
function handleResponseError(response: Response): AppError {
  const statusCode = response.status;
  const url = response.url;

  // Try to extract error message from response
  const getMessage = async (): Promise<string> => {
    try {
      const data = await response.json();
      return (
        data.message || data.error || data.title || `HTTP ${statusCode} error`
      );
    } catch {
      return response.statusText || `HTTP ${statusCode} error`;
    }
  };

  // For synchronous handling, use status-based message
  const message = response.statusText || `HTTP ${statusCode} error`;

  return createErrorFromStatusCode(statusCode, message, undefined, url);
}

/**
 * Create appropriate error from HTTP status code
 */
function createErrorFromStatusCode(
  statusCode: number,
  message: string,
  cause?: unknown,
  url?: string
): AppError {
  switch (statusCode) {
    case 400:
      return new ValidationError(message, { cause });

    case 401:
      return new AuthError(message, { cause });

    case 403:
      return new PermissionError(message, { cause });

    case 404:
      return new NotFoundError(message, { cause });

    case 408:
      return new NetworkError(message, {
        statusCode,
        url,
        cause,
        metadata: { timeout: true },
      });

    case 409:
      return new ConflictError(message, { cause });

    case 429:
      return new RateLimitError(message, { cause });

    case 500:
    case 502:
    case 503:
    case 504:
      return new NetworkError(message, {
        statusCode,
        url,
        cause,
        metadata: { serverError: true },
      });

    default:
      if (statusCode >= 500) {
        return new NetworkError(message, { statusCode, url, cause });
      }
      if (statusCode >= 400) {
        return new AppError({
          message,
          code: 'UNKNOWN_ERROR',
          cause,
          metadata: { statusCode },
        });
      }
      return new AppError({
        message,
        code: 'UNKNOWN_ERROR',
        cause,
        metadata: { statusCode },
      });
  }
}

/**
 * Check if an error is retryable
 * Retryable errors: network issues, rate limits, timeouts
 */
export function isRetryableError(error: unknown): boolean {
  // AppError with retryable flag
  if (isAppError(error)) {
    return error.retryable;
  }

  // Network errors are generally retryable
  if (error instanceof TypeError) {
    const message = error.message.toLowerCase();
    return (
      message.includes('fetch') ||
      message.includes('network') ||
      message.includes('failed to fetch')
    );
  }

  // Abort errors (timeouts) are retryable
  if (error instanceof Error && error.name === 'AbortError') {
    return true;
  }

  // HTTP status codes that are retryable
  if (error instanceof Response) {
    const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
    return retryableStatusCodes.includes(error.status);
  }

  return false;
}

/**
 * Get a user-friendly error message
 * Returns safe messages that don't leak sensitive info
 */
export function getErrorMessage(error: unknown): string {
  if (isAppError(error)) {
    // Return the message as-is for known error types
    return error.message;
  }

  if (error instanceof Error) {
    // Filter out sensitive patterns
    const message = error.message;

    // Hide specific error details that might contain sensitive info
    if (
      message.includes('password') ||
      message.includes('token') ||
      message.includes('secret') ||
      message.includes('key')
    ) {
      return 'An authentication error occurred';
    }

    return message || 'An unexpected error occurred';
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
}

/**
 * Get a detailed error message for debugging
 * Includes stack traces and additional context
 */
export function getDetailedErrorMessage(error: unknown): string {
  if (isAppError(error)) {
    const details = [
      `Type: ${error.name}`,
      `Code: ${error.code}`,
      `Message: ${error.message}`,
      `Retryable: ${error.retryable}`,
    ];

    if (error.cause) {
      details.push(`Cause: ${getDetailedErrorMessage(error.cause)}`);
    }

    if (Object.keys(error.metadata).length > 0) {
      details.push(`Metadata: ${JSON.stringify(error.metadata, null, 2)}`);
    }

    if (error.stack) {
      details.push(`Stack: ${error.stack}`);
    }

    return details.join('\n');
  }

  if (error instanceof Error) {
    return `${error.name}: ${error.message}\nStack: ${error.stack || 'N/A'}`;
  }

  return `Unknown error: ${String(error)}`;
}

/**
 * Log error to console with context
 * Also adds to in-memory buffer for debugging
 */
export function logError(
  error: unknown,
  context?: Record<string, unknown>
): void {
  const timestamp = new Date().toISOString();
  const appError = isAppError(error) ? error : handleApiError(error);

  // Add to in-memory buffer
  addToErrorBuffer({
    timestamp,
    error,
    context,
    appError,
  });

  // Log to console with styling
  console.group(`🚨 Error caught at ${timestamp}`);
  console.error('Error:', error);
  console.error('AppError:', appError);
  if (context) {
    console.error('Context:', context);
  }
  console.error('Stack:', appError.stack);
  console.groupEnd();
}

/**
 * Log warning (non-critical issues)
 */
export function logWarning(
  message: string,
  context?: Record<string, unknown>
): void {
  console.warn('[Warning]', message, context);
}

/**
 * Log info for debugging
 */
export function logInfo(
  message: string,
  context?: Record<string, unknown>
): void {
  console.info('[Info]', message, context);
}

/**
 * Get error buffer for debugging
 */
export function getErrorBuffer(): ReadonlyArray<ErrorEntry> {
  return Object.freeze([...errorBuffer]);
}

/**
 * Clear error buffer
 */
export function clearErrorBuffer(): void {
  errorBuffer.length = 0;
}

/**
 * Export errors as CSV for debugging
 * Returns CSV string with error details
 */
export function exportErrors(): string {
  if (errorBuffer.length === 0) {
    return 'No errors recorded';
  }

  const headers = [
    'Timestamp',
    'Error Type',
    'Error Code',
    'Message',
    'Retryable',
    'Stack Trace',
    'Context',
  ];

  const rows = errorBuffer.map((entry) => {
    const error = entry.appError || entry.error;
    const isAppErr = error instanceof AppError;

    return [
      entry.timestamp,
      isAppErr ? (error as AppError).name : (error as Error)?.name || 'Unknown',
      isAppErr ? (error as AppError).code : 'N/A',
      escapeCsv((error as Error)?.message || 'No message'),
      isAppErr ? String((error as AppError).retryable) : 'N/A',
      escapeCsv((error as Error)?.stack?.substring(0, 500) || 'No stack trace'),
      escapeCsv(JSON.stringify(entry.context || {})),
    ];
  });

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

/**
 * Escape CSV values
 */
function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Create a retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    onRetry?: (attempt: number, delay: number, error: unknown) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    onRetry,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries || !isRetryableError(error)) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        initialDelay * Math.pow(2, attempt),
        maxDelay
      );

      if (onRetry) {
        onRetry(attempt + 1, delay, error);
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Type guard to check if value is an Error
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/**
 * Type guard to check if value has a message property
 */
export function hasMessage(value: unknown): value is { message: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof (value as { message: unknown }).message === 'string'
  );
}
