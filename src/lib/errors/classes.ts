/**
 * Error Classes
 * Custom error classes for the application with type-safe error handling
 */

export type ErrorCode =
  | 'NETWORK_ERROR'
  | 'AUTH_ERROR'
  | 'PERMISSION_ERROR'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND_ERROR'
  | 'RATE_LIMIT_ERROR'
  | 'CONFLICT_ERROR'
  | 'UNKNOWN_ERROR';

export interface AppErrorOptions {
  message: string;
  code: ErrorCode;
  retryable?: boolean;
  cause?: unknown;
  metadata?: Record<string, unknown>;
}

/**
 * Base application error class
 * All custom errors extend this class
 */
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly retryable: boolean;
  readonly cause?: unknown;
  readonly metadata: Record<string, unknown>;

  constructor(options: AppErrorOptions) {
    super(options.message);
    this.name = 'AppError';
    this.code = options.code;
    this.retryable = options.retryable ?? false;
    this.cause = options.cause;
    this.metadata = options.metadata ?? {};

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      retryable: this.retryable,
      cause: this.cause,
      metadata: this.metadata,
      stack: this.stack,
    };
  }
}

/**
 * Network error - retryable by default
 * Used for connection issues, timeouts, 5xx server errors
 */
export class NetworkError extends AppError {
  readonly statusCode?: number;
  readonly url?: string;

  constructor(
    message: string,
    options?: {
      statusCode?: number;
      url?: string;
      cause?: unknown;
      metadata?: Record<string, unknown>;
    }
  ) {
    super({
      message,
      code: 'NETWORK_ERROR',
      retryable: true,
      cause: options?.cause,
      metadata: {
        ...options?.metadata,
        statusCode: options?.statusCode,
        url: options?.url,
      },
    });
    this.name = 'NetworkError';
    this.statusCode = options?.statusCode;
    this.url = options?.url;
  }
}

/**
 * Authentication error - not retryable
 * Used for login failures, expired tokens, invalid credentials
 */
export class AuthError extends AppError {
  readonly redirectTo?: string;

  constructor(
    message: string,
    options?: {
      redirectTo?: string;
      cause?: unknown;
      metadata?: Record<string, unknown>;
    }
  ) {
    super({
      message,
      code: 'AUTH_ERROR',
      retryable: false,
      cause: options?.cause,
      metadata: options?.metadata,
    });
    this.name = 'AuthError';
    this.redirectTo = options?.redirectTo;
  }
}

/**
 * Permission error - not retryable
 * Used for forbidden access, insufficient privileges
 */
export class PermissionError extends AppError {
  readonly resource?: string;
  readonly action?: string;

  constructor(
    message: string,
    options?: {
      resource?: string;
      action?: string;
      cause?: unknown;
      metadata?: Record<string, unknown>;
    }
  ) {
    super({
      message,
      code: 'PERMISSION_ERROR',
      retryable: false,
      cause: options?.cause,
      metadata: {
        ...options?.metadata,
        resource: options?.resource,
        action: options?.action,
      },
    });
    this.name = 'PermissionError';
    this.resource = options?.resource;
    this.action = options?.action;
  }
}

/**
 * Validation error - not retryable
 * Used for form validation, input errors
 */
export class ValidationError extends AppError {
  readonly fieldErrors: Map<string, string[]>;

  constructor(
    message: string,
    options?: {
      fieldErrors?: Record<string, string[]> | Map<string, string[]>;
      cause?: unknown;
      metadata?: Record<string, unknown>;
    }
  ) {
    super({
      message,
      code: 'VALIDATION_ERROR',
      retryable: false,
      cause: options?.cause,
      metadata: options?.metadata,
    });
    this.name = 'ValidationError';
    
    // Convert object to Map if necessary
    if (options?.fieldErrors instanceof Map) {
      this.fieldErrors = options.fieldErrors;
    } else {
      this.fieldErrors = new Map(Object.entries(options?.fieldErrors ?? {}));
    }
  }

  /**
   * Get errors for a specific field
   */
  getFieldErrors(fieldName: string): string[] {
    return this.fieldErrors.get(fieldName) ?? [];
  }

  /**
   * Check if a field has errors
   */
  hasFieldErrors(fieldName: string): boolean {
    const errors = this.fieldErrors.get(fieldName);
    return errors !== undefined && errors.length > 0;
  }

  /**
   * Get all field names with errors
   */
  getFieldsWithErrors(): string[] {
    return Array.from(this.fieldErrors.keys());
  }

  /**
   * Get first error for each field (useful for simple forms)
   */
  getFirstErrors(): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [field, errors] of this.fieldErrors.entries()) {
      if (errors.length > 0) {
        result[field] = errors[0];
      }
    }
    return result;
  }
}

/**
 * Not found error - not retryable
 * Used when a requested resource doesn't exist
 */
export class NotFoundError extends AppError {
  readonly resource?: string;
  readonly resourceId?: string;

  constructor(
    message: string,
    options?: {
      resource?: string;
      resourceId?: string;
      cause?: unknown;
      metadata?: Record<string, unknown>;
    }
  ) {
    super({
      message,
      code: 'NOT_FOUND_ERROR',
      retryable: false,
      cause: options?.cause,
      metadata: {
        ...options?.metadata,
        resource: options?.resource,
        resourceId: options?.resourceId,
      },
    });
    this.name = 'NotFoundError';
    this.resource = options?.resource;
    this.resourceId = options?.resourceId;
  }
}

/**
 * Rate limit error - retryable after delay
 * Used for API rate limiting
 */
export class RateLimitError extends AppError {
  readonly retryAfter?: number; // seconds
  readonly limit?: number;
  readonly remaining?: number;

  constructor(
    message: string,
    options?: {
      retryAfter?: number;
      limit?: number;
      remaining?: number;
      cause?: unknown;
      metadata?: Record<string, unknown>;
    }
  ) {
    super({
      message,
      code: 'RATE_LIMIT_ERROR',
      retryable: true,
      cause: options?.cause,
      metadata: {
        ...options?.metadata,
        retryAfter: options?.retryAfter,
        limit: options?.limit,
        remaining: options?.remaining,
      },
    });
    this.name = 'RateLimitError';
    this.retryAfter = options?.retryAfter;
    this.limit = options?.limit;
    this.remaining = options?.remaining;
  }

  /**
   * Get a user-friendly message about when to retry
   */
  getRetryMessage(): string {
    if (this.retryAfter) {
      const minutes = Math.ceil(this.retryAfter / 60);
      return `Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    return 'Please try again later';
  }
}

/**
 * Conflict error - not retryable without changes
 * Used for version conflicts, concurrent edits
 */
export class ConflictError extends AppError {
  readonly resource?: string;
  readonly currentVersion?: string;
  readonly submittedVersion?: string;

  constructor(
    message: string,
    options?: {
      resource?: string;
      currentVersion?: string;
      submittedVersion?: string;
      cause?: unknown;
      metadata?: Record<string, unknown>;
    }
  ) {
    super({
      message,
      code: 'CONFLICT_ERROR',
      retryable: false,
      cause: options?.cause,
      metadata: {
        ...options?.metadata,
        resource: options?.resource,
        currentVersion: options?.currentVersion,
        submittedVersion: options?.submittedVersion,
      },
    });
    this.name = 'ConflictError';
    this.resource = options?.resource;
    this.currentVersion = options?.currentVersion;
    this.submittedVersion = options?.submittedVersion;
  }
}

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Type guards for specific error types
 */
export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError;
}

export function isPermissionError(error: unknown): error is PermissionError {
  return error instanceof PermissionError;
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

export function isNotFoundError(error: unknown): error is NotFoundError {
  return error instanceof NotFoundError;
}

export function isRateLimitError(error: unknown): error is RateLimitError {
  return error instanceof RateLimitError;
}

export function isConflictError(error: unknown): error is ConflictError {
  return error instanceof ConflictError;
}
