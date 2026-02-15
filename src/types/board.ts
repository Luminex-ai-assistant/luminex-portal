/**
 * Board types for the portal
 * Boards organize cards in lists/columns
 */

/** Board view types */
export enum BoardView {
  BOARD = 'board',
  LIST = 'list',
  CALENDAR = 'calendar',
  TIMELINE = 'timeline',
  TABLE = 'table',
}

/** List (column) in a board */
export interface List {
  id: string;
  boardId: string;
  name: string;
  description: string | null;
  position: number;
  color: string | null;
  limit: number | null; // WIP limit
  isCollapsed: boolean;
  cardCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Board column (alias for List) */
export interface BoardColumn extends List {}

/** Board filter settings */
export interface BoardFilter {
  assignees: string[];
  labels: string[];
  dueDateRange: { start: string | null; end: string | null } | null;
  priority: string[];
  status: string[];
  searchQuery: string;
}

/** Board settings */
export interface BoardSettings {
  defaultView: BoardView;
  visibleViews: BoardView[];
  showCardCover: boolean;
  showCardLabels: boolean;
  showCardDueDate: boolean;
  showCardAssignees: boolean;
  autoArchiveDays: number | null;
  customFields: BoardCustomField[];
}

/** Custom field for cards on this board */
export interface BoardCustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multi_select' | 'checkbox' | 'url';
  options?: string[];
  defaultValue?: unknown;
}

/** Board entity */
export interface Board {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  settings: BoardSettings;
  columns: BoardColumn[];
  filter: BoardFilter;
  isArchived: boolean;
  cardCount: number;
  position: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/** Board summary for lists */
export interface BoardSummary {
  id: string;
  name: string;
  defaultView: BoardView;
  cardCount: number;
  isArchived: boolean;
}
