import { useQuery } from '@tanstack/react-query';
import type { Activity } from '../components/RecentActivity';
import type { QuickAccessItem } from '../components/QuickAccess';

// Mock data - will be replaced with real API calls
const mockStats = {
  activeProjects: 12,
  tasksDueToday: 8,
  completedThisWeek: 24,
  notifications: 5,
  changes: {
    activeProjects: { value: 12, isPositive: true },
    tasksDueToday: { value: -5, isPositive: false },
    completedThisWeek: { value: 18, isPositive: true },
    notifications: { value: 0, isPositive: true },
  },
};

const mockActivities: Activity[] = [
  {
    id: '1',
    user: { name: 'Sarah Chen', initials: 'SC' },
    action: 'completed',
    target: { type: 'task', name: 'Update API documentation', id: 'task-1' },
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
  },
  {
    id: '2',
    user: { name: 'Mike Johnson', initials: 'MJ' },
    action: 'created',
    target: { type: 'project', name: 'Q1 Marketing Campaign', id: 'proj-1' },
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
  },
  {
    id: '3',
    user: { name: 'Emily Davis', initials: 'ED' },
    action: 'commented',
    target: { type: 'task', name: 'Design system review', id: 'task-2' },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: '4',
    user: { name: 'Alex Rivera', initials: 'AR' },
    action: 'joined',
    target: { type: 'workspace', name: 'Engineering Team', id: 'ws-1' },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
  },
  {
    id: '5',
    user: { name: 'Jessica Park', initials: 'JP' },
    action: 'updated',
    target: { type: 'board', name: 'Sprint 24 Backlog', id: 'board-1' },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
  },
  {
    id: '6',
    user: { name: 'David Kim', initials: 'DK' },
    action: 'assigned',
    target: { type: 'task', name: 'Fix authentication bug', id: 'task-3' },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
  },
];

const mockQuickAccess: QuickAccessItem[] = [
  {
    id: 'ws-1',
    type: 'workspace',
    name: 'Engineering Team',
    description: 'Core development workspace',
    isPinned: true,
    color: '#6366f1',
    memberCount: 12,
  },
  {
    id: 'ws-2',
    type: 'workspace',
    name: 'Product Design',
    description: 'Design and UX workspace',
    isPinned: true,
    color: '#ec4899',
    memberCount: 6,
  },
  {
    id: 'proj-1',
    type: 'project',
    name: 'Website Redesign',
    isPinned: true,
    color: '#10b981',
    taskCount: 24,
    memberCount: 8,
  },
  {
    id: 'proj-2',
    type: 'project',
    name: 'Mobile App v2.0',
    isPinned: false,
    color: '#f59e0b',
    taskCount: 42,
    memberCount: 15,
  },
  {
    id: 'proj-3',
    type: 'project',
    name: 'API Migration',
    isPinned: true,
    color: '#3b82f6',
    taskCount: 18,
    memberCount: 5,
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface DashboardStats {
  activeProjects: number;
  tasksDueToday: number;
  completedThisWeek: number;
  notifications: number;
  changes: {
    activeProjects: { value: number; isPositive: boolean };
    tasksDueToday: { value: number; isPositive: boolean };
    completedThisWeek: { value: number; isPositive: boolean };
    notifications: { value: number; isPositive: boolean };
  };
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  await delay(800); // Simulate network delay
  return mockStats;
}

async function fetchRecentActivity(): Promise<Activity[]> {
  await delay(600);
  return mockActivities;
}

async function fetchQuickAccess(): Promise<QuickAccessItem[]> {
  await delay(500);
  return mockQuickAccess;
}

export function useDashboardData() {
  const statsQuery = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: fetchDashboardStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const activityQuery = useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: fetchRecentActivity,
    staleTime: 30 * 1000, // 30 seconds
  });

  const quickAccessQuery = useQuery({
    queryKey: ['dashboard', 'quickAccess'],
    queryFn: fetchQuickAccess,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    // Combined loading state
    isLoading: statsQuery.isLoading || activityQuery.isLoading || quickAccessQuery.isLoading,
    // Combined error state
    isError: statsQuery.isError || activityQuery.isError || quickAccessQuery.isError,
    error: statsQuery.error || activityQuery.error || quickAccessQuery.error,
    // Individual query states for granular control
    stats: {
      data: statsQuery.data,
      isLoading: statsQuery.isLoading,
      isError: statsQuery.isError,
      refetch: statsQuery.refetch,
    },
    activity: {
      data: activityQuery.data,
      isLoading: activityQuery.isLoading,
      isError: activityQuery.isError,
      refetch: activityQuery.refetch,
    },
    quickAccess: {
      data: quickAccessQuery.data,
      isLoading: quickAccessQuery.isLoading,
      isError: quickAccessQuery.isError,
      refetch: quickAccessQuery.refetch,
    },
  };
}

// Individual hooks for when you only need specific data
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: fetchDashboardStats,
    staleTime: 2 * 60 * 1000,
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: fetchRecentActivity,
    staleTime: 30 * 1000,
  });
}

export function useQuickAccess() {
  return useQuery({
    queryKey: ['dashboard', 'quickAccess'],
    queryFn: fetchQuickAccess,
    staleTime: 5 * 60 * 1000,
  });
}
