/**
 * Error Handling Module
 * 
 * Centralized error handling for the portal-v2 application.
 * 
 * Usage:
 * ```ts
 * import { 
 *   AppError, NetworkError, handleApiError, 
 *   RootErrorBoundary, ErrorFallback 
 * } from '@/lib/errors';
 * ```
 */

// Export all error classes
export {
  AppError,
  NetworkError,
  AuthError,
  PermissionError,
  ValidationError,
  NotFoundError,
  RateLimitError,
  ConflictError,
  ErrorCode,
  type AppErrorOptions,
  // Type guards
  isAppError,
  isNetworkError,
  isAuthError,
  isPermissionError,
  isValidationError,
  isNotFoundError,
  isRateLimitError,
  isConflictError,
} from './classes';

// Export error boundaries
export {
  RootErrorBoundary,
  DashboardErrorBoundary,
  BoardErrorBoundary,
  FeatureErrorBoundary,
  RouteErrorBoundary,
  AsyncErrorBoundary,
  MinimalErrorBoundary,
  type ErrorBoundaryProps,
  type ErrorBoundaryState,
} from './boundaries';

// Export handlers
export {
  handleApiError,
  isRetryableError,
  getErrorMessage,
  getDetailedErrorMessage,
  logError,
  logWarning,
  logInfo,
  getErrorBuffer,
  clearErrorBuffer,
  exportErrors,
  retryWithBackoff,
  isError,
  hasMessage,
  type ErrorEntry,
} from './handlers';
