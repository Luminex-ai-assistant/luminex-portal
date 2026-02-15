import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

/**
 * UI store state
 */
interface UIState {
  // Sidebar state
  sidebarCollapsed: boolean;

  // Modal state
  activeModal: string | null;
  modalData: unknown;

  // Active context
  activeWorkspaceId: string | null;
  activeProjectId: string | null;
  activeBoardId: string | null;
}

/**
 * UI store actions
 */
interface UIActions {
  // Sidebar actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Modal actions
  openModal: (modal: string, data?: unknown) => void;
  closeModal: () => void;

  // Active context actions
  setActiveWorkspace: (workspaceId: string | null) => void;
  setActiveProject: (projectId: string | null) => void;
  setActiveBoard: (boardId: string | null) => void;
}

/**
 * Combined UI store type
 */
type UIStore = UIState & UIActions;

/**
 * Initial state for UI store
 */
const initialState: UIState = {
  sidebarCollapsed: false,
  activeModal: null,
  modalData: null,
  activeWorkspaceId: null,
  activeProjectId: null,
  activeBoardId: null,
};

/**
 * UI store with Zustand + Immer + Persist middleware
 * 
 * Persisted: sidebarCollapsed (user preference)
 * Not persisted: activeModal, modalData, active IDs (session-only)
 */
export const useUIStore = create<UIStore>()(
  persist(
    immer((set) => ({
      ...initialState,

      toggleSidebar: () =>
        set((state) => {
          state.sidebarCollapsed = !state.sidebarCollapsed;
        }),

      setSidebarCollapsed: (collapsed) =>
        set((state) => {
          state.sidebarCollapsed = collapsed;
        }),

      openModal: (modal, data) =>
        set((state) => {
          state.activeModal = modal;
          state.modalData = data ?? null;
        }),

      closeModal: () =>
        set((state) => {
          state.activeModal = null;
          state.modalData = null;
        }),

      setActiveWorkspace: (workspaceId) =>
        set((state) => {
          state.activeWorkspaceId = workspaceId;
          // Reset child contexts when workspace changes
          if (state.activeWorkspaceId !== workspaceId) {
            state.activeProjectId = null;
            state.activeBoardId = null;
          }
        }),

      setActiveProject: (projectId) =>
        set((state) => {
          state.activeProjectId = projectId;
          // Reset board when project changes
          if (state.activeProjectId !== projectId) {
            state.activeBoardId = null;
          }
        }),

      setActiveBoard: (boardId) =>
        set((state) => {
          state.activeBoardId = boardId;
        }),
    })),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist sidebar state - everything else is session-only
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
