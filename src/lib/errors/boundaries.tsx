/**
 * Error Boundaries
 * React error boundaries for catching and handling errors gracefully
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorFallback } from '../../components/feedback/ErrorFallback';
import { AppError, isAppError } from './classes';
import { logError } from './handlers';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Custom fallback component or element */
  fallback?: ReactNode;
  /** Called when error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Called when user clicks reset */
  onReset?: () => void;
  /** Context name for logging */
  contextName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Base error boundary class with common functionality
 */
abstract class BaseErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const context = {
      contextName: this.props.contextName,
      componentStack: errorInfo.componentStack,
    };

    logError(error, context);

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback takes precedence
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback with error details
      return (
        <ErrorFallback
          error={this.state.error}
          resetErrorBoundary={this.handleReset}
          title={this.getErrorTitle()}
          description={this.getErrorDescription()}
        />
      );
    }

    return this.props.children;
  }

  abstract getErrorTitle(): string;
  abstract getErrorDescription(): string | undefined;
}

/**
 * RootErrorBoundary
 * Catches all errors at the application level
 * Use once at the top of your app tree
 */
export class RootErrorBoundary extends BaseErrorBoundary {
  constructor(props: ErrorBoundaryProps) {
    super({ ...props, contextName: props.contextName ?? 'Root' });
  }

  getErrorTitle(): string {
    return 'Something went wrong';
  }

  getErrorDescription(): string | undefined {
    return "We're sorry, but something unexpected happened. Please try again or contact support if the problem persists.";
  }
}

/**
 * DashboardErrorBoundary
 * Catches errors in the dashboard area
 * Use around dashboard components
 */
export class DashboardErrorBoundary extends BaseErrorBoundary {
  constructor(props: ErrorBoundaryProps) {
    super({ ...props, contextName: props.contextName ?? 'Dashboard' });
  }

  getErrorTitle(): string {
    return 'Dashboard unavailable';
  }

  getErrorDescription(): string | undefined {
    return 'There was a problem loading the dashboard. Your data is safe, but we need to refresh the view.';
  }
}

/**
 * BoardErrorBoundary
 * Catches errors in the board view
 * Use around kanban/scrum board components
 */
export class BoardErrorBoundary extends BaseErrorBoundary {
  constructor(props: ErrorBoundaryProps) {
    super({ ...props, contextName: props.contextName ?? 'Board' });
  }

  getErrorTitle(): string {
    return 'Board failed to load';
  }

  getErrorDescription(): string | undefined {
    return "There was a problem displaying the board. Your cards and columns are safe, but we need to refresh the view.";
  }
}

/**
 * FeatureErrorBoundary
 * Generic feature-level boundary
 * Use around any feature or section that should fail gracefully
 */
interface FeatureErrorBoundaryProps extends ErrorBoundaryProps {
  /** Feature name shown in error messages */
  featureName?: string;
}

export class FeatureErrorBoundary extends BaseErrorBoundary {
  private featureName: string;

  constructor(props: FeatureErrorBoundaryProps) {
    super({
      ...props,
      contextName: props.contextName ?? props.featureName ?? 'Feature',
    });
    this.featureName = props.featureName ?? 'this feature';
  }

  getErrorTitle(): string {
    return `${this.featureName} is unavailable`;
  }

  getErrorDescription(): string | undefined {
    return `There was a problem loading ${this.featureName}. Please try again or contact support if the problem persists.`;
  }
}

/**
 * RouteErrorBoundary
 * Specialized boundary for React Router error elements
 * Provides reset capability for navigation-based recovery
 */
interface RouteErrorBoundaryProps {
  /** Router navigate function */
  navigate: (path: string) => void;
  /** Default redirect path on reset */
  defaultPath?: string;
}

interface RouteErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class RouteErrorBoundary extends Component<
  RouteErrorBoundaryProps,
  RouteErrorBoundaryState
> {
  constructor(props: RouteErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): RouteErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logError(error, {
      contextName: 'Route',
      componentStack: errorInfo.componentStack,
    });
  }

  handleReset = (): void => {
    const { navigate, defaultPath = '/' } = this.props;
    this.setState({ hasError: false, error: null });
    navigate(defaultPath);
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          resetErrorBoundary={this.handleReset}
          title="Page failed to load"
          description="There was a problem loading this page. You'll be redirected to the home page."
        />
      );
    }

    // Route boundaries wrap error elements, not children
    return null;
  }
}

/**
 * AsyncErrorBoundary
 * Boundary that can be reset programmatically from outside
 * Useful for async operations that need recovery
 */
interface AsyncErrorBoundaryProps extends ErrorBoundaryProps {
  /** Reset key - when changed, resets the boundary */
  resetKey?: string | number;
}

export class AsyncErrorBoundary extends BaseErrorBoundary {
  private lastResetKey: string | number | undefined;

  constructor(props: AsyncErrorBoundaryProps) {
    super({ ...props, contextName: props.contextName ?? 'Async' });
    this.lastResetKey = props.resetKey;
  }

  componentDidUpdate(prevProps: AsyncErrorBoundaryProps): void {
    if (
      this.props.resetKey !== undefined &&
      this.props.resetKey !== this.lastResetKey
    ) {
      this.lastResetKey = this.props.resetKey;
      if (this.state.hasError) {
        this.handleReset();
      }
    }
  }

  getErrorTitle(): string {
    return 'Operation failed';
  }

  getErrorDescription(): string | undefined {
    return 'There was a problem completing your request. You can try again.';
  }
}

/**
 * MinimalErrorBoundary
 * Shows minimal UI - just a button to retry
 * Use for small components where space is limited
 */
interface MinimalErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface MinimalErrorBoundaryState {
  hasError: boolean;
}

export class MinimalErrorBoundary extends Component<
  MinimalErrorBoundaryProps,
  MinimalErrorBoundaryState
> {
  constructor(props: MinimalErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): MinimalErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logError(error, {
      contextName: 'Minimal',
      componentStack: errorInfo.componentStack,
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = (): void => {
    this.setState({ hasError: false });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <button
          onClick={this.handleRetry}
          className="px-3 py-1 text-sm text-red-400 hover:text-red-300 transition-colors"
          aria-label="Retry loading component"
        >
          Retry
        </button>
      );
    }

    return this.props.children;
  }
}

// Re-export types for convenience
export type { ErrorBoundaryProps, ErrorBoundaryState };
