import * as React from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchInputProps {
  /** Current search value */
  value: string;
  /** Callback when value changes */
  onChange: (value: string) => void;
  /** Whether search is loading */
  isLoading?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
  /** Callback when input is focused */
  onFocus?: () => void;
  /** Callback when a key is pressed */
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  /** Ref for the input element */
  inputRef?: React.Ref<HTMLInputElement>;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      onChange,
      isLoading = false,
      placeholder = 'Search tasks, projects, workspaces...',
      className,
      onFocus,
      onKeyDown,
      inputRef,
    },
    ref
  ) => {
    const internalRef = React.useRef<HTMLInputElement>(null);
    const inputElement = (inputRef as React.RefObject<HTMLInputElement>) || internalRef;

    // Merge refs
    React.useImperativeHandle(ref, () => inputElement.current!);

    const hasValue = value.length > 0;

    const handleClear = () => {
      onChange('');
      // Focus back on input after clearing
      inputElement.current?.focus();
    };

    return (
      <div
        className={cn(
          'relative flex items-center w-full',
          className
        )}
      >
        {/* Search Icon */}
        <div className="absolute left-4 pointer-events-none">
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-slate-400" />
          )}
        </div>

        {/* Input */}
        <input
          ref={inputElement}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className={cn(
            'w-full h-14 pl-12 pr-12',
            'bg-transparent text-slate-100 text-base',
            'placeholder:text-slate-500',
            'focus:outline-none',
            'border-b border-slate-800',
            'transition-colors'
          )}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />

        {/* Clear Button */}
        {hasValue && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              'absolute right-4',
              'p-1.5 rounded-md',
              'text-slate-400 hover:text-slate-200 hover:bg-slate-800',
              'transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950'
            )}
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';
