import React, { useState } from 'react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  LayoutGrid,
  ChevronRight,
  Plus,
  Loader2,
  List,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import type { Project } from '@/types/project';

interface ProjectNavProps {
  onNavigate?: () => void;
}

// Mock boards data - in a real app, this would come from a useBoards hook
const MOCK_BOARDS: Record<string, Array<{ id: string; name: string; type: string }>> = {
  'proj-1': [
    { id: 'board-1', name: 'Main Board', type: 'kanban' },
    { id: 'board-2', name: 'Sprint Planning', type: 'sprint' },
    { id: 'board-3', name: 'Bug Tracker', type: 'kanban' },
  ],
  'proj-2': [
    { id: 'board-4', name: 'Development', type: 'kanban' },
    { id: 'board-5', name: 'Backlog', type: 'backlog' },
  ],
  'proj-3': [
    { id: 'board-6', name: 'API Migration', type: 'kanban' },
  ],
  'proj-4': [
    { id: 'board-7', name: 'Portfolio Board', type: 'kanban' },
  ],
};

export function ProjectNav({ onNavigate }: ProjectNavProps) {
  const navigate = useNavigate();
  const { workspaceId, projectId, boardId } = useParams<{
    workspaceId?: string;
    projectId?: string;
    boardId?: string;
  }>();
  const { data: projects, isLoading } = useProjects(workspaceId);
  const [expandedProjects, setExpandedProjects] = useState<string[]>(
    projectId ? [projectId] : []
  );

  const toggleProject = (id: string) => {
    setExpandedProjects((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const getBoardIcon = (type: string) => {
    switch (type) {
      case 'sprint':
        return <Calendar className="w-3.5 h-3.5" />;
      case 'backlog':
        return <List className="w-3.5 h-3.5" />;
      case 'analytics':
        return <BarChart3 className="w-3.5 h-3.5" />;
      default:
        return <LayoutGrid className="w-3.5 h-3.5" />;
    }
  };

  // Filter projects for current workspace only
  const workspaceProjects = projects?.filter((p) => p.workspaceId === workspaceId) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (workspaceProjects.length === 0) {
    if (!workspaceId) {
      return (
        <div className="px-3 py-4">
          <p className="text-sm text-slate-500">Select a workspace to view projects</p>
        </div>
      );
    }

    return (
      <div className="px-3 py-4">
        <p className="text-sm text-slate-500 mb-3">No projects in this workspace</p>
        <button
          onClick={() => {
            navigate(`/w/${workspaceId}/projects/new`);
            onNavigate?.();
          }}
          className="flex items-center gap-2 px-3 py-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create your first project
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Section Header */}
      <div className="px-3 py-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            {workspaceId ? 'Projects' : 'All Projects'}
          </span>
          {workspaceId && (
            <button
              onClick={() => {
                navigate(`/w/${workspaceId}/projects/new`);
                onNavigate?.();
              }}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Create project"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Project List */}
      <ul className="space-y-0.5">
        {workspaceProjects.map((project) => (
          <ProjectNavItem
            key={project.id}
            project={project}
            isExpanded={expandedProjects.includes(project.id)}
            isActive={projectId === project.id}
            activeBoardId={boardId}
            workspaceId={workspaceId || project.workspaceId}
            onToggle={() => toggleProject(project.id)}
            onNavigate={onNavigate}
            getBoardIcon={getBoardIcon}
          />
        ))}
      </ul>

      {/* Create Project Button */}
      {workspaceId && (
        <div className="pt-2 mt-2 border-t border-slate-800">
          <button
            onClick={() => {
              navigate(`/w/${workspaceId}/projects/new`);
              onNavigate?.();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Project
          </button>
        </div>
      )}
    </div>
  );
}

interface ProjectNavItemProps {
  project: Project;
  isExpanded: boolean;
  isActive: boolean;
  activeBoardId?: string;
  workspaceId: string;
  onToggle: () => void;
  onNavigate?: () => void;
  getBoardIcon: (type: string) => React.ReactNode;
}

function ProjectNavItem({
  project,
  isExpanded,
  isActive,
  activeBoardId,
  workspaceId,
  onToggle,
  onNavigate,
  getBoardIcon,
}: ProjectNavItemProps) {
  const boards = MOCK_BOARDS[project.id] || [];

  return (
    <li>
      <div>
        {/* Project Header */}
        <div className="flex items-center">
          <button
            onClick={onToggle}
            className={`p-1.5 rounded hover:bg-slate-800 text-slate-500 transition-colors ${
              isExpanded ? 'rotate-90' : ''
            }`}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <NavLink
            to={`/w/${workspaceId}/p/${project.id}`}
            onClick={onNavigate}
            className={() =>
              `flex-1 flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors ${
                isActive && !activeBoardId
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`
            }
          >
            <div
              className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: project.color || '#6366f1' }}
            >
              <FolderKanban className="w-3 h-3 text-white" />
            </div>
            <span className="flex-1 truncate">{project.name}</span>
            {project.cardCount > 0 && (
              <span className="text-xs text-slate-600 px-1.5 py-0.5 bg-slate-800 rounded">
                {project.cardCount}
              </span>
            )}
          </NavLink>
        </div>

        {/* Boards List */}
        {isExpanded && (
          <ul className="mt-0.5 ml-6 pl-2 border-l border-slate-800 space-y-0.5">
            {boards.length > 0 ? (
              boards.map((board) => (
                <li key={board.id}>
                  <NavLink
                    to={`/w/${workspaceId}/p/${project.id}/board/${board.id}`}
                    onClick={onNavigate}
                    className={({ isActive: isBoardActive }) =>
                      `flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors ${
                        isBoardActive || activeBoardId === board.id
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                      }`
                    }
                  >
                    {getBoardIcon(board.type)}
                    <span className="truncate">{board.name}</span>
                  </NavLink>
                </li>
              ))
            ) : (
              <li className="px-2 py-1.5 text-xs text-slate-600">
                No boards yet
              </li>
            )}
            <li>
              <button
                onClick={() => {
                  navigate(`/w/${workspaceId}/p/${project.id}/boards/new`);
                  onNavigate?.();
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-slate-600 hover:text-slate-400 hover:bg-slate-800/50 rounded-lg transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add board
              </button>
            </li>
          </ul>
        )}
      </div>
    </li>
  );
}

export default ProjectNav;
