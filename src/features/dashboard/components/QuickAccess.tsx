import { useNavigate } from 'react-router-dom';
import { 
  FolderKanban, 
  LayoutGrid, 
  Plus, 
  Star, 
  ArrowRight,
  Sparkles 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export interface QuickAccessItem {
  id: string;
  type: 'workspace' | 'project';
  name: string;
  description?: string;
  isPinned?: boolean;
  color?: string;
  memberCount?: number;
  taskCount?: number;
}

interface QuickAccessProps {
  items: QuickAccessItem[];
  isLoading?: boolean;
  className?: string;
}

export function QuickAccess({ items, isLoading, className }: QuickAccessProps) {
  const navigate = useNavigate();

  const handleItemClick = (item: QuickAccessItem) => {
    if (item.type === 'workspace') {
      navigate(`/workspaces/${item.id}`);
    } else {
      navigate(`/projects/${item.id}`);
    }
  };

  const workspaces = items.filter((item) => item.type === 'workspace');
  const projects = items.filter((item) => item.type === 'project');

  if (isLoading) {
    return (
      <Card className={cn('h-full', className)}>
        <CardHeader>
          <CardTitle>Quick Access</CardTitle>
          <CardDescription>Your pinned workspaces and projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-10 w-10 rounded-lg bg-slate-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 rounded bg-slate-800" />
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
          <CardTitle>Quick Access</CardTitle>
          <CardDescription>Your pinned workspaces and projects</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/workspaces/new')}>
            <LayoutGrid className="mr-2 h-4 w-4" />
            Workspace
          </Button>
          <Button size="sm" onClick={() => navigate('/projects/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Project
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Sparkles className="h-12 w-12 text-slate-600" />
            <p className="mt-4 text-sm text-slate-400">No pinned items yet</p>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              Star your favorite workspaces and projects for quick access
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Workspaces Section */}
            {workspaces.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Workspaces
                </h4>
                <div className="grid gap-2">
                  {workspaces.map((workspace) => (
                    <button
                      key={workspace.id}
                      onClick={() => handleItemClick(workspace)}
                      className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-slate-800/50 text-left group"
                    >
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{ backgroundColor: workspace.color || '#6366f1' }}
                      >
                        <LayoutGrid className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-200 truncate">
                            {workspace.name}
                          </p>
                          {workspace.isPinned && (
                            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                          )}
                        </div>
                        {workspace.description && (
                          <p className="text-xs text-slate-500 truncate">
                            {workspace.description}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Projects Section */}
            {projects.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Projects
                </h4>
                <div className="grid gap-2">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => handleItemClick(project)}
                      className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-slate-800/50 text-left group"
                    >
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{ backgroundColor: project.color || '#10b981' }}
                      >
                        <FolderKanban className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-200 truncate">{project.name}</p>
                          {project.isPinned && (
                            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          {project.taskCount !== undefined && (
                            <span>{project.taskCount} tasks</span>
                          )}
                          {project.memberCount !== undefined && (
                            <span>{project.memberCount} members</span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
