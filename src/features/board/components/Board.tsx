import * as React from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import type { BoardColumn as BoardColumnType } from '@/types/board';
import type { CardBoardView } from '@/types/card';
import { BoardColumn } from './BoardColumn';
import { DragOverlayCard } from './DragOverlay';
import { useDragAndDrop } from '../hooks/useDragAndDrop';

/**
 * Board component - DndContext from @dnd-kit/core
 * SortableContext for columns
 * Horizontal scroll container
 * Add list button
 */

interface BoardProps {
  boardId: string;
  columns: BoardColumnType[];
  cardsByColumn: Map<string, CardBoardView[]>;
  onCardsReorder?: (newCardsByColumn: Map<string, CardBoardView[]>) => void;
  onAddColumn?: () => void;
  onAddCard?: (columnId: string) => void;
  onCardClick?: (card: CardBoardView) => void;
  onColumnMenu?: (columnId: string) => void;
  className?: string;
}

/**
 * Main board component with drag and drop support
 */
export function Board({
  boardId,
  columns,
  cardsByColumn,
  onCardsReorder,
  onAddColumn,
  onAddCard,
  onCardClick,
  onColumnMenu,
  className,
}: BoardProps) {
  const [localCardsByColumn, setLocalCardsByColumn] = React.useState(cardsByColumn);

  // Update local state when props change
  React.useEffect(() => {
    setLocalCardsByColumn(cardsByColumn);
  }, [cardsByColumn]);

  const {
    activeCard,
    activeColumnId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useDragAndDrop({
    boardId,
    cardsByColumn: localCardsByColumn,
    onCardsReorder: (newCards) => {
      setLocalCardsByColumn(newCards);
      onCardsReorder?.(newCards);
    },
  });

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Minimum drag distance before activating
      },
    })
  );

  // Custom drop animation
  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div
        className={cn(
          'flex h-full gap-4 overflow-x-auto overflow-y-hidden pb-4',
          'scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700',
          className
        )}
      >
        <SortableContext
          items={columns.map((c) => c.id)}
          strategy={horizontalListSortingStrategy}
        >
          {columns.map((column) => (
            <BoardColumn
              key={column.id}
              column={column}
              cards={localCardsByColumn.get(column.id) || []}
              onAddCard={onAddCard}
              onCardClick={onCardClick}
              onColumnMenu={onColumnMenu}
              isDropTarget={activeColumnId === column.id && !activeCard}
            />
          ))}
        </SortableContext>

        {/* Add list button */}
        <div className="shrink-0">
          <Button
            variant="outline"
            className="h-12 w-80 justify-start gap-2 border-dashed border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300"
            onClick={onAddColumn}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add another list
          </Button>
        </div>
      </div>

      {/* Drag overlay - shows what's being dragged */}
      <DragOverlay dropAnimation={dropAnimation}>
        {activeCard ? (
          <DragOverlayCard
            title={activeCard.title}
            identifier={activeCard.identifier}
            labels={activeCard.labels}
            assignees={activeCard.assignees}
            priority={activeCard.priority}
            dueDate={activeCard.dueDate}
            commentCount={activeCard.commentCount}
            subtaskCount={activeCard.subtaskCount}
            completedSubtaskCount={activeCard.completedSubtaskCount}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
