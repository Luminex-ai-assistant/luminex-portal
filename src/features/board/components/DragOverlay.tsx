import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * DragOverlay component - Visual while dragging
 * Shows card preview being dragged
 */

interface DragOverlayProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Simple overlay wrapper for drag preview
 */
export function DragOverlay({ children, className }: DragOverlayProps) {
  return (
    <div
      className={cn(
        'pointer-events-none opacity-90 scale-105 rotate-2',
        'shadow-2xl shadow-black/50',
        className
      )}
      style={{
        transform: 'scale(1.05) rotate(2deg)',
        cursor: 'grabbing',
      }}
    >
      {children}
    </div>
  );
}

/**
 * DragOverlayCard - A specific card overlay for dragging
 */
export interface DragOverlayCardProps {
  title: string;
  identifier?: string;
  labels?: { id: string; name: string; color: string }[];
  assignees?: { id: string; name: string; avatarUrl: string | null }[];
  priority?: string;
  dueDate?: string | null;
  commentCount?: number;
  subtaskCount?: number;
  completedSubtaskCount?: number;
  className?: string;
}

/**
 * Card preview shown while dragging
 */
export function DragOverlayCard({
  title,
  identifier,
  labels = [],
  assignees = [],
  priority = 'medium',
  dueDate,
  commentCount = 0,
  subtaskCount = 0,
  completedSubtaskCount = 0,
  className,
}: DragOverlayCardProps) {
  const priorityColors: Record<string, string> = {
    lowest: 'bg-slate-500',
    low: 'bg-blue-500',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    highest: 'bg-red-500',
    urgent: 'bg-red-600',
  };

  const isOverdue = dueDate ? new Date(dueDate) < new Date() : false;

  return (
    <div
      className={cn(
        'w-72 rounded-lg border border-slate-700 bg-slate-800 p-3',
        'shadow-xl shadow-black/40',
        className
      )}
    >
      {/* Header with labels and priority */}
      {(labels.length > 0 || priority) && (
        <div className="mb-2 flex items-center gap-1.5">
          {priority && (
            <div
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                priorityColors[priority] || priorityColors.medium
              )}
              title={`Priority: ${priority}`}
            />
          )}
          <div className="flex flex-wrap gap-1">
            {labels.slice(0, 3).map((label) => (
              <span
                key={label.id}
                className="inline-block h-1.5 w-8 rounded-full"
                style={{ backgroundColor: label.color }}
                title={label.name}
              />
            ))}
          </div>
        </div>
      )}

      {/* Card identifier */}
      {identifier && (
        <div className="mb-1 text-xs font-medium text-slate-500">
          {identifier}
        </div>
      )}

      {/* Title */}
      <div className="mb-3 text-sm font-medium text-slate-200 line-clamp-2">
        {title}
      </div>

      {/* Footer with metadata */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Due date */}
          {dueDate && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs',
                isOverdue ? 'text-red-400' : 'text-slate-400'
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
              <span>{new Date(dueDate).toLocaleDateString()}</span>
            </div>
          )}

          {/* Subtasks */}
          {subtaskCount > 0 && (
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              <span>
                {completedSubtaskCount}/{subtaskCount}
              </span>
            </div>
          )}

          {/* Comments */}
          {commentCount > 0 && (
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
              <span>{commentCount}</span>
            </div>
          )}
        </div>

        {/* Assignees */}
        {assignees.length > 0 && (
          <div className="flex -space-x-1.5">
            {assignees.slice(0, 3).map((assignee, index) => (
              <div
                key={assignee.id}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-700 text-[10px] font-medium text-slate-300 ring-2 ring-slate-800"
                title={assignee.name}
                style={{ zIndex: assignees.length - index }}
              >
                {assignee.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
            ))}
            {assignees.length > 3 && (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-600 text-[10px] font-medium text-slate-300 ring-2 ring-slate-800">
                +{assignees.length - 3}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
