import * as React from 'react';
import { Search, FileQuestion } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GroupedSearchResults, SearchResult } from '../types';
import { SearchResultType } from '../types';
import { SearchResultItem } from './SearchResultItem';

export interface SearchResultsProps {
  /** Grouped search results */
  results: GroupedSearchResults;
  /** Current search query */
  query: string;
  /** Whether search is loading */
  isLoading?: boolean;
  /** Callback when a result is selected */
  onSelect?: (result: SearchResult) => void;
  /** Currently selected index (for keyboard navigation) */
  selectedIndex?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get flat list of all results for keyboard navigation
 */
function getFlatResults(results: GroupedSearchResults): SearchResult[] {
  return [
    ...results.workspaces,
    ...results.projects,
    ...results.cards,
  ];
}

/**
 * Search results component with grouping
 */
export function SearchResults({
  results,
  query,
  isLoading = false,
  onSelect,
  selectedIndex = -1,
  className,
}: SearchResultsProps) {
  const flatResults = React.useMemo(() => getFlatResults(results), [results]);
  
  const hasResults =
    results.cards.length > 0 ||
    results.projects.length > 0 ||
    results.workspaces.length > 0;

  const hasQuery = query.trim().length > 0;

  // Show empty state
  if (!hasQuery) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center py-12 text-center',
          className
        )}
      >
        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-4">
          <Search className="w-6 h-6 text-slate-500" />
        </div>
        <p className="text-slate-400 text-sm">
          Start typing to search for tasks, projects, or workspaces
        </p>
        <p className="text-slate-500 text-xs mt-2">
          Try searching for "design", "mobile", or "marketing"
        </p>
      </div>
    );
  }

  // Show no results state
  if (hasQuery && !hasResults && !isLoading) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center py-12 text-center',
          className
        )}
      >
        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-4">
          <FileQuestion className="w-6 h-6 text-slate-500" />
        </div>
        <p className="text-slate-400 text-sm">No results found for "{query}"</p>
        <p className="text-slate-500 text-xs mt-2">
          Try adjusting your search terms or check for typos
        </p>
      </div>
    );
  }

  // Calculate index offsets for each section
  let currentIndex = 0;
  const workspaceStartIndex = currentIndex;
  const workspaceEndIndex = workspaceStartIndex + results.workspaces.length;
  currentIndex = workspaceEndIndex;
  
  const projectStartIndex = currentIndex;
  const projectEndIndex = projectStartIndex + results.projects.length;
  currentIndex = projectEndIndex;
  
  const cardStartIndex = currentIndex;
  const cardEndIndex = cardStartIndex + results.cards.length;

  return (
    <div className={cn('overflow-y-auto max-h-[60vh]', className)}>
      {/* Workspaces Section */}
      {results.workspaces.length > 0 && (
        <section className="mb-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2 sticky top-0 bg-slate-900/95 backdrop-blur z-10">
            Workspaces
            <span className="ml-2 text-slate-600">
              ({results.workspaces.length})
            </span>
          </h3>
          <div className="space-y-1 px-2">
            {results.workspaces.map((workspace, index) => (
              <SearchResultItem
                key={workspace.id}
                result={workspace}
                query={query}
                isSelected={selectedIndex === workspaceStartIndex + index}
                onClick={() => onSelect?.(workspace)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Projects Section */}
      {results.projects.length > 0 && (
        <section className="mb-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2 sticky top-0 bg-slate-900/95 backdrop-blur z-10">
            Projects
            <span className="ml-2 text-slate-600">
              ({results.projects.length})
            </span>
          </h3>
          <div className="space-y-1 px-2">
            {results.projects.map((project, index) => (
              <SearchResultItem
                key={project.id}
                result={project}
                query={query}
                isSelected={selectedIndex === projectStartIndex + index}
                onClick={() => onSelect?.(project)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Cards Section */}
      {results.cards.length > 0 && (
        <section className="mb-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2 sticky top-0 bg-slate-900/95 backdrop-blur z-10">
            Tasks
            <span className="ml-2 text-slate-600">
              ({results.cards.length})
            </span>
          </h3>
          <div className="space-y-1 px-2">
            {results.cards.map((card, index) => (
              <SearchResultItem
                key={card.id}
                result={card}
                query={query}
                isSelected={selectedIndex === cardStartIndex + index}
                onClick={() => onSelect?.(card)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Keyboard hint footer */}
      <div className="px-4 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 sticky bottom-0 bg-slate-900/95 backdrop-blur">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 font-mono">
              ↑↓
            </kbd>
            to navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 font-mono">
              ↵
            </kbd>
            to select
          </span>
        </div>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 font-mono">
            esc
          </kbd>
          to close
        </span>
      </div>
    </div>
  );
}
