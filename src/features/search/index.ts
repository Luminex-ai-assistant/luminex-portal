// Search feature exports

// Main component
export { SearchModal } from './SearchModal';

// Components
export { SearchInput } from './components/SearchInput';
export { SearchResults } from './components/SearchResults';
export { SearchResultItem } from './components/SearchResultItem';

// Hooks
export { useSearch } from './hooks/useSearch';
export { useKeyboardShortcut, useCommandK } from './hooks/useKeyboardShortcut';

// Types
export type {
  SearchResult,
  CardSearchResult,
  ProjectSearchResult,
  WorkspaceSearchResult,
  SearchFilters,
  GroupedSearchResults,
} from './types';

export { SearchResultType, CardStatus, Priority } from './types';
