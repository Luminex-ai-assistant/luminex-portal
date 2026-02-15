import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Workspace } from '@/types/workspace';
import type { Project } from '@/types/project';

/**
 * Workspace store state
 */
interface WorkspaceState {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  recentProjects: Project[];
  isLoading: boolean;
}

/**
 * Workspace store actions
 */
interface WorkspaceActions {
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  addWorkspace: (workspace: Workspace) => void;
  updateWorkspace: (workspaceId: string, updates: Partial<Workspace>) => void;
  removeWorkspace: (workspaceId: string) => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
  setRecentProjects: (projects: Project[]) => void;
  addRecentProject: (project: Project) => void;
  setLoading: (isLoading: boolean) => void;
}

/**
 * Combined workspace store type
 */
type WorkspaceStore = WorkspaceState & WorkspaceActions;

/**
 * Initial state for workspace store
 */
const initialState: WorkspaceState = {
  currentWorkspace: null,
  workspaces: [],
  recentProjects: [],
  isLoading: false,
};

/**
 * Workspace store with Zustand + Immer middleware
 * 
 * Note: This store is NOT persisted. Workspace data is fetched from the server
 * and cached via React Query. This store manages client-side workspace state only.
 */
export const useWorkspaceStore = create<WorkspaceStore>()(
  immer((set) => ({
    ...initialState,

    setCurrentWorkspace: (workspace) =>
      set((state) => {
        state.currentWorkspace = workspace;
      }),

    addWorkspace: (workspace) =>
      set((state) => {
        // Avoid duplicates
        const exists = state.workspaces.some((w) => w.id === workspace.id);
        if (!exists) {
          state.workspaces.push(workspace);
        }
      }),

    updateWorkspace: (workspaceId, updates) =>
      set((state) => {
        const index = state.workspaces.findIndex((w) => w.id === workspaceId);
        if (index !== -1) {
          state.workspaces[index] = { ...state.workspaces[index], ...updates };
        }
        // Also update current workspace if it's the one being updated
        if (state.currentWorkspace?.id === workspaceId) {
          state.currentWorkspace = { ...state.currentWorkspace, ...updates };
        }
      }),

    removeWorkspace: (workspaceId) =>
      set((state) => {
        state.workspaces = state.workspaces.filter((w) => w.id !== workspaceId);
        // Clear current workspace if it's the one being removed
        if (state.currentWorkspace?.id === workspaceId) {
          state.currentWorkspace = null;
        }
      }),

    setWorkspaces: (workspaces) =>
      set((state) => {
        state.workspaces = workspaces;
      }),

    setRecentProjects: (projects) =>
      set((state) => {
        state.recentProjects = projects;
      }),

    addRecentProject: (project) =>
      set((state) => {
        // Remove if already exists (to move to front)
        state.recentProjects = state.recentProjects.filter(
          (p) => p.id !== project.id
        );
        // Add to front and limit to 10
        state.recentProjects.unshift(project);
        if (state.recentProjects.length > 10) {
          state.recentProjects = state.recentProjects.slice(0, 10);
        }
      }),

    setLoading: (isLoading) =>
      set((state) => {
        state.isLoading = isLoading;
      }),
  }))
);
