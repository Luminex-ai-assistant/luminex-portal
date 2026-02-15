import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  autoResize?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, disabled, required, autoResize = false, rows = 4, ...props }, ref) => {
    const id = React.useId();
    const textareaId = props.id || id;
    const hasError = !!error;
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    React.useImperativeHandle(ref, () => textareaRef.current!);

    const handleInput = React.useCallback(
      (e: React.FormEvent<HTMLTextAreaElement>) => {
        if (autoResize && textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
        props.onInput?.(e);
      },
      [autoResize, props.onInput]
    );

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className={cn(
              'block text-sm font-medium mb-1.5',
              hasError ? 'text-red-400' : 'text-slate-300'
            )}
          >
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          disabled={disabled}
          required={required}
          rows={rows}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
          className={cn(
            'flex min-h-[80px] w-full rounded-lg border bg-slate-900 px-3 py-2 text-sm text-slate-100 transition-colors',
            autoResize && 'resize-none overflow-hidden',
            !autoResize && 'resize-y',
            'placeholder:text-slate-500',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
            'disabled:cursor-not-allowed disabled:opacity-50',
            hasError
              ? 'border-red-500 focus-visible:border-red-500'
              : 'border-slate-700 focus-visible:border-indigo-500',
            className
          )}
          ref={textareaRef}
          onInput={handleInput}
          {...props}
        />
        {hasError && (
          <p id={`${textareaId}-error`} className="mt-1.5 text-xs text-red-400" role="alert">
            {error}
          </p>
        )}
        {helperText && !hasError && (
          <p id={`${textareaId}-helper`} className="mt-1.5 text-xs text-slate-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
