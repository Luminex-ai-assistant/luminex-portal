import React, { useState } from 'react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  Clock,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  ChevronDown,
  User,
  Building2,
  Loader2,
} from 'lucide-react';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useProjects } from '@/hooks/useProjects';
import { useAuthStore } from '@/stores/authStore';
import type { Workspace } from '@/types/workspace';

interface SidebarProps {
  collapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed = false, onCollapseChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<string[]>([]);
  const [workspaceSwitcherOpen, setWorkspaceSwitcherOpen] = useState(false);
  const { workspaceId, projectId } = useParams<{ workspaceId?: string; projectId?: string }>();
  const navigate = useNavigate();

  const { user } = useAuthStore();
  const { data: workspaces, isLoading: workspacesLoading } = useWorkspaces();
  const { data: projects } = useProjects(workspaceId);

  // Auto-expand current workspace
  React.useEffect(() => {
    if (workspaceId && !expandedWorkspaces.includes(workspaceId)) {
      setExpandedWorkspaces((prev) => [...prev, workspaceId]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  const handleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onCollapseChange?.(newCollapsed);
    if (newCollapsed) {
      setWorkspaceSwitcherOpen(false);
    }
  };

  const toggleWorkspaceExpanded = (workspaceId: string) => {
    setExpandedWorkspaces((prev) =>
      prev.includes(workspaceId) ? prev.filter((id) => id !== workspaceId) : [...prev, workspaceId]
    );
  };

  const isWorkspaceExpanded = (id: string) => expandedWorkspaces.includes(id);

  const handleWorkspaceSelect = (selectedWorkspace: Workspace) => {
    setWorkspaceSwitcherOpen(false);
    navigate(`/w/${selectedWorkspace.id}`);
  };

  const currentWorkspace = workspaces?.find((w) => w.id === workspaceId);

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 z-40 ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
      aria-label="Main navigation"
    >
      {/* Logo/Brand */}
      <div className="h-16 flex items-center px-4 border-b border-slate-800">
        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">P</span>
        </div>
        {!isCollapsed && (
          <span className="ml-3 text-white font-semibold text-lg truncate">Portal</span>
        )}
      </div>

      {/* Workspace Switcher */}
      <div className="p-3">
        <button
          onClick={() => !isCollapsed && setWorkspaceSwitcherOpen(!workspaceSwitcherOpen)}
          disabled={isCollapsed}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            isCollapsed ? 'justify-center' : ''
          }`}
          aria-expanded={workspaceSwitcherOpen}
          aria-haspopup="listbox"
        >
          <div 
            className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: currentWorkspace?.color || '#10b981' }}
          >
            <span className="text-white text-xs font-bold">
              {currentWorkspace?.name?.[0]?.toUpperCase() || 'W'}
            </span>
          </div>
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left text-slate-200 text-sm truncate">
                {currentWorkspace?.name || 'Select Workspace'}
              </span>
              <ChevronDown 
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  workspaceSwitcherOpen ? 'rotate-180' : ''
                }`} 
              />
            </>
          )}
        </button>

        {workspaceSwitcherOpen && !isCollapsed && (
          <div className="mt-2 py-2 bg-slate-800 rounded-lg border border-slate-700 max-h-60 overflow-y-auto">
            {workspacesLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              </div>
            ) : workspaces && workspaces.length > 0 ? (
              <>
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => handleWorkspaceSelect(ws)}
                    className={`w-full px-3 py-2 text-left hover:bg-slate-700 text-sm flex items-center gap-2 transition-colors ${
                      ws.id === workspaceId ? 'bg-slate-700/50 text-white' : 'text-slate-300'
                    }`}
                  >
                    <div 
                      className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: ws.color || '#6366f1' }}
                    >
                      <span className="text-white text-xs font-bold">{ws.name[0]?.toUpperCase()}</span>
                    </div>
                    <span className="truncate">{ws.name}</span>
                  </button>
                ))}
              </>
            ) : (
              <div className="px-3 py-2 text-sm text-slate-500">No workspaces found</div>
            )}
            <div className="border-t border-slate-700 mt-2 pt-2">
              <button 
                onClick={() => navigate('/workspaces/new')}
                className="w-full px-3 py-2 text-left text-slate-300 hover:bg-slate-700 text-sm flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create workspace
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 overflow-y-auto" role="navigation">
        <ul className="space-y-1">
          {/* Dashboard Link */}
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-slate-800 border-l-2 border-indigo-500 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                } ${isCollapsed ? 'justify-center' : ''}`
              }
            >
              <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm">Dashboard</span>}
            </NavLink>
          </li>

          {/* Workspaces with Projects */}
          {workspacesLoading ? (
            <li className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            </li>
          ) : workspaces && workspaces.length > 0 ? (
            workspaces.map((workspace) => (
              <li key={workspace.id}>
                <div>
                  <button
                    onClick={() => toggleWorkspaceExpanded(workspace.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      workspaceId === workspace.id
                        ? 'bg-slate-800 border-l-2 border-indigo-500 text-white'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                    aria-expanded={isWorkspaceExpanded(workspace.id)}
                  >
                    <Building2 
                      className="w-5 h-5 flex-shrink-0" 
                      style={{ color: workspaceId === workspace.id ? undefined : workspace.color || '#6366f1' }}
                    />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left text-sm truncate">{workspace.name}</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            isWorkspaceExpanded(workspace.id) ? 'rotate-180' : ''
                          }`}
                        />
                      </>
                    )}
                  </button>

                  {!isCollapsed && isWorkspaceExpanded(workspace.id) && workspace.id === workspaceId && projects && (
                    <ul className="mt-1 ml-4 pl-4 border-l border-slate-700 space-y-1">
                      {projects.map((project) => (
                        <li key={project.id}>
                          <NavLink
                            to={`/w/${workspace.id}/p/${project.id}`}
                            className={({ isActive }) =>
                              `block px-3 py-2 rounded-lg text-sm transition-colors ${
                                isActive || projectId === project.id
                                  ? 'bg-slate-800 text-white'
                                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                              }`
                            }
                          >
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: project.color || '#6366f1' }}
                              />
                              <span className="truncate">{project.name}</span>
                            </div>
                          </NavLink>
                        </li>
                      ))}
                      <li>
                        <button
                          onClick={() => navigate(`/w/${workspace.id}/projects/new`)}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors flex items-center gap-2"
                        >
                          <Plus className="w-3 h-3" />
                          Add project
                        </button>
                      </li>
                    </ul>
                  )}
                </div>
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-sm text-slate-500">
              No workspaces available
            </li>
          )}

          {/* Templates */}
          <li>
            <NavLink
              to="/templates"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-slate-800 border-l-2 border-indigo-500 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                } ${isCollapsed ? 'justify-center' : ''}`
              }
            >
              <Layers className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm">Templates</span>}
            </NavLink>
          </li>

          {/* Automations */}
          <li>
            <NavLink
              to="/automations"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-slate-800 border-l-2 border-indigo-500 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                } ${isCollapsed ? 'justify-center' : ''}`
              }
            >
              <Clock className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm">Automations</span>}
            </NavLink>
          </li>

          {/* Settings */}
          <li className="pt-4 mt-4 border-t border-slate-800">
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-slate-800 border-l-2 border-indigo-500 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                } ${isCollapsed ? 'justify-center' : ''}`
              }
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm">Settings</span>}
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* User Menu */}
      <div className="p-3 border-t border-slate-800">
        <button
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />
            ) : (
              <User className="w-4 h-4 text-slate-400" />
            )}
          </div>
          {!isCollapsed && (
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm text-white truncate">{user?.name || 'Guest User'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email || ''}</p>
            </div>
          )}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={handleCollapse}
        className="absolute -right-3 top-20 w-6 h-6 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center text-slate-300 transition-colors"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </aside>
  );
}
