/**
 * ErrorFallback Component
 * Visual error state component with dark theme styling
 * Accessible and reusable across the application
 */

import React from 'react';
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

export interface ErrorFallbackProps {
  /** The error that was caught */
  error: Error | null;
  /** Function to reset the error boundary */
  resetErrorBoundary: () => void;
  /** Optional custom title */
  title?: string;
  /** Optional custom description */
  description?: string;
}

/**
 * ErrorFallback
 * Displays user-friendly error UI with reset capability
 * Shows error details in development mode
 */
export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  title = 'Something went wrong',
  description = "We're sorry, but something unexpected happened. Please try again.",
}) => {
  const [showDetails, setShowDetails] = React.useState(false);
  const isDev = process.env.NODE_ENV === 'development';

  const handleReset = (e: React.MouseEvent): void => {
    e.preventDefault();
    resetErrorBoundary();
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setShowDetails((prev) => !prev);
    }
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="min-h-[200px] flex items-center justify-center p-6"
    >
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header with icon */}
        <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 p-6 border-b border-gray-800">
          <div className="flex items-center gap-4">
            <div
              className="flex-shrink-0 w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center"
              aria-hidden="true"
            >
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-100">{title}</h2>
              <p className="text-sm text-gray-400 mt-1">
                Error occurred
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-gray-300 leading-relaxed">{description}</p>

          {/* Try Again button */}
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 
                       bg-blue-600 hover:bg-blue-500 active:bg-blue-700
                       text-white font-medium rounded-lg
                       transition-all duration-200 ease-in-out
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                       focus:ring-offset-gray-900
                       disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Try loading the content again"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            <span>Try Again</span>
          </button>

          {/* Error details (dev mode only) */}
          {isDev && error && (
            <div className="mt-4 border-t border-gray-800 pt-4">
              <button
                onClick={() => setShowDetails((prev) => !prev)}
                onKeyDown={handleKeyDown}
                className="flex items-center gap-2 text-sm text-gray-500 
                           hover:text-gray-400 transition-colors
                           focus:outline-none focus:ring-2 focus:ring-gray-600 
                           focus:ring-offset-2 focus:ring-offset-gray-900 rounded px-2 py-1 -ml-2"
                aria-expanded={showDetails}
                aria-controls="error-details"
              >
                {showDetails ? (
                  <ChevronUp className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <ChevronDown className="w-4 h-4" aria-hidden="true" />
                )}
                <span>Error Details (Development Mode)</span>
              </button>

              {showDetails && (
                <div
                  id="error-details"
                  className="mt-3 p-4 bg-gray-950 rounded-lg border border-gray-800
                             overflow-auto max-h-64"
                >
                  <div className="space-y-2 text-sm font-mono">
                    <p className="text-red-400">
                      <span className="text-gray-500">Error:</span>{' '}
                      {error.name}
                    </p>
                    <p className="text-gray-300">
                      <span className="text-gray-500">Message:</span>{' '}
                      {error.message}
                    </p>
                    {'code' in error && (
                      <p className="text-gray-300">
                        <span className="text-gray-500">Code:</span>{' '}
                        {String(error.code)}
                      </p>
                    )}
                    {error.stack && (
                      <div className="mt-3">
                        <p className="text-gray-500 mb-1">Stack Trace:</p>
                        <pre className="text-xs text-gray-400 whitespace-pre-wrap break-all">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-950/50 border-t border-gray-800">
          <p className="text-xs text-gray-500 text-center">
            If the problem persists, please contact support
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * CompactErrorFallback
 * Smaller version for inline error states
 */
export interface CompactErrorFallbackProps {
  error?: Error | null;
  resetErrorBoundary: () => void;
  message?: string;
}

export const CompactErrorFallback: React.FC<CompactErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  message = 'Failed to load',
}) => {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div
      role="alert"
      className="flex items-center gap-3 p-3 bg-gray-900/80 border border-gray-800 
                 rounded-lg"
    >
      <AlertTriangle
        className="w-5 h-5 text-red-400 flex-shrink-0"
        aria-hidden="true"
      />
      <span className="text-sm text-gray-300 flex-grow">{message}</span>
      <button
        onClick={resetErrorBoundary}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm
                   bg-gray-800 hover:bg-gray-700 text-gray-200
                   rounded-md transition-colors
                   focus:outline-none focus:ring-2 focus:ring-gray-600"
        aria-label="Retry"
      >
        <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
        Retry
      </button>
      {isDev && error && (
        <span className="text-xs text-gray-500" title={error.message}>
          (?)
        </span>
      )}
    </div>
  );
};

/**
 * InlineErrorFallback
 * Minimal inline error for small spaces
 */
export interface InlineErrorFallbackProps {
  resetErrorBoundary: () => void;
  message?: string;
}

export const InlineErrorFallback: React.FC<InlineErrorFallbackProps> = ({
  resetErrorBoundary,
  message = 'Error loading content',
}) => {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-red-400">
      <AlertTriangle className="w-4 h-4" aria-hidden="true" />
      <span>{message}</span>
      <button
        onClick={resetErrorBoundary}
        className="text-blue-400 hover:text-blue-300 underline focus:outline-none 
                   focus:ring-2 focus:ring-blue-500 rounded px-1"
        aria-label="Try again"
      >
        retry
      </button>
    </span>
  );
};

/**
 * PageErrorFallback
 * Full-page error state
 */
export interface PageErrorFallbackProps extends ErrorFallbackProps {
  homeHref?: string;
}

export const PageErrorFallback: React.FC<PageErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  title = 'Something went wrong',
  description = "We're having trouble loading this page. Please try again or return home.",
  homeHref = '/',
}) => {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <ErrorFallback
          error={error}
          resetErrorBoundary={resetErrorBoundary}
          title={title}
          description={description}
        />
        <div className="mt-4 text-center">
          <a
            href={homeHref}
            className="text-sm text-gray-500 hover:text-gray-400 
                       transition-colors focus:outline-none focus:ring-2 
                       focus:ring-gray-600 rounded px-2 py-1"
          >
            ← Return to home page
          </a>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;
