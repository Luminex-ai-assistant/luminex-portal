import { Settings, Users, FolderKanban, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Workspace } from '@/types/workspace';

interface WorkspaceHeaderProps {
  workspace: Workspace;
  onSettingsClick?: () => void;
}

export function WorkspaceHeader({ workspace, onSettingsClick }: WorkspaceHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-400">
        <span>Workspaces</span>
        <ChevronRight className="h-4 w-4" />
        <span className="text-slate-200 font-medium">{workspace.name}</span>
      </nav>

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {workspace.name}
          </h1>
          {workspace.description && (
            <p className="text-slate-400 max-w-2xl">{workspace.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onSettingsClick}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2">
        <div className="flex items-center gap-2 text-slate-400">
          <FolderKanban className="h-4 w-4" />
          <span className="text-sm">
            <span className="font-medium text-slate-200">{workspace.projectCount}</span>
            {' '}Projects
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Users className="h-4 w-4" />
          <span className="text-sm">
            <span className="font-medium text-slate-200">{workspace.memberCount}</span>
            {' '}Members
          </span>
        </div>
        <div className="text-sm text-slate-500">
          Created {new Date(workspace.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
