import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import Fuse from 'fuse.js';
import { useDebounce } from './useDebounce';
import type {
  SearchResult,
  CardSearchResult,
  ProjectSearchResult,
  WorkspaceSearchResult,
  SearchFilters,
  GroupedSearchResults,
} from '../types';
import { SearchResultType } from '../types';
import { mockCards, mockProjects, mockWorkspaces } from '../mockData';

const DEBOUNCE_MS = 300;

// Fuse.js options for fuzzy search
const fuseOptions: Fuse.IFuseOptions<SearchResult> = {
  keys: [
    { name: 'title', weight: 0.4 },
    { name: 'description', weight: 0.2 },
    { name: 'identifier', weight: 0.3 },
    { name: 'projectName', weight: 0.05 },
    { name: 'workspaceName', weight: 0.05 },
  ],
  threshold: 0.4,
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 2,
};

// Transform mock data to search results
const transformToSearchResults = (): SearchResult[] => {
  const cards: CardSearchResult[] = mockCards;
  
  const projects: ProjectSearchResult[] = mockProjects.map((project) => ({
    ...project,
    type: SearchResultType.PROJECT,
    title: project.name,
  }));
  
  const workspaces: WorkspaceSearchResult[] = mockWorkspaces.map((workspace) => ({
    ...workspace,
    type: SearchResultType.WORKSPACE,
    title: workspace.name,
  }));

  return [...cards, ...projects, ...workspaces];
};

interface UseSearchResult {
  /** Search query */
  query: string;
  /** Debounced query */
  debouncedQuery: string;
  /** Set search query */
  setQuery: (query: string) => void;
  /** All search results */
  results: SearchResult[];
  /** Grouped results by type */
  groupedResults: GroupedSearchResults;
  /** Whether search is loading */
  isLoading: boolean;
  /** Whether search has an error */
  isError: boolean;
  /** Error object */
  error: Error | null;
  /** Whether there are results */
  hasResults: boolean;
  /** Total number of results */
  totalResults: number;
}

/**
 * Hook for global search functionality
 * Uses React Query for caching and Fuse.js for fuzzy search
 */
export function useSearch(filters?: SearchFilters): UseSearchResult {
  // Debounce the search query
  const [debouncedQuery, setQuery, query] = useDebounce('', DEBOUNCE_MS);

  // Create Fuse instance with all searchable data
  const fuse = useMemo(() => {
    const allData = transformToSearchResults();
    return new Fuse(allData, fuseOptions);
  }, []);

  // Search query function
  const searchData = useCallback(async (): Promise<SearchResult[]> => {
    // Simulate network delay for realistic feel
    await new Promise((resolve) => setTimeout(resolve, 150));

    if (!debouncedQuery.trim()) {
      return [];
    }

    const searchResults = fuse.search(debouncedQuery);
    
    // Filter by type if specified
    let results = searchResults.map((result) => ({
      ...result.item,
      score: result.score ?? 1,
    }));

    if (filters?.types && filters.types.length > 0) {
      results = results.filter((item) => filters.types?.includes(item.type));
    }

    if (filters?.workspaceId) {
      results = results.filter(
        (item) =>
          ('workspaceId' in item && item.workspaceId === filters.workspaceId) ||
          ('id' in item && item.id === filters.workspaceId && item.type === SearchResultType.WORKSPACE)
      );
    }

    if (filters?.projectId) {
      results = results.filter(
        (item) =>
          ('projectId' in item && item.projectId === filters.projectId) ||
          ('id' in item && item.id === filters.projectId && item.type === SearchResultType.PROJECT)
      );
    }

    return results;
  }, [debouncedQuery, fuse, filters]);

  // React Query for search results
  const {
    data: results = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['search', debouncedQuery, filters],
    queryFn: searchData,
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  // Group results by type
  const groupedResults = useMemo((): GroupedSearchResults => {
    return {
      cards: results.filter((r): r is CardSearchResult => r.type === SearchResultType.CARD),
      projects: results.filter((r): r is ProjectSearchResult => r.type === SearchResultType.PROJECT),
      workspaces: results.filter((r): r is WorkspaceSearchResult => r.type === SearchResultType.WORKSPACE),
    };
  }, [results]);

  return {
    query,
    debouncedQuery,
    setQuery,
    results,
    groupedResults,
    isLoading,
    isError,
    error: error as Error | null,
    hasResults: results.length > 0,
    totalResults: results.length,
  };
}

/**
 * Hook for debounced value
 */
function useDebounce<T>(
  initialValue: T,
  delay: number
): [T, (value: T) => void, T] {
  const [value, setValue] = React.useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = React.useState<T>(initialValue);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return [debouncedValue, setValue, value];
}

// Add React import for useDebounce
import React from 'react';
