import { QueryClient } from '@tanstack/react-query';

const MINUTE = 1000 * 60;
const HOUR = MINUTE * 60;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Aggressive caching to reduce API calls
      staleTime: 5 * MINUTE,
      gcTime: 1 * HOUR,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Entity-specific stale times
export const entityConfig = {
  users: { staleTime: 10 * MINUTE },
  workspaces: { staleTime: 10 * MINUTE },
  projects: { staleTime: 5 * MINUTE },
  boards: { staleTime: 2 * MINUTE },
  cards: { staleTime: 30 * 1000, refetchInterval: 60 * 1000 },
  comments: { staleTime: 1 * MINUTE },
  notifications: { staleTime: 30 * 1000, refetchInterval: 30 * 1000 },
};

// Query keys
export const queryKeys = {
  workspaces: {
    all: () => ['workspaces'] as const,
    detail: (id: string) => ['workspaces', 'detail', id] as const,
  },
  projects: {
    all: () => ['projects'] as const,
    byWorkspace: (workspaceId: string) => ['projects', { workspaceId }] as const,
  },
  boards: {
    all: () => ['boards'] as const,
    byProject: (projectId: string) => ['boards', { projectId }] as const,
    detail: (id: string) => ['boards', 'detail', id] as const,
  },
  cards: {
    all: () => ['cards'] as const,
    byBoard: (boardId: string) => ['cards', { boardId }] as const,
    detail: (id: string) => ['cards', 'detail', id] as const,
  },
  notifications: {
    all: (userId: string) => ['notifications', userId] as const,
    unread: (userId: string) => ['notifications', userId, 'unread'] as const,
  },
};
