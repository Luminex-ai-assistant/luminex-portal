/**
 * React Query hooks for cards
 * createCard, updateCard, moveCard, deleteCard
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Card } from '@/types/card';

// Mock API functions - replace with real API calls
const mockCreateCard = async (card: Partial<Card>): Promise<Card> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return {
    id: `card_${Date.now()}`,
    boardId: card.boardId || '',
    columnId: card.columnId || '',
    projectId: card.projectId || '',
    workspaceId: card.workspaceId || '',
    identifier: card.identifier || 'PROJ-XXX',
    title: card.title || 'New Card',
    description: card.description || null,
    status: card.status || 'backlog',
    priority: card.priority || 'medium',
    position: card.position || 0,
    assigneeIds: card.assigneeIds || [],
    assignees: card.assignees || [],
    dueDate: card.dueDate || null,
    dueTime: card.dueTime || null,
    startDate: card.startDate || null,
    completedAt: card.completedAt || null,
    labels: card.labels || [],
    tags: card.tags || [],
    subtasks: card.subtasks || [],
    checklistItems: card.checklistItems || [],
    attachments: card.attachments || [],
    comments: card.comments || [],
    customFields: card.customFields || [],
    estimate: card.estimate || null,
    spentTime: card.spentTime || 0,
    parentId: card.parentId || null,
    dependencies: card.dependencies || [],
    createdBy: card.createdBy || 'user_1',
    createdByUser: card.createdByUser || { id: 'user_1', name: 'Current User', avatarUrl: null },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subtaskCount: 0,
    completedSubtaskCount: 0,
    commentCount: 0,
    attachmentCount: 0,
  };
};

const mockUpdateCard = async ({ id, updates }: { id: string; updates: Partial<Card> }): Promise<Card> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return {
    id,
    boardId: '',
    columnId: '',
    projectId: '',
    workspaceId: '',
    identifier: 'PROJ-XXX',
    title: 'Updated Card',
    description: null,
    status: 'backlog',
    priority: 'medium',
    position: 0,
    assigneeIds: [],
    assignees: [],
    dueDate: null,
    dueTime: null,
    startDate: null,
    completedAt: null,
    labels: [],
    tags: [],
    subtasks: [],
    checklistItems: [],
    attachments: [],
    comments: [],
    customFields: [],
    estimate: null,
    spentTime: 0,
    parentId: null,
    dependencies: [],
    createdBy: 'user_1',
    createdByUser: { id: 'user_1', name: 'Current User', avatarUrl: null },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subtaskCount: 0,
    completedSubtaskCount: 0,
    commentCount: 0,
    attachmentCount: 0,
    ...updates,
  } as Card;
};

const mockMoveCard = async (): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  // Simulate API call success
};

const mockDeleteCard = async (): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  // Simulate API call success
};

// Query keys
export const cardKeys = {
  all: ['cards'] as const,
  lists: () => [...cardKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...cardKeys.lists(), filters] as const,
  details: () => [...cardKeys.all, 'detail'] as const,
  detail: (id: string) => [...cardKeys.details(), id] as const,
  board: (boardId: string) => [...cardKeys.all, 'board', boardId] as const,
  column: (columnId: string) => [...cardKeys.all, 'column', columnId] as const,
};

/**
 * Hook to create a new card
 */
export function useCreateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mockCreateCard,
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: cardKeys.board(data.boardId) });
      queryClient.invalidateQueries({ queryKey: cardKeys.column(data.columnId) });
    },
  });
}

/**
 * Hook to update an existing card
 */
export function useUpdateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mockUpdateCard,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: cardKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: cardKeys.board(data.boardId) });
      queryClient.invalidateQueries({ queryKey: cardKeys.column(data.columnId) });
    },
  });
}

/**
 * Hook to move a card (drag and drop)
 */
export function useMoveCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mockMoveCard,
    onSuccess: () => {
      // Invalidate board queries to refetch card positions
      queryClient.invalidateQueries({ queryKey: cardKeys.all });
    },
  });
}

/**
 * Hook to delete a card
 */
export function useDeleteCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mockDeleteCard,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: cardKeys.all });
      queryClient.removeQueries({ queryKey: cardKeys.detail(id) });
    },
  });
}
