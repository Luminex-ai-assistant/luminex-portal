/**
 * Search types for the global search feature
 */

// Import and re-export enums from card types
export { CardStatus, Priority } from '@/types/card';

import type { CardStatus, Priority } from '@/types/card';

/** Search result types */
export enum SearchResultType {
  CARD = 'card',
  PROJECT = 'project',
  WORKSPACE = 'workspace',
}

/** Base search result */
export interface SearchResultBase {
  id: string;
  type: SearchResultType;
  title: string;
  score?: number;
}

/** Card search result */
export interface CardSearchResult extends SearchResultBase {
  type: SearchResultType.CARD;
  identifier: string;
  description: string | null;
  status: CardStatus;
  priority: Priority;
  projectId: string;
  projectName: string;
  workspaceId: string;
  workspaceName: string;
  assigneeNames: string[];
}

/** Project search result */
export interface ProjectSearchResult extends SearchResultBase {
  type: SearchResultType.PROJECT;
  description: string | null;
  workspaceId: string;
  workspaceName: string;
  cardCount: number;
}

/** Workspace search result */
export interface WorkspaceSearchResult extends SearchResultBase {
  type: SearchResultType.WORKSPACE;
  description: string | null;
  memberCount: number;
  projectCount: number;
}

/** Union type for all search results */
export type SearchResult = CardSearchResult | ProjectSearchResult | WorkspaceSearchResult;

/** Search filters */
export interface SearchFilters {
  types?: SearchResultType[];
  workspaceId?: string;
  projectId?: string;
}

/** Grouped search results */
export interface GroupedSearchResults {
  cards: CardSearchResult[];
  projects: ProjectSearchResult[];
  workspaces: WorkspaceSearchResult[];
}

/** Mock project type for search data */
export interface MockProject {
  id: string;
  name: string;
  description: string | null;
  workspaceId: string;
  workspaceName: string;
  cardCount: number;
}

/** Mock workspace type for search data */
export interface MockWorkspace {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
  projectCount: number;
}
