import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { 
  Folder, 
  CheckCircle2, 
  MessageSquare, 
  UserPlus, 
  FileEdit,
  Clock,
  MoreHorizontal 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export interface Activity {
  id: string;
  user: {
    name: string;
    avatar?: string;
    initials: string;
  };
  action: 'created' | 'updated' | 'completed' | 'commented' | 'joined' | 'assigned';
  target: {
    type: 'project' | 'task' | 'workspace' | 'board' | 'comment';
    name: string;
    id: string;
  };
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

interface RecentActivityProps {
  activities: Activity[];
  isLoading?: boolean;
  className?: string;
}

const actionIcons: Record<Activity['action'], typeof Folder> = {
  created: Folder,
  updated: FileEdit,
  completed: CheckCircle2,
  commented: MessageSquare,
  joined: UserPlus,
  assigned: UserPlus,
};

const actionLabels: Record<Activity['action'], string> = {
  created: 'created',
  updated: 'updated',
  completed: 'completed',
  commented: 'commented on',
  joined: 'joined',
  assigned: 'assigned',
};

const targetTypeLabels: Record<Activity['target']['type'], string> = {
  project: 'project',
  task: 'task',
  workspace: 'workspace',
  board: 'board',
  comment: 'comment',
};

export function RecentActivity({ activities, isLoading, className }: RecentActivityProps) {
  const navigate = useNavigate();

  const handleActivityClick = (activity: Activity) => {
    const routes: Record<Activity['target']['type'], string> = {
      project: `/projects/${activity.target.id}`,
      task: `/tasks/${activity.target.id}`,
      workspace: `/workspaces/${activity.target.id}`,
      board: `/boards/${activity.target.id}`,
      comment: `/tasks/${activity.target.id}`,
    };
    navigate(routes[activity.target.type]);
  };

  if (isLoading) {
    return (
      <Card className={cn('h-full', className)}>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest actions across your workspaces</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-slate-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-slate-800" />
                  <div className="h-3 w-1/2 rounded bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest actions across your workspaces</CardDescription>
        </div>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Clock className="h-12 w-12 text-slate-600" />
              <p className="mt-4 text-sm text-slate-400">No recent activity</p>
              <p className="text-xs text-slate-500">
                Activities will appear here when you start working
              </p>
            </div>
          ) : (
            activities.map((activity) => {
              const ActionIcon = actionIcons[activity.action];
              return (
                <button
                  key={activity.id}
                  onClick={() => handleActivityClick(activity)}
                  className="flex w-full items-start gap-4 rounded-lg p-3 transition-colors hover:bg-slate-800/50 text-left"
                >
                  {/* User Avatar */}
                  <div className="relative flex-shrink-0">
                    {activity.user.avatar ? (
                      <img
                        src={activity.user.avatar}
                        alt={activity.user.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 font-medium text-sm">
                        {activity.user.initials}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 border border-slate-700">
                      <ActionIcon className="h-3 w-3 text-slate-400" />
                    </div>
                  </div>

                  {/* Activity Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200">
                      <span className="font-medium text-white">{activity.user.name}</span>{' '}
                      <span className="text-slate-400">{actionLabels[activity.action]}</span>{' '}
                      <span className="font-medium text-indigo-400">{activity.target.name}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {targetTypeLabels[activity.target.type]} •{' '}
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
