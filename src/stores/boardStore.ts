import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Card, PendingMove } from '@/types/card';

/**
 * Board store state for Kanban drag-and-drop
 * with optimistic updates
 */
interface BoardState {
  // Drag state
  draggedCardId: string | null;
  dropTargetListId: string | null;

  // Optimistic updates
  optimisticCards: Map<string, Partial<Card>>;
  pendingMoves: PendingMove[];
}

/**
 * Board store actions
 */
interface BoardActions {
  // Drag actions
  setDraggedCard: (cardId: string | null) => void;
  setDropTarget: (listId: string | null) => void;

  // Optimistic move actions
  optimisticMoveCard: (cardId: string, updates: Partial<Card>) => void;
  confirmMove: (moveId: string) => void;
  revertMove: (moveId: string) => void;

  // Queue management
  queueMove: (move: Omit<PendingMove, 'id' | 'timestamp'>) => string;
  processQueue: () => PendingMove | null;
  clearQueue: () => void;
  removeFromQueue: (moveId: string) => void;
}

/**
 * Combined board store type
 */
type BoardStore = BoardState & BoardActions;

/**
 * Generate unique ID for pending moves
 */
function generateMoveId(): string {
  return `move_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Initial state for board store
 */
const initialState: BoardState = {
  draggedCardId: null,
  dropTargetListId: null,
  optimisticCards: new Map(),
  pendingMoves: [],
};

/**
 * Board store with Zustand + Immer middleware
 * 
 * Manages Kanban board state with optimistic updates for drag-and-drop.
 * This enables instant UI feedback while the server request is pending.
 * 
 * Note: This store is NOT persisted. All state is session-only.
 */
export const useBoardStore = create<BoardStore>()(
  immer((set, get) => ({
    ...initialState,

    setDraggedCard: (cardId) =>
      set((state) => {
        state.draggedCardId = cardId;
      }),

    setDropTarget: (listId) =>
      set((state) => {
        state.dropTargetListId = listId;
      }),

    optimisticMoveCard: (cardId, updates) =>
      set((state) => {
        const existing = state.optimisticCards.get(cardId) || {};
        state.optimisticCards.set(cardId, { ...existing, ...updates });
      }),

    confirmMove: (moveId) =>
      set((state) => {
        // Remove from pending moves
        const move = state.pendingMoves.find((m) => m.id === moveId);
        if (move) {
          state.pendingMoves = state.pendingMoves.filter((m) => m.id !== moveId);
          // Clear optimistic update for this card
          state.optimisticCards.delete(move.cardId);
        }
      }),

    revertMove: (moveId) =>
      set((state) => {
        const move = state.pendingMoves.find((m) => m.id === moveId);
        if (move) {
          // Remove from pending moves
          state.pendingMoves = state.pendingMoves.filter((m) => m.id !== moveId);
          // Clear optimistic update to revert to server state
          state.optimisticCards.delete(move.cardId);
        }
      }),

    queueMove: (move) => {
      const newMove: PendingMove = {
        ...move,
        id: generateMoveId(),
        timestamp: Date.now(),
      };
      set((state) => {
        state.pendingMoves.push(newMove);
      });
      return newMove.id;
    },

    processQueue: () => {
      const { pendingMoves } = get();
      // Return the oldest pending move
      return pendingMoves.length > 0 ? pendingMoves[0] : null;
    },

    clearQueue: () =>
      set((state) => {
        state.pendingMoves = [];
        state.optimisticCards.clear();
      }),

    removeFromQueue: (moveId) =>
      set((state) => {
        state.pendingMoves = state.pendingMoves.filter((m) => m.id !== moveId);
      }),
  }))
);
