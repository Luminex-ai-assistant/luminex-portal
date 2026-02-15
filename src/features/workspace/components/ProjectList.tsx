import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderKanban, MoreHorizontal, Users, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
import type { Project, ProjectStatus } from '@/types/project';

interface ProjectListProps {
  projects: Project[];
  isLoading?: boolean;
  onCreateProject: () => void;
}

const statusConfig: Record<ProjectStatus, { label: string; variant: 'default' | 'secondary' | 'warning' | 'outline' }> = {
  active: { label: 'Active', variant: 'default' },
  archived: { label: 'Archived', variant: 'secondary' },
  paused: { label: 'Paused', variant: 'warning' },
};

export function ProjectList({ projects, isLoading, onCreateProject }: ProjectListProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-24 bg-slate-800/50" />
            <CardContent className="h-16" />
          </Card>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center mb-4">
          <FolderKanban className="h-6 w-6 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-200">No projects yet</h3>
        <p className="text-sm text-slate-400 mt-1 max-w-sm">
          Get started by creating your first project in this workspace.
        </p>
        <Button onClick={onCreateProject} className="mt-4">
          <Plus className="h-4 w-4 mr-2" />
          Create Project
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard 
          key={project.id} 
          project={project} 
          onClick={() => navigate(`/w/${project.workspaceId}/p/${project.id}`)}
        />
      ))}
      
      {/* Create New Card */}
      <Card 
        className="border-dashed border-slate-700 bg-transparent hover:bg-slate-800/30 cursor-pointer transition-colors"
        onClick={onCreateProject}
      >
        <CardContent className="flex flex-col items-center justify-center h-full min-h-[180px] py-6">
          <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center mb-3">
            <Plus className="h-5 w-5 text-slate-400" />
          </div>
          <span className="text-sm font-medium text-slate-300">Create New Project</span>
        </CardContent>
      </Card>
    </div>
  );
}

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

function ProjectCard({ project, onClick }: ProjectCardProps) {
  const status = statusConfig[project.status];

  return (
    <Card className="group cursor-pointer hover:border-slate-700 transition-colors" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div 
              className="h-10 w-10 rounded-lg flex-shrink-0"
              style={{ backgroundColor: project.color }}
            />
            <div className="min-w-0">
              <CardTitle className="text-base truncate group-hover:text-indigo-400 transition-colors">
                {project.name}
              </CardTitle>
              <CardDescription className="line-clamp-1">
                {project.description || 'No description'}
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); }}>
                Edit Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); }}>
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-400" 
                onClick={(e) => { e.stopPropagation(); }}
              >
                Archive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Progress</span>
            <span className="text-slate-300 font-medium">{project.progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all"
              style={{ 
                width: `${project.progress}%`,
                backgroundColor: project.color 
              }}
            />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <FolderKanban className="h-3.5 w-3.5" />
            {project.boardCount}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {project.memberCount}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
