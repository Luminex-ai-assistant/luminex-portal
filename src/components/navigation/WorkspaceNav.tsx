import React, { useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import {
  ChevronRight,
  Plus,
  Loader2,
  Briefcase,
  Lock,
  Globe,
} from 'lucide-react';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useProjects } from '@/hooks/useProjects';
import type { Workspace } from '@/types/workspace';
import { WorkspaceVisibility } from '@/types/workspace';

interface WorkspaceNavProps {
  onNavigate?: () => void;
}

export function WorkspaceNav({ onNavigate }: WorkspaceNavProps) {
  const navigate = useNavigate();
  const { workspaceId, projectId } = useParams<{ workspaceId?: string; projectId?: string }>();
  const { data: workspaces, isLoading } = useWorkspaces();
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<string[]>(
    workspaceId ? [workspaceId] : []
  );

  const toggleWorkspace = (id: string) => {
    setExpandedWorkspaces((prev) =>
      prev.includes(id) ? prev.filter((wId) => wId !== id) : [...prev, id]
    );
  };

  const getVisibilityIcon = (visibility: WorkspaceVisibility) => {
    switch (visibility) {
      case WorkspaceVisibility.PRIVATE:
        return <Lock className="w-3 h-3" />;
      case WorkspaceVisibility.PUBLIC:
        return <Globe className="w-3 h-3" />;
      default:
        return <Briefcase className="w-3 h-3" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (!workspaces || workspaces.length === 0) {
    return (
      <div className="px-3 py-4">
        <p className="text-sm text-slate-500 mb-3">No workspaces yet</p>
        <button
          onClick={() => {
            navigate('/workspaces/new');
            onNavigate?.();
          }}
          className="flex items-center gap-2 px-3 py-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create your first workspace
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
            Workspaces
          </span>
          <button
            onClick={() => {
              navigate('/workspaces/new');
              onNavigate?.();
            }}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Create workspace"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Workspace List */}
      <ul className="space-y-0.5">
        {workspaces.map((workspace) => (
          <WorkspaceNavItem
            key={workspace.id}
            workspace={workspace}
            isExpanded={expandedWorkspaces.includes(workspace.id)}
            isActive={workspaceId === workspace.id}
            activeProjectId={projectId}
            onToggle={() => toggleWorkspace(workspace.id)}
            onNavigate={onNavigate}
            visibilityIcon={getVisibilityIcon(workspace.visibility)}
          />
        ))}
      </ul>

      {/* Create Workspace Button */}
      <div className="pt-2 mt-2 border-t border-slate-800">
        <button
          onClick={() => {
            navigate('/workspaces/new');
            onNavigate?.();
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Workspace
        </button>
      </div>
    </div>
  );
}

interface WorkspaceNavItemProps {
  workspace: Workspace;
  isExpanded: boolean;
  isActive: boolean;
  activeProjectId?: string;
  onToggle: () => void;
  onNavigate?: () => void;
  visibilityIcon: React.ReactNode;
}

function WorkspaceNavItem({
  workspace,
  isExpanded,
  isActive,
  activeProjectId,
  onToggle,
  onNavigate,
  visibilityIcon,
}: WorkspaceNavItemProps) {
  const { data: projects } = useProjects(isActive ? workspace.id : undefined);

  return (
    <li>
      <div>
        {/* Workspace Header */}
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
            to={`/w/${workspace.id}`}
            onClick={onNavigate}
            className={`flex-1 flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors ${
              isActive && !activeProjectId
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <div
              className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: workspace.color || '#6366f1' }}
            >
              <span className="text-white text-xs font-bold">
                {workspace.name[0]?.toUpperCase()}
              </span>
            </div>
            <span className="flex-1 truncate">{workspace.name}</span>
            <span className="text-slate-600">{visibilityIcon}</span>
          </NavLink>
        </div>

        {/* Projects List */}
        {isExpanded && (
          <ul className="mt-0.5 ml-6 pl-2 border-l border-slate-800 space-y-0.5">
            {projects && projects.length > 0 ? (
              projects.map((project) => (
                <li key={project.id}>
                  <NavLink
                    to={`/w/${workspace.id}/p/${project.id}`}
                    onClick={onNavigate}
                    className={({ isActive: isProjectActive }) =>
                      `flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors ${
                        isProjectActive || activeProjectId === project.id
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                      }`
                    }
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: project.color || '#6366f1' }}
                    />
                    <span className="truncate">{project.name}</span>
                  </NavLink>
                </li>
              ))
            ) : (
              <li className="px-2 py-1.5 text-xs text-slate-600">
                No projects yet
              </li>
            )}
            <li>
              <button
                onClick={() => {
                  navigate(`/w/${workspace.id}/projects/new`);
                  onNavigate?.();
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-slate-600 hover:text-slate-400 hover:bg-slate-800/50 rounded-lg transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add project
              </button>
            </li>
          </ul>
        )}
      </div>
    </li>
  );
}

export default WorkspaceNav;
