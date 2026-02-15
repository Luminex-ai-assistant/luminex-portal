import * as React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import type { CardBoardView } from '@/types/card';

/**
 * CardPreview component - Sortable card item
 * Title, labels (colored badges)
 * Assignee avatars
 * Due date indicator
 * Comment/subtask count icons
 * Priority indicator
 * Click to open card detail
 */

interface CardPreviewProps {
  card: CardBoardView;
  onClick?: (card: CardBoardView) => void;
  className?: string;
}

/**
 * Individual card preview component with drag support
 */
export function CardPreview({ card, onClick, className }: CardPreviewProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: 'Card',
      card,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColors: Record<string, string> = {
    lowest: 'bg-slate-500',
    low: 'bg-blue-500',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    highest: 'bg-red-500',
    urgent: 'bg-red-600',
  };

  const isOverdue = card.dueDate ? new Date(card.dueDate) < new Date() : false;
  const isCompleted = card.status === 'done';

  const handleClick = () => {
    if (onClick && !isDragging) {
      onClick(card);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className={cn(
        'group relative cursor-grab rounded-lg border border-slate-800 bg-slate-900 p-3',
        'hover:border-slate-700 hover:bg-slate-800/50',
        'transition-all duration-150',
        'active:cursor-grabbing',
        isDragging && 'opacity-50 ring-2 ring-indigo-500/50',
        className
      )}
    >
      {/* Cover image */}
      {card.coverImageUrl && (
        <div className="mb-2 -mx-3 -mt-3 overflow-hidden rounded-t-lg">
          <img
            src={card.coverImageUrl}
            alt=""
            className="h-24 w-full object-cover"
          />
        </div>
      )}

      {/* Labels */}
      {card.labels.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {card.labels.map((label) => (
            <span
              key={label.id}
              className="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-medium text-white"
              style={{ backgroundColor: label.color }}
              title={label.name}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Card identifier */}
      <div className="mb-1 flex items-center gap-2">
        <span className="text-[10px] font-medium text-slate-500">
          {card.identifier}
        </span>
        {/* Priority indicator */}
        <div
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            priorityColors[card.priority] || priorityColors.medium
          )}
          title={`Priority: ${card.priority}`}
        />
      </div>

      {/* Title */}
      <h4
        className={cn(
          'mb-2 text-sm font-medium leading-snug text-slate-200',
          isCompleted && 'text-slate-500 line-through'
        )}
      >
        {card.title}
      </h4>

      {/* Footer with metadata */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Due date */}
          {card.dueDate && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs',
                isOverdue && !isCompleted
                  ? 'text-red-400'
                  : isCompleted
                  ? 'text-emerald-400'
                  : 'text-slate-400'
              )}
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>
                {new Date(card.dueDate).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}

          {/* Subtasks */}
          {card.subtaskCount > 0 && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs',
                card.completedSubtaskCount === card.subtaskCount
                  ? 'text-emerald-400'
                  : 'text-slate-400'
              )}
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              <span>
                {card.completedSubtaskCount}/{card.subtaskCount}
              </span>
            </div>
          )}

          {/* Comments */}
          {card.commentCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
              <span>{card.commentCount}</span>
            </div>
          )}

          {/* Attachments */}
          {card.attachmentCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
              <span>{card.attachmentCount}</span>
            </div>
          )}
        </div>

        {/* Assignees */}
        {card.assignees.length > 0 && (
          <div className="flex -space-x-1.5">
            {card.assignees.slice(0, 3).map((assignee, index) => (
              <div
                key={assignee.id}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-medium text-white ring-2 ring-slate-900 transition-transform hover:scale-110 hover:z-10"
                title={assignee.name}
                style={{ zIndex: card.assignees.length - index }}
              >
                {assignee.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
            ))}
            {card.assignees.length > 3 && (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-600 text-[10px] font-medium text-white ring-2 ring-slate-900">
                +{card.assignees.length - 3}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
