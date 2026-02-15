import * as React from 'react';
import {
  Calendar,
  Flag,
  Layout,
  Tag,
  Clock,
  Users,
  MoreHorizontal,
  X,
  Check,
  ChevronDown,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AvatarComponent } from '@/components/ui/Avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/DropdownMenu';
import { TooltipComponent } from '@/components/ui/Tooltip';
import type { Card, CardStatus, Priority, CardLabel } from '@/types/card';
import type { PublicUser } from '@/types/user';

// Mock users data - replace with actual users from your system
const MOCK_USERS: PublicUser[] = [
  { id: '1', name: 'John Doe', avatarUrl: null },
  { id: '2', name: 'Jane Smith', avatarUrl: null },
  { id: '3', name: 'Bob Wilson', avatarUrl: null },
  { id: '4', name: 'Alice Brown', avatarUrl: null },
];

// Mock labels - replace with actual labels from your system
const MOCK_LABELS: CardLabel[] = [
  { id: '1', name: 'Bug', color: '#ef4444' },
  { id: '2', name: 'Feature', color: '#22c55e' },
  { id: '3', name: 'Enhancement', color: '#3b82f6' },
  { id: '4', name: 'Documentation', color: '#f59e0b' },
  { id: '5', name: 'Design', color: '#a855f7' },
];

const STATUS_OPTIONS: { value: CardStatus; label: string; color: string }[] = [
  { value: 'backlog', label: 'Backlog', color: '#64748b' },
  { value: 'todo', label: 'To Do', color: '#3b82f6' },
  { value: 'in_progress', label: 'In Progress', color: '#f59e0b' },
  { value: 'review', label: 'Review', color: '#a855f7' },
  { value: 'done', label: 'Done', color: '#22c55e' },
  { value: 'cancelled', label: 'Cancelled', color: '#ef4444' },
];

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string }[] = [
  { value: 'lowest', label: 'Lowest', color: '#64748b' },
  { value: 'low', label: 'Low', color: '#22c55e' },
  { value: 'medium', label: 'Medium', color: '#3b82f6' },
  { value: 'high', label: 'High', color: '#f59e0b' },
  { value: 'highest', label: 'Highest', color: '#ef4444' },
  { value: 'urgent', label: 'Urgent', color: '#dc2626' },
];

interface CardPropertiesProps {
  card: Card;
  boardColumns?: { id: string; name: string }[];
  onUpdateAssignees: (userIds: string[]) => void;
  onUpdateDueDate: (dueDate: string | null) => void;
  onUpdatePriority: (priority: Priority) => void;
  onUpdateStatus: (status: CardStatus) => void;
  onUpdateLabels: (labels: CardLabel[]) => void;
  onUpdateEstimate: (estimate: number | null) => void;
  isUpdating: boolean;
}

export function CardProperties({
  card,
  boardColumns = [],
  onUpdateAssignees,
  onUpdateDueDate,
  onUpdatePriority,
  onUpdateStatus,
  onUpdateLabels,
  onUpdateEstimate,
  isUpdating,
}: CardPropertiesProps) {
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [showEstimateInput, setShowEstimateInput] = React.useState(false);
  const [estimateValue, setEstimateValue] = React.useState(card.estimate?.toString() || '');
  
  const currentStatus = STATUS_OPTIONS.find((s) => s.value === card.status);
  const currentPriority = PRIORITY_OPTIONS.find((p) => p.value === card.priority);
  
  const handleAssigneeToggle = (userId: string) => {
    const isAssigned = card.assigneeIds.includes(userId);
    if (isAssigned) {
      onUpdateAssignees(card.assigneeIds.filter((id) => id !== userId));
    } else {
      onUpdateAssignees([...card.assigneeIds, userId]);
    }
  };
  
  const handleLabelToggle = (label: CardLabel) => {
    const hasLabel = card.labels.some((l) => l.id === label.id);
    if (hasLabel) {
      onUpdateLabels(card.labels.filter((l) => l.id !== label.id));
    } else {
      onUpdateLabels([...card.labels, label]);
    }
  };
  
  const handleEstimateSave = () => {
    const value = estimateValue.trim() ? parseFloat(estimateValue) : null;
    onUpdateEstimate(value);
    setShowEstimateInput(false);
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  return (
    <div className="space-y-4">
      {/* Property Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Assignees */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Assignees
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start h-auto py-1.5 px-2 -ml-2 hover:bg-slate-800"
                disabled={isUpdating}
              >
                {card.assignees.length > 0 ? (
                  <div className="flex items-center gap-1 flex-wrap">
                    {card.assignees.map((assignee) => (
                      <TooltipComponent key={assignee.id} content={assignee.name}>
                        <div className="shrink-0">
                          <AvatarComponent
                            src={assignee.avatarUrl || undefined}
                            alt={assignee.name}
                            fallback={getInitials(assignee.name)}
                            size="sm"
                          />
                        </div>
                      </TooltipComponent>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-500 text-sm">None</span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {MOCK_USERS.map((user) => (
                <DropdownMenuCheckboxItem
                  key={user.id}
                  checked={card.assigneeIds.includes(user.id)}
                  onCheckedChange={() => handleAssigneeToggle(user.id)}
                >
                  <div className="flex items-center gap-2">
                    <AvatarComponent
                      src={user.avatarUrl || undefined}
                      alt={user.name}
                      fallback={getInitials(user.name)}
                      size="sm"
                    />
                    <span className="text-sm">{user.name}</span>
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Due Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Due Date
          </label>
          <div className="relative">
            {showDatePicker ? (
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={card.dueDate ? format(parseISO(card.dueDate), 'yyyy-MM-dd') : ''}
                  onChange={(e) => {
                    onUpdateDueDate(e.target.value || null);
                    setShowDatePicker(false);
                  }}
                  className="h-8 text-sm"
                  autoFocus
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => setShowDatePicker(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                className="w-full justify-start h-8 px-2 -ml-2 hover:bg-slate-800 text-sm"
                onClick={() => setShowDatePicker(true)}
                disabled={isUpdating}
              >
                {card.dueDate ? (
                  <span className={cn(
                    new Date(card.dueDate) < new Date() && 'text-red-400'
                  )}>
                    {format(parseISO(card.dueDate), 'MMM d, yyyy')}
                  </span>
                ) : (
                  <span className="text-slate-500">None</span>
                )}
              </Button>
            )}
          </div>
        </div>
        
        {/* Priority */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <Flag className="h-3.5 w-3.5" />
            Priority
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start h-8 px-2 -ml-2 hover:bg-slate-800"
                disabled={isUpdating}
              >
                {currentPriority ? (
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: currentPriority.color }}
                    />
                    <span className="text-sm">{currentPriority.label}</span>
                  </div>
                ) : (
                  <span className="text-slate-500 text-sm">None</span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {PRIORITY_OPTIONS.map((priority) => (
                <DropdownMenuItem
                  key={priority.value}
                  onClick={() => onUpdatePriority(priority.value)}
                  className="flex items-center gap-2"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: priority.color }}
                  />
                  <span>{priority.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Status */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <Layout className="h-3.5 w-3.5" />
            Status
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start h-8 px-2 -ml-2 hover:bg-slate-800"
                disabled={isUpdating}
              >
                {currentStatus ? (
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: currentStatus.color }}
                    />
                    <span className="text-sm">{currentStatus.label}</span>
                  </div>
                ) : (
                  <span className="text-slate-500 text-sm">None</span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {STATUS_OPTIONS.map((status) => (
                <DropdownMenuItem
                  key={status.value}
                  onClick={() => onUpdateStatus(status.value)}
                  className="flex items-center gap-2"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: status.color }}
                  />
                  <span>{status.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Labels */}
        <div className="space-y-1.5 col-span-2">
          <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5" />
            Labels
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start h-auto py-1.5 px-2 -ml-2 hover:bg-slate-800"
                disabled={isUpdating}
              >
                {card.labels.length > 0 ? (
                  <div className="flex items-center gap-1 flex-wrap">
                    {card.labels.map((label) => (
                      <span
                        key={label.id}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                        style={{
                          backgroundColor: `${label.color}20`,
                          color: label.color,
                        }}
                      >
                        {label.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-500 text-sm">None</span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {MOCK_LABELS.map((label) => (
                <DropdownMenuCheckboxItem
                  key={label.id}
                  checked={card.labels.some((l) => l.id === label.id)}
                  onCheckedChange={() => handleLabelToggle(label)}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: label.color }}
                    />
                    <span className="text-sm">{label.name}</span>
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Estimate */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Estimate
          </label>
          {showEstimateInput ? (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                step="0.5"
                value={estimateValue}
                onChange={(e) => setEstimateValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEstimateSave();
                  if (e.key === 'Escape') setShowEstimateInput(false);
                }}
                placeholder="Hours"
                className="h-8 text-sm"
                autoFocus
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={handleEstimateSave}
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start h-8 px-2 -ml-2 hover:bg-slate-800 text-sm"
              onClick={() => setShowEstimateInput(true)}
              disabled={isUpdating}
            >
              {card.estimate ? (
                <span>{card.estimate}h</span>
              ) : (
                <span className="text-slate-500">None</span>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
