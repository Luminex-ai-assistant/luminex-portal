import * as React from 'react';
import { CheckCircle2, Circle, Plus, Trash2, ListTodo } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import type { Subtask } from '@/types/card';

interface CardSubtasksProps {
  subtasks: Subtask[];
  onCreate: (title: string) => void;
  onToggle: (subtaskId: string, isCompleted: boolean) => void;
  onDelete: (subtaskId: string) => void;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export function CardSubtasks({
  subtasks,
  onCreate,
  onToggle,
  onDelete,
  isCreating,
  isUpdating,
  isDeleting,
}: CardSubtasksProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = React.useState('');
  const [isAdding, setIsAdding] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  const completedCount = subtasks.filter((s) => s.isCompleted).length;
  const progress = subtasks.length > 0 ? (completedCount / subtasks.length) * 100 : 0;
  
  React.useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);
  
  const handleCreate = () => {
    const trimmed = newSubtaskTitle.trim();
    if (trimmed) {
      onCreate(trimmed);
      setNewSubtaskTitle('');
      setIsAdding(false);
    }
  };
  
  const handleCancel = () => {
    setNewSubtaskTitle('');
    setIsAdding(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreate();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };
  
  // Sort subtasks: incomplete first, then by position
  const sortedSubtasks = [...subtasks].sort((a, b) => {
    if (a.isCompleted === b.isCompleted) {
      return a.position - b.position;
    }
    return a.isCompleted ? 1 : -1;
  });
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-300">
          <ListTodo className="h-4 w-4" />
          <span className="text-sm font-medium">Subtasks</span>
          <span className="text-xs text-slate-500">
            ({completedCount}/{subtasks.length})
          </span>
        </div>
        {!isAdding && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAdding(true)}
            disabled={isCreating}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add
          </Button>
        )}
      </div>
      
      {/* Progress Bar */}
      {subtasks.length > 0 && (
        <div className="space-y-1.5">
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                progress === 100 ? "bg-emerald-500" : "bg-indigo-500"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-500">
            {progress === 100
              ? 'All tasks completed!'
              : `${Math.round(progress)}% complete`}
          </p>
        </div>
      )}
      
      {/* Add Subtask Input */}
      {isAdding && (
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Input
              ref={inputRef}
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What needs to be done?"
              className="h-9"
              disabled={isCreating}
            />
          </div>
          <Button
            size="sm"
            onClick={handleCreate}
            disabled={!newSubtaskTitle.trim() || isCreating}
          >
            Add
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            disabled={isCreating}
          >
            Cancel
          </Button>
        </div>
      )}
      
      {/* Subtasks List */}
      <div className="space-y-1">
        {sortedSubtasks.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-sm border border-dashed border-slate-800 rounded-lg">
            No subtasks yet. Add one to get started.
          </div>
        ) : (
          sortedSubtasks.map((subtask) => (
            <SubtaskItem
              key={subtask.id}
              subtask={subtask}
              onToggle={onToggle}
              onDelete={onDelete}
              isUpdating={isUpdating}
              isDeleting={isDeleting}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface SubtaskItemProps {
  subtask: Subtask;
  onToggle: (subtaskId: string, isCompleted: boolean) => void;
  onDelete: (subtaskId: string) => void;
  isUpdating: boolean;
  isDeleting: boolean;
}

function SubtaskItem({
  subtask,
  onToggle,
  onDelete,
  isUpdating,
  isDeleting,
}: SubtaskItemProps) {
  const [showDelete, setShowDelete] = React.useState(false);
  
  return (
    <div
      className={cn(
        "group flex items-center gap-3 p-2 rounded-lg transition-colors",
        "hover:bg-slate-800/50",
        subtask.isCompleted && "opacity-60"
      )}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      <button
        onClick={() => onToggle(subtask.id, !subtask.isCompleted)}
        disabled={isUpdating}
        className={cn(
          "shrink-0 transition-colors",
          subtask.isCompleted
            ? "text-emerald-500 hover:text-emerald-400"
            : "text-slate-500 hover:text-slate-400"
        )}
      >
        {subtask.isCompleted ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : (
          <Circle className="h-5 w-5" />
        )}
      </button>
      
      <span
        className={cn(
          "flex-1 text-sm transition-all",
          subtask.isCompleted
            ? "text-slate-500 line-through"
            : "text-slate-300"
        )}
      >
        {subtask.title}
      </span>
      
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-7 w-7 opacity-0 transition-opacity",
          showDelete && "opacity-100"
        )}
        onClick={() => onDelete(subtask.id)}
        disabled={isDeleting}
        title="Delete subtask"
      >
        <Trash2 className="h-3.5 w-3.5 text-slate-500 hover:text-red-400" />
      </Button>
    </div>
  );
}

// Checkbox component (if not already in UI components)
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-slate-600 bg-slate-900 ring-offset-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-indigo-600 data-[state=checked]:text-slate-50 data-[state=checked]:border-indigo-600",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <CheckCircle2 className="h-3.5 w-3.5" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
