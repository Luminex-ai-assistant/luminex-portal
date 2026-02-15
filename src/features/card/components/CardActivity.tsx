import * as React from 'react';
import { History, User, Move, Edit3, Plus, Trash2, CheckCircle2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { AvatarComponent } from '@/components/ui/Avatar';
import type { ActivityLogEntry, ActivityAction } from '@/types/activity';

interface CardActivityProps {
  activity: ActivityLogEntry[];
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  'card:created': <Plus className="h-3.5 w-3.5" />,
  'card:updated': <Edit3 className="h-3.5 w-3.5" />,
  'card:moved': <Move className="h-3.5 w-3.5" />,
  'card:deleted': <Trash2 className="h-3.5 w-3.5" />,
  'card:assigned': <User className="h-3.5 w-3.5" />,
  'card:unassigned': <User className="h-3.5 w-3.5" />,
  'card:label_added': <Plus className="h-3.5 w-3.5" />,
  'card:label_removed': <Trash2 className="h-3.5 w-3.5" />,
  'card:due_date_changed': <Clock className="h-3.5 w-3.5" />,
  'card:priority_changed': <Edit3 className="h-3.5 w-3.5" />,
  'card:status_changed': <CheckCircle2 className="h-3.5 w-3.5" />,
  'subtask:created': <Plus className="h-3.5 w-3.5" />,
  'subtask:completed': <CheckCircle2 className="h-3.5 w-3.5" />,
  'subtask:uncompleted': <Edit3 className="h-3.5 w-3.5" />,
  'comment:created': <Plus className="h-3.5 w-3.5" />,
  'comment:updated': <Edit3 className="h-3.5 w-3.5" />,
  'comment:deleted': <Trash2 className="h-3.5 w-3.5" />,
  'attachment:uploaded': <Plus className="h-3.5 w-3.5" />,
  'attachment:deleted': <Trash2 className="h-3.5 w-3.5" />,
};

const ACTION_COLORS: Record<string, string> = {
  'card:created': 'bg-emerald-500/20 text-emerald-400',
  'card:updated': 'bg-blue-500/20 text-blue-400',
  'card:moved': 'bg-amber-500/20 text-amber-400',
  'card:deleted': 'bg-red-500/20 text-red-400',
  'card:assigned': 'bg-indigo-500/20 text-indigo-400',
  'card:unassigned': 'bg-slate-500/20 text-slate-400',
  'card:label_added': 'bg-purple-500/20 text-purple-400',
  'card:label_removed': 'bg-slate-500/20 text-slate-400',
  'card:due_date_changed': 'bg-cyan-500/20 text-cyan-400',
  'card:priority_changed': 'bg-orange-500/20 text-orange-400',
  'card:status_changed': 'bg-green-500/20 text-green-400',
  'subtask:created': 'bg-emerald-500/20 text-emerald-400',
  'subtask:completed': 'bg-green-500/20 text-green-400',
  'subtask:uncompleted': 'bg-slate-500/20 text-slate-400',
  'comment:created': 'bg-blue-500/20 text-blue-400',
  'comment:updated': 'bg-amber-500/20 text-amber-400',
  'comment:deleted': 'bg-red-500/20 text-red-400',
  'attachment:uploaded': 'bg-emerald-500/20 text-emerald-400',
  'attachment:deleted': 'bg-slate-500/20 text-slate-400',
};

function getActionIcon(action: ActivityAction): React.ReactNode {
  return ACTION_ICONS[action] || <Edit3 className="h-3.5 w-3.5" />;
}

function getActionColor(action: ActivityAction): string {
  return ACTION_COLORS[action] || 'bg-slate-500/20 text-slate-400';
}

function formatActionDescription(entry: ActivityLogEntry): string {
  const { action, entityName, changes, metadata } = entry;
  
  switch (action) {
    case 'card:created':
      return `created this card`;
    case 'card:updated':
      if (changes.length > 0) {
        const fieldNames = changes.map((c) => c.displayName).join(', ');
        return `updated ${fieldNames}`;
      }
      return `updated this card`;
    case 'card:moved':
      const fromColumn = metadata?.fromColumn as string | undefined;
      const toColumn = metadata?.toColumn as string | undefined;
      if (fromColumn && toColumn) {
        return `moved from "${fromColumn}" to "${toColumn}"`;
      }
      return `moved this card`;
    case 'card:assigned':
      const assigneeName = metadata?.assigneeName as string | undefined;
      return assigneeName ? `assigned ${assigneeName}` : `assigned a user`;
    case 'card:unassigned':
      const unassigneeName = metadata?.assigneeName as string | undefined;
      return unassigneeName ? `unassigned ${unassigneeName}` : `unassigned a user`;
    case 'card:label_added':
      const labelName = metadata?.labelName as string | undefined;
      return labelName ? `added label "${labelName}"` : `added a label`;
    case 'card:label_removed':
      const removedLabelName = metadata?.labelName as string | undefined;
      return removedLabelName ? `removed label "${removedLabelName}"` : `removed a label`;
    case 'card:due_date_changed':
      const dueDate = metadata?.dueDate as string | undefined;
      return dueDate ? `set due date to ${dueDate}` : `changed due date`;
    case 'card:priority_changed':
      const priority = metadata?.priority as string | undefined;
      return priority ? `changed priority to ${priority}` : `changed priority`;
    case 'card:status_changed':
      const status = metadata?.status as string | undefined;
      return status ? `changed status to ${status}` : `changed status`;
    case 'subtask:created':
      const subtaskTitle = metadata?.subtaskTitle as string | undefined;
      return subtaskTitle ? `added subtask "${subtaskTitle}"` : `added a subtask`;
    case 'subtask:completed':
      const completedSubtask = metadata?.subtaskTitle as string | undefined;
      return completedSubtask ? `completed subtask "${completedSubtask}"` : `completed a subtask`;
    case 'subtask:uncompleted':
      const uncompletedSubtask = metadata?.subtaskTitle as string | undefined;
      return uncompletedSubtask ? `reopened subtask "${uncompletedSubtask}"` : `reopened a subtask`;
    case 'comment:created':
      return `added a comment`;
    case 'comment:updated':
      return `edited a comment`;
    case 'comment:deleted':
      return `deleted a comment`;
    case 'attachment:uploaded':
      const attachmentName = metadata?.attachmentName as string | undefined;
      return attachmentName ? `attached "${attachmentName}"` : `added an attachment`;
    case 'attachment:deleted':
      const deletedAttachment = metadata?.attachmentName as string | undefined;
      return deletedAttachment ? `removed attachment "${deletedAttachment}"` : `removed an attachment`;
    default:
      return entry.description || `performed action: ${action}`;
  }
}

export function CardActivity({ activity }: CardActivityProps) {
  // Group activity by date
  const grouped = React.useMemo(() => {
    const groups: Record<string, ActivityLogEntry[]> = {};
    
    activity.forEach((entry) => {
      const date = new Date(entry.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(entry);
    });
    
    return groups;
  }, [activity]);
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  if (activity.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-slate-300">
          <History className="h-4 w-4" />
          <span className="text-sm font-medium">Activity</span>
        </div>
        <div className="text-center py-6 text-slate-500 text-sm">
          No activity yet.
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-slate-300">
        <History className="h-4 w-4" />
        <span className="text-sm font-medium">Activity</span>
      </div>
      
      <div className="space-y-4">
        {Object.entries(grouped).map(([date, entries]) => (
          <div key={date}>
            <h4 className="text-xs font-medium text-slate-500 mb-2 sticky top-0 bg-slate-900/95 py-1">
              {date}
            </h4>
            <div className="space-y-3">
              {entries.map((entry) => (
                <div key={entry.id} className="flex gap-3">
                  {/* Icon */}
                  <div
                    className={cn(
                      'shrink-0 w-7 h-7 rounded-full flex items-center justify-center',
                      getActionColor(entry.action)
                    )}
                  >
                    {getActionIcon(entry.action)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <AvatarComponent
                        src={entry.actor.avatarUrl || undefined}
                        alt={entry.actor.name}
                        fallback={getInitials(entry.actor.name)}
                        size="sm"
                      />
                      <span className="text-sm text-slate-300">
                        <span className="font-medium text-slate-200">
                          {entry.actor.name}
                        </span>{' '}
                        {formatActionDescription(entry)}
                      </span>
                    </div>
                    
                    {/* Show changes if any */}
                    {entry.changes.length > 0 && (
                      <div className="mt-1.5 ml-9 space-y-1">
                        {entry.changes.map((change, idx) => (
                          <div
                            key={idx}
                            className="text-xs text-slate-500 flex items-center gap-2"
                          >
                            <span className="text-slate-400">{change.displayName}:</span>
                            <span className="line-through text-slate-600">
                              {String(change.oldValue || 'empty')}
                            </span>
                            <span className="text-slate-400">→</span>
                            <span className="text-slate-300">
                              {String(change.newValue || 'empty')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <span className="text-xs text-slate-600 ml-9">
                      {formatDistanceToNow(new Date(entry.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
