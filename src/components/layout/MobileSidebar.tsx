import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  Clock,
  Settings,
  ChevronDown,
  Plus,
  User,
  X,
  Building2,
  Loader2,
} from 'lucide-react';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useProjects } from '@/hooks/useProjects';
import { useAuthStore } from '@/stores/authStore';
import type { Workspace } from '@/types/workspace';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const navigate = useNavigate();
  const { workspaceId, projectId } = useParams<{ workspaceId?: string; projectId?: string }>();
  const { user } = useAuthStore();
  
  const { data: workspaces, isLoading: workspacesLoading } = useWorkspaces();
  const { data: projects } = useProjects(workspaceId);
  
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<string[]>(
    workspaceId ? [workspaceId] : []
  );
  const [workspaceSwitcherOpen, setWorkspaceSwitcherOpen] = useState(false);

  const toggleWorkspaceExpanded = (id: string) => {
    setExpandedWorkspaces((prev) =>
      prev.includes(id) ? prev.filter((wId) => wId !== id) : [...prev, id]
    );
  };

  const isWorkspaceExpanded = (id: string) => expandedWorkspaces.includes(id);

  const handleWorkspaceSelect = (workspace: Workspace) => {
    setWorkspaceSwitcherOpen(false);
    navigate(`/w/${workspace.id}`);
    onClose();
  };

  const currentWorkspace = workspaces?.find((w) => w.id === workspaceId);

  const handleNavigate = () => {
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />

        {/* Drawer */}
        <Dialog.Content
          className="fixed left-0 top-0 h-full w-72 bg-slate-900 border-r border-slate-800 flex flex-col z-50 lg:hidden animate-in slide-in-from-left duration-300"
          aria-label="Mobile navigation"
        >
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-white font-semibold text-lg">Portal</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Workspace Switcher */}
          <div className="p-3 border-b border-slate-800">
            <button
              onClick={() => setWorkspaceSwitcherOpen(!workspaceSwitcherOpen)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
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
              <span className="flex-1 text-left text-slate-200 text-sm truncate">
                {currentWorkspace?.name || 'Select Workspace'}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  workspaceSwitcherOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {workspaceSwitcherOpen && (
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
                    onClick={() => {
                      navigate('/workspaces/new');
                      onClose();
                    }}
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
                  onClick={handleNavigate}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-slate-800 border-l-2 border-indigo-500 text-white'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`
                  }
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="text-sm">Dashboard</span>
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
                        }`}
                        aria-expanded={isWorkspaceExpanded(workspace.id)}
                      >
                        <Building2 
                          className="w-5 h-5" 
                          style={{ color: workspaceId === workspace.id ? undefined : workspace.color || '#6366f1' }}
                        />
                        <span className="flex-1 text-left text-sm truncate">{workspace.name}</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            isWorkspaceExpanded(workspace.id) ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {isWorkspaceExpanded(workspace.id) && workspace.id === workspaceId && projects && (
                        <ul className="mt-1 ml-4 pl-4 border-l border-slate-700 space-y-1">
                          {projects.map((project) => (
                            <li key={project.id}>
                              <NavLink
                                to={`/w/${workspace.id}/p/${project.id}`}
                                onClick={handleNavigate}
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
                              onClick={() => {
                                navigate(`/w/${workspace.id}/projects/new`);
                                onClose();
                              }}
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
                  onClick={handleNavigate}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-slate-800 border-l-2 border-indigo-500 text-white'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`
                  }
                >
                  <Layers className="w-5 h-5" />
                  <span className="text-sm">Templates</span>
                </NavLink>
              </li>

              {/* Automations */}
              <li>
                <NavLink
                  to="/automations"
                  onClick={handleNavigate}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-slate-800 border-l-2 border-indigo-500 text-white'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`
                  }
                >
                  <Clock className="w-5 h-5" />
                  <span className="text-sm">Automations</span>
                </NavLink>
              </li>
            </ul>
          </nav>

          {/* User Menu */}
          <div className="p-3 border-t border-slate-800">
            <button 
              onClick={() => {
                navigate('/profile');
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center overflow-hidden">
                {user?.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt={user.name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <User className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm text-white truncate">{user?.name || 'Guest User'}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email || ''}</p>
              </div>
            </button>
          </div>

          {/* Settings Link */}
          <div className="px-3 pb-3">
            <NavLink
              to="/settings"
              onClick={handleNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`
              }
            >
              <Settings className="w-5 h-5" />
              <span className="text-sm">Settings</span>
            </NavLink>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default MobileSidebar;
