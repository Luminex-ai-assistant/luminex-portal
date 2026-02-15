import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { Notification, NotificationStatus } from './types';
import { NotificationType } from './types';

// Mock API functions - replace with actual API calls
const fetchNotifications = async (): Promise<Notification[]> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  // Return mock data
  return mockNotifications;
};

const fetchUnreadCount = async (): Promise<number> => {
  await new Promise((resolve) => setTimeout(resolve, 100));
  const notifications = await fetchNotifications();
  return notifications.filter(n => n.status === 'unread').length;
};

const markAsReadApi = async (notificationId: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 150));
  // In real implementation, this would call the API
  console.log('Marking as read:', notificationId);
};

const markAllAsReadApi = async (): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  console.log('Marking all as read');
};

const dismissNotificationApi = async (notificationId: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 150));
  console.log('Dismissing:', notificationId);
};

// Query keys
const notificationsKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationsKeys.all, 'list'] as const,
  unread: () => [...notificationsKeys.all, 'unread'] as const,
};

// Hook return type
export interface UseNotificationsReturn {
  // Data
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  
  // Mutations
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (notificationId: string) => void;
  
  // Loading states
  isMarkingAsRead: boolean;
  isMarkingAllAsRead: boolean;
  isDismissing: boolean;
}

export function useNotifications(): UseNotificationsReturn {
  const queryClient = useQueryClient();
  
  // Query for notifications
  const {
    data: notifications = [],
    isLoading,
    isError,
    error,
  } = useQuery<Notification[]>({
    queryKey: notificationsKeys.lists(),
    queryFn: fetchNotifications,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Query for unread count
  const { data: unreadCount = 0 } = useQuery<number>({
    queryKey: notificationsKeys.unread(),
    queryFn: fetchUnreadCount,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
  
  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: markAsReadApi,
    onSuccess: (_, notificationId) => {
      // Optimistically update the cache
      queryClient.setQueryData(notificationsKeys.lists(), (old: Notification[] | undefined) => {
        if (!old) return old;
        return old.map(n => 
          n.id === notificationId 
            ? { ...n, status: 'read' as NotificationStatus, readAt: new Date().toISOString() }
            : n
        );
      });
      // Decrement unread count
      queryClient.setQueryData(notificationsKeys.unread(), (old: number) => Math.max(0, (old || 0) - 1));
    },
  });
  
  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: markAllAsReadApi,
    onSuccess: () => {
      queryClient.setQueryData(notificationsKeys.lists(), (old: Notification[] | undefined) => {
        if (!old) return old;
        return old.map(n => ({ 
          ...n, 
          status: 'read' as NotificationStatus, 
          readAt: n.readAt || new Date().toISOString() 
        }));
      });
      queryClient.setQueryData(notificationsKeys.unread(), 0);
    },
  });
  
  // Dismiss mutation
  const dismissMutation = useMutation({
    mutationFn: dismissNotificationApi,
    onSuccess: (_, notificationId) => {
      queryClient.setQueryData(notificationsKeys.lists(), (old: Notification[] | undefined) => {
        if (!old) return old;
        const filtered = old.filter(n => n.id !== notificationId);
        // Update unread count if the dismissed notification was unread
        const dismissed = old.find(n => n.id === notificationId);
        if (dismissed?.status === 'unread') {
          queryClient.setQueryData(notificationsKeys.unread(), (oldCount: number) => Math.max(0, (oldCount || 0) - 1));
        }
        return filtered;
      });
    },
  });
  
  return {
    notifications,
    unreadCount,
    isLoading,
    isError,
    error,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    dismissNotification: dismissMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isDismissing: dismissMutation.isPending,
  };
}

// Mock data
const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-1',
    type: NotificationType.CARD_MENTION,
    title: 'You were mentioned',
    message: '@john mentioned you in "Update API documentation"',
    priority: 'normal',
    status: 'unread',
    actor: {
      id: 'user-2',
      email: 'john@example.com',
      displayName: 'John Smith',
      avatarUrl: null,
    },
    workspaceId: 'ws-1',
    projectId: 'proj-1',
    boardId: 'board-1',
    cardId: 'card-1',
    entities: {
      workspace: { type: 'workspace', id: 'ws-1', name: 'Engineering', url: '/workspaces/ws-1' },
      project: { type: 'project', id: 'proj-1', name: 'API v2', url: '/projects/proj-1' },
      board: { type: 'board', id: 'board-1', name: 'Sprint 24', url: '/boards/board-1' },
      card: { type: 'card', id: 'card-1', name: 'Update API documentation', url: '/cards/card-1' },
    },
    actionUrl: '/cards/card-1',
    activityId: 'act-1',
    activityAction: 'commented',
    emailSent: false,
    emailSentAt: null,
    pushSent: true,
    pushSentAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    readAt: null,
    archivedAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    expiresAt: null,
  },
  {
    id: 'notif-2',
    userId: 'user-1',
    type: NotificationType.CARD_ASSIGNED,
    title: 'Card assigned to you',
    message: 'You were assigned to "Fix login bug"',
    priority: 'high',
    status: 'unread',
    actor: {
      id: 'user-3',
      email: 'sarah@example.com',
      displayName: 'Sarah Johnson',
      avatarUrl: null,
    },
    workspaceId: 'ws-1',
    projectId: 'proj-1',
    boardId: 'board-1',
    cardId: 'card-2',
    entities: {
      workspace: { type: 'workspace', id: 'ws-1', name: 'Engineering', url: '/workspaces/ws-1' },
      project: { type: 'project', id: 'proj-1', name: 'API v2', url: '/projects/proj-1' },
      board: { type: 'board', id: 'board-1', name: 'Sprint 24', url: '/boards/board-1' },
      card: { type: 'card', id: 'card-2', name: 'Fix login bug', url: '/cards/card-2' },
    },
    actionUrl: '/cards/card-2',
    activityId: 'act-2',
    activityAction: 'assigned',
    emailSent: true,
    emailSentAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    pushSent: true,
    pushSentAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    readAt: null,
    archivedAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    expiresAt: null,
  },
  {
    id: 'notif-3',
    userId: 'user-1',
    type: NotificationType.CARD_DUE_SOON,
    title: 'Due soon',
    message: '"Review pull requests" is due tomorrow',
    priority: 'normal',
    status: 'unread',
    actor: null,
    workspaceId: 'ws-1',
    projectId: 'proj-1',
    boardId: 'board-1',
    cardId: 'card-3',
    entities: {
      workspace: { type: 'workspace', id: 'ws-1', name: 'Engineering', url: '/workspaces/ws-1' },
      project: { type: 'project', id: 'proj-1', name: 'API v2', url: '/projects/proj-1' },
      board: { type: 'board', id: 'board-1', name: 'Sprint 24', url: '/boards/board-1' },
      card: { type: 'card', id: 'card-3', name: 'Review pull requests', url: '/cards/card-3' },
    },
    actionUrl: '/cards/card-3',
    activityId: null,
    activityAction: null,
    emailSent: false,
    emailSentAt: null,
    pushSent: false,
    pushSentAt: null,
    readAt: null,
    archivedAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    expiresAt: null,
  },
  {
    id: 'notif-4',
    userId: 'user-1',
    type: NotificationType.CARD_COMMENT,
    title: 'New comment',
    message: 'Mike commented on "Design system update"',
    priority: 'low',
    status: 'read',
    actor: {
      id: 'user-4',
      email: 'mike@example.com',
      displayName: 'Mike Wilson',
      avatarUrl: null,
    },
    workspaceId: 'ws-1',
    projectId: 'proj-2',
    boardId: 'board-2',
    cardId: 'card-4',
    entities: {
      workspace: { type: 'workspace', id: 'ws-1', name: 'Engineering', url: '/workspaces/ws-1' },
      project: { type: 'project', id: 'proj-2', name: 'Design System', url: '/projects/proj-2' },
      board: { type: 'board', id: 'board-2', name: 'Design Board', url: '/boards/board-2' },
      card: { type: 'card', id: 'card-4', name: 'Design system update', url: '/cards/card-4' },
      comment: { type: 'comment', id: 'comment-1', name: 'Comment', url: '/cards/card-4?comment=comment-1' },
    },
    actionUrl: '/cards/card-4?comment=comment-1',
    activityId: 'act-3',
    activityAction: 'commented',
    emailSent: true,
    emailSentAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    pushSent: false,
    pushSentAt: null,
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    archivedAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    expiresAt: null,
  },
  {
    id: 'notif-5',
    userId: 'user-1',
    type: NotificationType.PROJECT_INVITE,
    title: 'Project invitation',
    message: 'You were invited to join "Mobile App" project',
    priority: 'normal',
    status: 'unread',
    actor: {
      id: 'user-5',
      email: 'alex@example.com',
      displayName: 'Alex Chen',
      avatarUrl: null,
    },
    workspaceId: 'ws-1',
    projectId: 'proj-3',
    boardId: null,
    cardId: null,
    entities: {
      workspace: { type: 'workspace', id: 'ws-1', name: 'Engineering', url: '/workspaces/ws-1' },
      project: { type: 'project', id: 'proj-3', name: 'Mobile App', url: '/projects/proj-3' },
    },
    actionUrl: '/projects/proj-3',
    activityId: 'act-4',
    activityAction: 'invited',
    emailSent: true,
    emailSentAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    pushSent: true,
    pushSentAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
    readAt: null,
    archivedAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    expiresAt: null,
  },
  {
    id: 'notif-6',
    userId: 'user-1',
    type: NotificationType.SYSTEM_ANNOUNCEMENT,
    title: 'System update',
    message: 'New features available: Check out the updated dashboard',
    priority: 'low',
    status: 'read',
    actor: null,
    workspaceId: null,
    projectId: null,
    boardId: null,
    cardId: null,
    entities: {},
    actionUrl: '/announcements/new-features',
    activityId: null,
    activityAction: null,
    emailSent: true,
    emailSentAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    pushSent: false,
    pushSentAt: null,
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    archivedAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // Yesterday
    expiresAt: null,
  },
  {
    id: 'notif-7',
    userId: 'user-1',
    type: NotificationType.CARD_MENTION,
    title: 'You were mentioned',
    message: '@lisa mentioned you in "Q4 Planning discussion"',
    priority: 'normal',
    status: 'read',
    actor: {
      id: 'user-6',
      email: 'lisa@example.com',
      displayName: 'Lisa Park',
      avatarUrl: null,
    },
    workspaceId: 'ws-1',
    projectId: 'proj-1',
    boardId: 'board-1',
    cardId: 'card-5',
    entities: {
      workspace: { type: 'workspace', id: 'ws-1', name: 'Engineering', url: '/workspaces/ws-1' },
      project: { type: 'project', id: 'proj-1', name: 'API v2', url: '/projects/proj-1' },
      board: { type: 'board', id: 'board-1', name: 'Sprint 24', url: '/boards/board-1' },
      card: { type: 'card', id: 'card-5', name: 'Q4 Planning discussion', url: '/cards/card-5' },
    },
    actionUrl: '/cards/card-5',
    activityId: 'act-5',
    activityAction: 'commented',
    emailSent: false,
    emailSentAt: null,
    pushSent: false,
    pushSentAt: null,
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    archivedAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(), // 20 hours ago
    expiresAt: null,
  },
  {
    id: 'notif-8',
    userId: 'user-1',
    type: NotificationType.CARD_OVERDUE,
    title: 'Card overdue',
    message: '"Update dependencies" is now overdue',
    priority: 'high',
    status: 'unread',
    actor: null,
    workspaceId: 'ws-1',
    projectId: 'proj-1',
    boardId: 'board-1',
    cardId: 'card-6',
    entities: {
      workspace: { type: 'workspace', id: 'ws-1', name: 'Engineering', url: '/workspaces/ws-1' },
      project: { type: 'project', id: 'proj-1', name: 'API v2', url: '/projects/proj-1' },
      board: { type: 'board', id: 'board-1', name: 'Sprint 24', url: '/boards/board-1' },
      card: { type: 'card', id: 'card-6', name: 'Update dependencies', url: '/cards/card-6' },
    },
    actionUrl: '/cards/card-6',
    activityId: null,
    activityAction: null,
    emailSent: true,
    emailSentAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    pushSent: true,
    pushSentAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), // Yesterday
    readAt: null,
    archivedAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    expiresAt: null,
  },
  {
    id: 'notif-9',
    userId: 'user-1',
    type: NotificationType.WORKSPACE_INVITE,
    title: 'Workspace invitation',
    message: 'You were invited to join "Design Team" workspace',
    priority: 'normal',
    status: 'read',
    actor: {
      id: 'user-7',
      email: 'emma@example.com',
      displayName: 'Emma Davis',
      avatarUrl: null,
    },
    workspaceId: 'ws-2',
    projectId: null,
    boardId: null,
    cardId: null,
    entities: {
      workspace: { type: 'workspace', id: 'ws-2', name: 'Design Team', url: '/workspaces/ws-2' },
    },
    actionUrl: '/workspaces/ws-2',
    activityId: 'act-6',
    activityAction: 'invited',
    emailSent: true,
    emailSentAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    pushSent: false,
    pushSentAt: null,
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
    archivedAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    expiresAt: null,
  },
  {
    id: 'notif-10',
    userId: 'user-1',
    type: NotificationType.CARD_STATUS_CHANGED,
    title: 'Status changed',
    message: '"Deploy to production" was moved to Done',
    priority: 'normal',
    status: 'read',
    actor: {
      id: 'user-2',
      email: 'john@example.com',
      displayName: 'John Smith',
      avatarUrl: null,
    },
    workspaceId: 'ws-1',
    projectId: 'proj-1',
    boardId: 'board-1',
    cardId: 'card-7',
    entities: {
      workspace: { type: 'workspace', id: 'ws-1', name: 'Engineering', url: '/workspaces/ws-1' },
      project: { type: 'project', id: 'proj-1', name: 'API v2', url: '/projects/proj-1' },
      board: { type: 'board', id: 'board-1', name: 'Sprint 24', url: '/boards/board-1' },
      card: { type: 'card', id: 'card-7', name: 'Deploy to production', url: '/cards/card-7' },
    },
    actionUrl: '/cards/card-7',
    activityId: 'act-7',
    activityAction: 'moved',
    emailSent: false,
    emailSentAt: null,
    pushSent: false,
    pushSentAt: null,
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
    archivedAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString(), // ~2 days ago
    expiresAt: null,
  },
];
