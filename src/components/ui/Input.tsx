import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, disabled, required, ...props }, ref) => {
    const id = React.useId();
    const inputId = props.id || id;
    const hasError = !!error;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium mb-1.5',
              hasError ? 'text-red-400' : 'text-slate-300'
            )}
          >
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          disabled={disabled}
          required={required}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          className={cn(
            'flex h-10 w-full rounded-lg border bg-slate-900 px-3 py-2 text-sm text-slate-100 transition-colors',
            'placeholder:text-slate-500',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
            'disabled:cursor-not-allowed disabled:opacity-50',
            hasError
              ? 'border-red-500 focus-visible:border-red-500'
              : 'border-slate-700 focus-visible:border-indigo-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {hasError && (
          <p id={`${inputId}-error`} className="mt-1.5 text-xs text-red-400" role="alert">
            {error}
          </p>
        )}
        {helperText && !hasError && (
          <p id={`${inputId}-helper`} className="mt-1.5 text-xs text-slate-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
