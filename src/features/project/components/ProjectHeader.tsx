import { useNavigate } from 'react-router-dom';
import { Settings, ChevronRight, FolderKanban, Users, Layers } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Project } from '@/types/project';

interface ProjectHeaderProps {
  project: Project;
  onSettingsClick?: () => void;
}

export function ProjectHeader({ project, onSettingsClick }: ProjectHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-400">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="hover:text-slate-200 transition-colors"
        >
          Workspaces
        </button>
        <ChevronRight className="h-4 w-4" />
        <button 
          onClick={() => navigate(`/w/${project.workspaceId}`)}
          className="hover:text-slate-200 transition-colors"
        >
          {project.workspaceId === 'ws-1' ? 'Acme Corporation' : 'Personal Projects'}
        </button>
        <ChevronRight className="h-4 w-4" />
        <span className="text-slate-200 font-medium">{project.name}</span>
      </nav>

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div 
            className="h-14 w-14 rounded-xl flex-shrink-0 flex items-center justify-center"
            style={{ backgroundColor: project.color }}
          >
            <FolderKanban className="h-7 w-7 text-white" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-slate-400 max-w-2xl">{project.description}</p>
            )}
          </div>
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
          <Layers className="h-4 w-4" />
          <span className="text-sm">
            <span className="font-medium text-slate-200">{project.boardCount}</span>
            {' '}Boards
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Users className="h-4 w-4" />
          <span className="text-sm">
            <span className="font-medium text-slate-200">{project.memberCount}</span>
            {' '}Members
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <FolderKanban className="h-4 w-4" />
          <span className="text-sm">
            <span className="font-medium text-slate-200">{project.cardCount}</span>
            {' '}Cards
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-4 pt-2">
        <div className="flex-1 max-w-md">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-slate-400">Overall Progress</span>
            <span className="text-slate-200 font-medium">{project.progress}%</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all"
              style={{ 
                width: `${project.progress}%`,
                backgroundColor: project.color 
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
