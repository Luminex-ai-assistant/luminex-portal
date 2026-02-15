import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
} from '@/components/ui/Dialog';
import { cn } from '@/lib/utils';
import { useSearch } from './hooks/useSearch';
import { useCommandK } from './hooks/useKeyboardShortcut';
import { SearchInput } from './components/SearchInput';
import { SearchResults } from './components/SearchResults';
import type { SearchResult } from './types';

export interface SearchModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
}

/**
 * Command palette style search modal
 * - Opens with Cmd/Ctrl + K
 * - Close with Escape or click outside
 * - Keyboard navigation with arrow keys
 * - Grouped results by type
 */
export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const { query, setQuery, groupedResults, isLoading, hasResults, totalResults } = useSearch();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  // Reset selected index when query changes
  React.useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when modal opens
  React.useEffect(() => {
    if (isOpen) {
      // Small delay to ensure the modal is rendered
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      // Clear query when modal closes
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen, setQuery]);

  // Calculate total results count for navigation
  const totalCount =
    groupedResults.workspaces.length +
    groupedResults.projects.length +
    groupedResults.cards.length;

  // Handle keyboard navigation
  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % Math.max(totalCount, 1));
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex((prev) =>
            prev <= 0 ? Math.max(totalCount - 1, 0) : prev - 1
          );
          break;
        case 'Enter':
          event.preventDefault();
          if (totalCount > 0 && selectedIndex >= 0 && selectedIndex < totalCount) {
            // Get the selected result
            const allResults = [
              ...groupedResults.workspaces,
              ...groupedResults.projects,
              ...groupedResults.cards,
            ];
            const selectedResult = allResults[selectedIndex];
            if (selectedResult) {
              handleSelect(selectedResult);
            }
          }
          break;
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
      }
    },
    [totalCount, selectedIndex, groupedResults, onClose]
  );

  // Handle result selection
  const handleSelect = React.useCallback(
    (result: SearchResult) => {
      onClose();
      // Navigation is handled by SearchResultItem
    },
    [onClose]
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay className="bg-black/60 backdrop-blur-sm" />
        <DialogContent
          className={cn(
            'max-w-2xl p-0 gap-0 overflow-hidden',
            'bg-slate-950 border-slate-800',
            'shadow-2xl shadow-black/50'
          )}
          onPointerDownOutside={onClose}
          onEscapeKeyDown={onClose}
        >
          {/* Header with search input */}
          <div className="border-b border-slate-800">
            <SearchInput
              ref={inputRef}
              value={query}
              onChange={setQuery}
              isLoading={isLoading}
              onKeyDown={handleKeyDown}
              placeholder="Search tasks, projects, workspaces..."
            />
          </div>

          {/* Results area */}
          <div className="max-h-[60vh] overflow-hidden">
            <SearchResults
              results={groupedResults}
              query={query}
              isLoading={isLoading}
              onSelect={handleSelect}
              selectedIndex={selectedIndex}
            />
          </div>

          {/* Status bar */}
          <div className="border-t border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-500 bg-slate-900/50">
            <div className="flex items-center gap-4">
              {query.trim() && (
                <span>
                  {totalResults > 0 ? (
                    <>
                      <span className="text-slate-300 font-medium">
                        {totalResults}
                      </span>{' '}
                      result{totalResults !== 1 ? 's' : ''}
                    </>
                  ) : (
                    'No results'
                  )}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 font-mono text-[10px]">
                  ⌘K
                </kbd>
                <span className="hidden sm:inline">to search</span>
              </span>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
