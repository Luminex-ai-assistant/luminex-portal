/**
 * Custom hook for dnd-kit drag and drop
 * Handle drag start/move/end
 * Optimistic updates
 * Call moveCard mutation
 */

import { useState, useCallback } from 'react';
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { useBoardStore } from '@/stores/boardStore';
import { useMoveCard } from '@/hooks/useCards';
import type { CardBoardView } from '@/types/card';

interface UseDragAndDropOptions {
  boardId: string;
  cardsByColumn: Map<string, CardBoardView[]>;
  onCardsReorder?: (newCardsByColumn: Map<string, CardBoardView[]>) => void;
}

interface UseDragAndDropReturn {
  // State
  activeCard: CardBoardView | null;
  activeColumnId: string | null;
  
  // Handlers
  handleDragStart: (event: DragStartEvent) => void;
  handleDragOver: (event: DragOverEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  
  // Helpers
  findCardById: (cardId: string) => { card: CardBoardView; columnId: string } | null;
  findColumnByCardId: (cardId: string) => string | null;
}

/**
 * Custom hook for managing drag and drop operations with optimistic updates
 */
export function useDragAndDrop({
  cardsByColumn,
  onCardsReorder,
}: UseDragAndDropOptions): UseDragAndDropReturn {
  const [activeCard, setActiveCard] = useState<CardBoardView | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  
  const { setDraggedCard, setDropTarget, queueMove, confirmMove, revertMove } = useBoardStore();
  const moveCardMutation = useMoveCard();
  
  /**
   * Find a card by ID and return the card with its column ID
   */
  const findCardById = useCallback((cardId: string): { card: CardBoardView; columnId: string } | null => {
    for (const [columnId, cards] of cardsByColumn.entries()) {
      const card = cards.find(c => c.id === cardId);
      if (card) {
        return { card, columnId };
      }
    }
    return null;
  }, [cardsByColumn]);
  
  /**
   * Find which column contains a specific card
   */
  const findColumnByCardId = useCallback((cardId: string): string | null => {
    const result = findCardById(cardId);
    return result?.columnId || null;
  }, [findCardById]);
  
  /**
   * Handle drag start - set the active card and update store
   */
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const cardId = active.id as string;
    
    const result = findCardById(cardId);
    if (result) {
      setActiveCard(result.card);
      setActiveColumnId(result.columnId);
      setDraggedCard(cardId);
    }
  }, [findCardById, setDraggedCard]);
  
  /**
   * Handle drag over - update drop target in store for visual feedback
   */
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    
    if (over) {
      const overId = over.id as string;
      // Check if we're over a column directly
      if (cardsByColumn.has(overId)) {
        setDropTarget(overId);
      } else {
        // We're over a card, find its column
        const columnId = findColumnByCardId(overId);
        if (columnId) {
          setDropTarget(columnId);
        }
      }
    } else {
      setDropTarget(null);
    }
  }, [cardsByColumn, findColumnByCardId, setDropTarget]);
  
  /**
   * Handle drag end - perform the move with optimistic update
   */
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      // Drag cancelled - reset state
      setActiveCard(null);
      setActiveColumnId(null);
      setDraggedCard(null);
      setDropTarget(null);
      return;
    }
    
    const cardId = active.id as string;
    const overId = over.id as string;
    
    const sourceResult = findCardById(cardId);
    if (!sourceResult) {
      setActiveCard(null);
      setActiveColumnId(null);
      setDraggedCard(null);
      setDropTarget(null);
      return;
    }
    
    const { card, columnId: sourceColumnId } = sourceResult;
    
    // Determine target column and position
    let targetColumnId: string;
    let targetIndex: number;
    
    if (cardsByColumn.has(overId)) {
      // Dropped directly on a column - add to end
      targetColumnId = overId;
      const targetCards = cardsByColumn.get(targetColumnId) || [];
      targetIndex = targetCards.length;
    } else {
      // Dropped on a card - find its column and position
      const targetResult = findCardById(overId);
      if (targetResult) {
        targetColumnId = targetResult.columnId;
        const targetCards = cardsByColumn.get(targetColumnId) || [];
        targetIndex = targetCards.findIndex(c => c.id === overId);
        
        // If dragging from same column and target is after source, adjust index
        if (sourceColumnId === targetColumnId) {
          const sourceIndex = targetCards.findIndex(c => c.id === cardId);
          if (sourceIndex < targetIndex) {
            targetIndex += 1;
          }
        }
      } else {
        // Fallback - shouldn't happen
        targetColumnId = sourceColumnId;
        targetIndex = 0;
      }
    }
    
    // Don't do anything if dropping in the same position
    if (sourceColumnId === targetColumnId) {
      const sourceCards = cardsByColumn.get(sourceColumnId) || [];
      const sourceIndex = sourceCards.findIndex(c => c.id === cardId);
      if (sourceIndex === targetIndex || sourceIndex === targetIndex - 1) {
        setActiveCard(null);
        setActiveColumnId(null);
        setDraggedCard(null);
        setDropTarget(null);
        return;
      }
    }
    
    // Create optimistic update
    const newCardsByColumn = new Map(cardsByColumn);
    
    // Remove from source column
    const sourceCards = [...(newCardsByColumn.get(sourceColumnId) || [])];
    const sourceIndex = sourceCards.findIndex(c => c.id === cardId);
    if (sourceIndex > -1) {
      sourceCards.splice(sourceIndex, 1);
      newCardsByColumn.set(sourceColumnId, sourceCards);
    }
    
    // Add to target column
    const targetCards = [...(newCardsByColumn.get(targetColumnId) || [])];
    
    // Determine the new status based on target column
    const columnStatusMap: Record<string, string> = {
      col_backlog: 'backlog',
      col_todo: 'todo',
      col_in_progress: 'in_progress',
      col_review: 'review',
      col_done: 'done',
    };
    const newStatus = columnStatusMap[targetColumnId] || card.status;
    
    // Insert at target position with updated status
    const updatedCard: CardBoardView = {
      ...card,
      status: newStatus as CardBoardView['status'],
      position: targetIndex,
    };
    
    targetCards.splice(targetIndex, 0, updatedCard);
    
    // Update positions for all cards in target column
    targetCards.forEach((c, idx) => {
      c.position = idx;
    });
    
    newCardsByColumn.set(targetColumnId, targetCards);
    
    // Notify parent of reorder
    if (onCardsReorder) {
      onCardsReorder(newCardsByColumn);
    }
    
    // Queue the move for API
    const moveId = queueMove({
      cardId,
      targetListId: targetColumnId,
      targetIndex,
      status: 'pending',
      retryCount: 0,
    });
    
    // Call API to persist the move
    moveCardMutation.mutate(
      {
        cardId,
        targetListId: targetColumnId,
        targetIndex,
      },
      {
        onSuccess: () => {
          confirmMove(moveId);
        },
        onError: () => {
          revertMove(moveId);
          // Optionally revert the optimistic update here
        },
      }
    );
    
    // Reset drag state
    setActiveCard(null);
    setActiveColumnId(null);
    setDraggedCard(null);
    setDropTarget(null);
  }, [
    cardsByColumn,
    findCardById,
    onCardsReorder,
    queueMove,
    confirmMove,
    revertMove,
    setDraggedCard,
    setDropTarget,
    moveCardMutation,
  ]);
  
  return {
    activeCard,
    activeColumnId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    findCardById,
    findColumnByCardId,
  };
}
