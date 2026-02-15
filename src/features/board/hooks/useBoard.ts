/**
 * React Query hook for board data
 * Fetch columns and cards
 */

import { useQuery } from '@tanstack/react-query';
import type { Board, BoardColumn, BoardView } from '@/types/board';
import type { CardBoardView, CardStatus, Priority, CardLabel } from '@/types/card';
import type { PublicUser } from '@/types/user';

// Mock users for assignees
const mockUsers: PublicUser[] = [
  { id: 'user_1', name: 'Alex Chen', avatarUrl: null },
  { id: 'user_2', name: 'Sarah Johnson', avatarUrl: null },
  { id: 'user_3', name: 'Mike Ross', avatarUrl: null },
  { id: 'user_4', name: 'Emily Davis', avatarUrl: null },
];

// Mock labels
const mockLabels: CardLabel[] = [
  { id: 'label_1', name: 'Bug', color: '#ef4444' },
  { id: 'label_2', name: 'Feature', color: '#22c55e' },
  { id: 'label_3', name: 'Design', color: '#a855f7' },
  { id: 'label_4', name: 'High Priority', color: '#f97316' },
  { id: 'label_5', name: 'Research', color: '#3b82f6' },
];

// Generate mock cards
const generateMockCards = (): CardBoardView[] => {
  const cards: CardBoardView[] = [
    {
      id: 'card_1',
      identifier: 'PROJ-101',
      title: 'Design system components',
      status: 'done' as CardStatus,
      priority: 'high' as Priority,
      position: 0,
      assignees: [mockUsers[0], mockUsers[1]],
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      labels: [mockLabels[2]],
      tags: ['ui', 'design'],
      hasDescription: true,
      subtaskCount: 3,
      completedSubtaskCount: 3,
      commentCount: 5,
      attachmentCount: 2,
      coverImageUrl: null,
      estimate: 8,
    },
    {
      id: 'card_2',
      identifier: 'PROJ-102',
      title: 'Implement authentication flow',
      status: 'in_progress' as CardStatus,
      priority: 'urgent' as Priority,
      position: 0,
      assignees: [mockUsers[0]],
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      labels: [mockLabels[1], mockLabels[3]],
      tags: ['auth', 'security'],
      hasDescription: true,
      subtaskCount: 5,
      completedSubtaskCount: 2,
      commentCount: 8,
      attachmentCount: 1,
      coverImageUrl: null,
      estimate: 13,
    },
    {
      id: 'card_3',
      identifier: 'PROJ-103',
      title: 'Fix navigation bug on mobile',
      status: 'review' as CardStatus,
      priority: 'medium' as Priority,
      position: 0,
      assignees: [mockUsers[2]],
      dueDate: null,
      labels: [mockLabels[0]],
      tags: ['bug', 'mobile'],
      hasDescription: true,
      subtaskCount: 0,
      completedSubtaskCount: 0,
      commentCount: 3,
      attachmentCount: 0,
      coverImageUrl: null,
      estimate: 3,
    },
    {
      id: 'card_4',
      identifier: 'PROJ-104',
      title: 'User research interviews',
      status: 'backlog' as CardStatus,
      priority: 'low' as Priority,
      position: 0,
      assignees: [mockUsers[1], mockUsers[3]],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      labels: [mockLabels[4]],
      tags: ['research', 'ux'],
      hasDescription: true,
      subtaskCount: 2,
      completedSubtaskCount: 0,
      commentCount: 1,
      attachmentCount: 0,
      coverImageUrl: null,
      estimate: 5,
    },
    {
      id: 'card_5',
      identifier: 'PROJ-105',
      title: 'Database schema optimization',
      status: 'todo' as CardStatus,
      priority: 'high' as Priority,
      position: 0,
      assignees: [mockUsers[2]],
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      labels: [mockLabels[1]],
      tags: ['backend', 'database'],
      hasDescription: false,
      subtaskCount: 0,
      completedSubtaskCount: 0,
      commentCount: 2,
      attachmentCount: 1,
      coverImageUrl: null,
      estimate: 8,
    },
    {
      id: 'card_6',
      identifier: 'PROJ-106',
      title: 'API documentation',
      status: 'in_progress' as CardStatus,
      priority: 'medium' as Priority,
      position: 1,
      assignees: [mockUsers[0]],
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      labels: [mockLabels[4]],
      tags: ['docs', 'api'],
      hasDescription: true,
      subtaskCount: 4,
      completedSubtaskCount: 1,
      commentCount: 0,
      attachmentCount: 0,
      coverImageUrl: null,
      estimate: 5,
    },
    {
      id: 'card_7',
      identifier: 'PROJ-107',
      title: 'Performance monitoring setup',
      status: 'backlog' as CardStatus,
      priority: 'low' as Priority,
      position: 1,
      assignees: [],
      dueDate: null,
      labels: [mockLabels[1]],
      tags: ['devops', 'monitoring'],
      hasDescription: false,
      subtaskCount: 0,
      completedSubtaskCount: 0,
      commentCount: 0,
      attachmentCount: 0,
      coverImageUrl: null,
      estimate: null,
    },
    {
      id: 'card_8',
      identifier: 'PROJ-108',
      title: 'Email notification service',
      status: 'todo' as CardStatus,
      priority: 'high' as Priority,
      position: 1,
      assignees: [mockUsers[3]],
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      labels: [mockLabels[1], mockLabels[3]],
      tags: ['backend', 'notifications'],
      hasDescription: true,
      subtaskCount: 3,
      completedSubtaskCount: 0,
      commentCount: 4,
      attachmentCount: 0,
      coverImageUrl: null,
      estimate: 8,
    },
    {
      id: 'card_9',
      identifier: 'PROJ-109',
      title: 'Dark mode implementation',
      status: 'review' as CardStatus,
      priority: 'medium' as Priority,
      position: 1,
      assignees: [mockUsers[1]],
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      labels: [mockLabels[2]],
      tags: ['ui', 'theme'],
      hasDescription: true,
      subtaskCount: 2,
      completedSubtaskCount: 2,
      commentCount: 6,
      attachmentCount: 3,
      coverImageUrl: null,
      estimate: 5,
    },
    {
      id: 'card_10',
      identifier: 'PROJ-110',
      title: 'Unit tests for utils',
      status: 'done' as CardStatus,
      priority: 'low' as Priority,
      position: 1,
      assignees: [mockUsers[2]],
      dueDate: null,
      labels: [mockLabels[1]],
      tags: ['testing'],
      hasDescription: false,
      subtaskCount: 10,
      completedSubtaskCount: 10,
      commentCount: 2,
      attachmentCount: 0,
      coverImageUrl: null,
      estimate: 5,
    },
    {
      id: 'card_11',
      identifier: 'PROJ-111',
      title: 'Third-party integrations research',
      status: 'backlog' as CardStatus,
      priority: 'lowest' as Priority,
      position: 2,
      assignees: [],
      dueDate: null,
      labels: [mockLabels[4]],
      tags: ['research'],
      hasDescription: true,
      subtaskCount: 0,
      completedSubtaskCount: 0,
      commentCount: 0,
      attachmentCount: 0,
      coverImageUrl: null,
      estimate: null,
    },
    {
      id: 'card_12',
      identifier: 'PROJ-112',
      title: 'Analytics dashboard',
      status: 'in_progress' as CardStatus,
      priority: 'high' as Priority,
      position: 2,
      assignees: [mockUsers[0], mockUsers[1]],
      dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      labels: [mockLabels[2], mockLabels[3]],
      tags: ['analytics', 'dashboard'],
      hasDescription: true,
      subtaskCount: 6,
      completedSubtaskCount: 2,
      commentCount: 7,
      attachmentCount: 1,
      coverImageUrl: null,
      estimate: 13,
    },
    {
      id: 'card_13',
      identifier: 'PROJ-113',
      title: 'Bug: Login session timeout',
      status: 'todo' as CardStatus,
      priority: 'urgent' as Priority,
      position: 2,
      assignees: [mockUsers[2]],
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      labels: [mockLabels[0], mockLabels[3]],
      tags: ['bug', 'auth', 'critical'],
      hasDescription: true,
      subtaskCount: 1,
      completedSubtaskCount: 0,
      commentCount: 9,
      attachmentCount: 2,
      coverImageUrl: null,
      estimate: 3,
    },
    {
      id: 'card_14',
      identifier: 'PROJ-114',
      title: 'Accessibility audit',
      status: 'review' as CardStatus,
      priority: 'medium' as Priority,
      position: 2,
      assignees: [mockUsers[3]],
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      labels: [mockLabels[2]],
      tags: ['a11y', 'audit'],
      hasDescription: true,
      subtaskCount: 8,
      completedSubtaskCount: 6,
      commentCount: 3,
      attachmentCount: 1,
      coverImageUrl: null,
      estimate: 8,
    },
    {
      id: 'card_15',
      identifier: 'PROJ-115',
      title: 'Deploy to production',
      status: 'done' as CardStatus,
      priority: 'highest' as Priority,
      position: 2,
      assignees: [mockUsers[0]],
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      labels: [mockLabels[1]],
      tags: ['deploy', 'release'],
      hasDescription: true,
      subtaskCount: 5,
      completedSubtaskCount: 5,
      commentCount: 12,
      attachmentCount: 0,
      coverImageUrl: null,
      estimate: 3,
    },
  ];

  return cards;
};

// Map cards to columns
const mapCardsToColumns = (cards: CardBoardView[], columns: BoardColumn[]): Map<string, CardBoardView[]> => {
  const columnMap = new Map<string, CardBoardView[]>();
  
  // Initialize empty arrays for each column
  columns.forEach(col => columnMap.set(col.id, []));
  
  // Distribute cards to columns based on status
  cards.forEach(card => {
    const columnId = columns.find(col => {
      const colStatus = col.name.toLowerCase().replace(' ', '_');
      return colStatus === card.status || 
             (col.name === 'Backlog' && card.status === 'backlog') ||
             (col.name === 'Todo' && card.status === 'todo') ||
             (col.name === 'In Progress' && card.status === 'in_progress') ||
             (col.name === 'Review' && card.status === 'review') ||
             (col.name === 'Done' && card.status === 'done');
    })?.id;
    
    if (columnId) {
      const existing = columnMap.get(columnId) || [];
      existing.push(card);
      columnMap.set(columnId, existing);
    }
  });
  
  // Sort cards by position in each column
  columnMap.forEach((columnCards, columnId) => {
    columnMap.set(columnId, columnCards.sort((a, b) => a.position - b.position));
  });
  
  return columnMap;
};

// Mock API function to fetch board data
const fetchBoardData = async (boardId: string): Promise<{ board: Board; cardsByColumn: Map<string, CardBoardView[]> }> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const columns: BoardColumn[] = [
    {
      id: 'col_backlog',
      boardId,
      name: 'Backlog',
      description: 'Tasks to be prioritized',
      position: 0,
      color: '#64748b',
      limit: null,
      isCollapsed: false,
      cardCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'col_todo',
      boardId,
      name: 'Todo',
      description: 'Ready to work on',
      position: 1,
      color: '#3b82f6',
      limit: 10,
      isCollapsed: false,
      cardCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'col_in_progress',
      boardId,
      name: 'In Progress',
      description: 'Currently being worked on',
      position: 2,
      color: '#f59e0b',
      limit: 5,
      isCollapsed: false,
      cardCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'col_review',
      boardId,
      name: 'Review',
      description: 'Waiting for review',
      position: 3,
      color: '#a855f7',
      limit: 8,
      isCollapsed: false,
      cardCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'col_done',
      boardId,
      name: 'Done',
      description: 'Completed tasks',
      position: 4,
      color: '#22c55e',
      limit: null,
      isCollapsed: false,
      cardCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  
  const cards = generateMockCards();
  const cardsByColumn = mapCardsToColumns(cards, columns);
  
  // Update card counts
  columns.forEach(col => {
    col.cardCount = cardsByColumn.get(col.id)?.length || 0;
  });
  
  const board: Board = {
    id: boardId,
    projectId: 'proj_1',
    name: 'Product Development Board',
    description: 'Main board for tracking product development tasks',
    settings: {
      defaultView: 'board' as BoardView,
      visibleViews: ['board', 'list', 'calendar', 'timeline'] as BoardView[],
      showCardCover: true,
      showCardLabels: true,
      showCardDueDate: true,
      showCardAssignees: true,
      autoArchiveDays: null,
      customFields: [],
    },
    columns,
    filter: {
      assignees: [],
      labels: [],
      dueDateRange: null,
      priority: [],
      status: [],
      searchQuery: '',
    },
    isArchived: false,
    cardCount: cards.length,
    position: 0,
    createdBy: 'user_1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  return { board, cardsByColumn };
};

// Query keys
export const boardKeys = {
  all: ['boards'] as const,
  lists: () => [...boardKeys.all, 'list'] as const,
  details: () => [...boardKeys.all, 'detail'] as const,
  detail: (id: string) => [...boardKeys.details(), id] as const,
  data: (id: string) => [...boardKeys.all, 'data', id] as const,
};

/**
 * Hook to fetch board data with columns and cards
 */
export function useBoard(boardId: string) {
  return useQuery({
    queryKey: boardKeys.data(boardId),
    queryFn: () => fetchBoardData(boardId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch multiple boards
 */
export function useBoards() {
  return useQuery({
    queryKey: boardKeys.lists(),
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return [
        { id: 'board_1', name: 'Product Development Board', defaultView: 'board' as BoardView, cardCount: 15, isArchived: false },
        { id: 'board_2', name: 'Marketing Sprint', defaultView: 'board' as BoardView, cardCount: 8, isArchived: false },
        { id: 'board_3', name: 'Bug Tracking', defaultView: 'list' as BoardView, cardCount: 23, isArchived: false },
      ];
    },
    staleTime: 1000 * 60 * 5,
  });
}
