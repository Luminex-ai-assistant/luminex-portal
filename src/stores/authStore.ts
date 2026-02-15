import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { User, UserPermissions } from '@/types/user';
import { setTokens, clearTokens, parseToken } from '@/lib/auth/jwt';

/**
 * Auth store state
 */
interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: UserPermissions;
}

/**
 * Auth store actions
 */
interface AuthActions {
  // Actions
  setUser: (user: User | null) => void;
  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  setPermissions: (permissions: UserPermissions) => void;
}

/**
 * Combined auth store type
 */
type AuthStore = AuthState & AuthActions;

/**
 * Initial state for auth store
 */
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  permissions: {
    workspaces: {},
    version: 0,
  },
};

/**
 * Auth store with Zustand + Immer + Persist middleware
 * 
 * Note: Only non-sensitive data (sidebarCollapsed, lastWorkspaceId) is persisted.
 * Tokens are stored in memory only (never localStorage for XSS protection).
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    immer((set) => ({
      ...initialState,

      setUser: (user) =>
        set((state) => {
          state.user = user;
          state.isAuthenticated = user !== null;
        }),

      login: (accessToken, refreshToken, user) =>
        set((state) => {
          // Store tokens in memory (not persisted)
          setTokens(accessToken, refreshToken);
          
          // Update user state
          state.user = user;
          state.isAuthenticated = true;
          state.isLoading = false;
        }),

      logout: () =>
        set((state) => {
          // Clear tokens from memory
          clearTokens();
          
          // Reset state to initial
          state.user = null;
          state.isAuthenticated = false;
          state.permissions = {
            workspaces: {},
            version: 0,
          };
        }),

      updateUser: (updates) =>
        set((state) => {
          if (state.user) {
            state.user = { ...state.user, ...updates };
          }
        }),

      setPermissions: (permissions) =>
        set((state) => {
          state.permissions = permissions;
        }),
    })),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist non-sensitive data
      partialize: (state) => ({
        // Don't persist user or tokens - only UI-related state
        // User is kept in memory only for security
      }),
    }
  )
);
