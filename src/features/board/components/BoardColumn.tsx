import * as React from 'react';
import { useSortable, useDroppable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { BoardColumn as BoardColumnType } from '@/types/board';
import type { CardBoardView } from '@/types/card';
import { CardPreview } from './CardPreview';

/**
 * BoardColumn component - Droppable column
 * Column header: name, card count, actions menu
 * Sortable cards list
 * Add card button
 * WIP limit indicator (optional)
 */

interface BoardColumnProps {
  column: BoardColumnType;
  cards: CardBoardView[];
  onAddCard?: (columnId: string) => void;
  onCardClick?: (card: CardBoardView) => void;
  onColumnMenu?: (columnId: string) => void;
  isDropTarget?: boolean;
  className?: string;
}

/**
 * Individual board column with drag and drop support
 */
export function BoardColumn({
  column,
  cards,
  onAddCard,
  onCardClick,
  onColumnMenu,
  isDropTarget = false,
  className,
}: BoardColumnProps) {
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  });

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Combine refs
  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      setDroppableRef(node);
      setSortableRef(node);
    },
    [setDroppableRef, setSortableRef]
  );

  const handleAddCard = () => {
    onAddCard?.(column.id);
  };

  const handleMenuClick = () => {
    onColumnMenu?.(column.id);
  };

  // Check WIP limit
  const hasWipLimit = column.limit !== null && column.limit > 0;
  const isOverLimit = hasWipLimit && cards.length > (column.limit || 0);
  const isNearLimit = hasWipLimit && cards.length === column.limit;

  return (
    <div
      ref={setRefs}
      style={style}
      className={cn(
        'flex h-full w-80 min-w-80 flex-col rounded-xl border bg-slate-900/50',
        'transition-all duration-150',
        isOver || isDropTarget
          ? 'border-indigo-500/50 bg-indigo-500/5'
          : 'border-slate-800',
        isDragging && 'opacity-50 ring-2 ring-indigo-500/50',
        className
      )}
    >
      {/* Column Header */}
      <div
        {...attributes}
        {...listeners}
        className="flex cursor-grab items-center justify-between border-b border-slate-800 p-3 active:cursor-grabbing"
      >
        <div className="flex items-center gap-2">
          {/* Column color indicator */}
          {column.color && (
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: column.color }}
            />
          )}
          
          {/* Column name */}
          <h3 className="font-semibold text-slate-200">{column.name}</h3>
          
          {/* Card count */}
          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-400">
            {cards.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* WIP Limit indicator */}
          {hasWipLimit && (
            <span
              className={cn(
                'rounded px-1.5 py-0.5 text-xs font-medium',
                isOverLimit
                  ? 'bg-red-500/20 text-red-400'
                  : isNearLimit
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-slate-800 text-slate-400'
              )}
              title={`WIP Limit: ${column.limit}`}
            >
              {cards.length}/{column.limit}
            </span>
          )}

          {/* Column menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-slate-200"
            onClick={handleMenuClick}
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
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </Button>
        </div>
      </div>

      {/* Cards list */}
      <div className="flex-1 overflow-y-auto p-2">
        <SortableContext
          items={cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2">
            {cards.map((card) => (
              <CardPreview
                key={card.id}
                card={card}
                onClick={onCardClick}
              />
            ))}
          </div>
        </SortableContext>

        {/* Empty state */}
        {cards.length === 0 && (
          <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-slate-800">
            <p className="text-sm text-slate-500">Drop cards here</p>
          </div>
        )}
      </div>

      {/* Add card button */}
      <div className="border-t border-slate-800 p-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-slate-400 hover:text-slate-200"
          onClick={handleAddCard}
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
          Add a card
        </Button>
      </div>
    </div>
  );
}
