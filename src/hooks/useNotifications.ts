import { useQuery } from '@tanstack/react-query';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  link?: string;
  createdAt: string;
}

// Mock notifications data
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    title: 'New comment on Website Redesign',
    message: 'Jane Smith commented on "Update homepage hero section"',
    type: 'info',
    read: false,
    link: '/w/ws-1/p/proj-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
  },
  {
    id: 'notif-2',
    title: 'Task completed',
    message: 'Bob Johnson completed "Fix navigation bug"',
    type: 'success',
    read: false,
    link: '/w/ws-1/p/proj-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: 'notif-3',
    title: 'You were assigned to a task',
    message: 'You were assigned to "Review API documentation"',
    type: 'info',
    read: true,
    link: '/w/ws-1/p/proj-3',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: 'notif-4',
    title: 'Project deadline approaching',
    message: 'Mobile App v2.0 deadline is in 3 days',
    type: 'warning',
    read: true,
    link: '/w/ws-1/p/proj-2',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
  },
];

// Fetch notifications (mock)
const fetchNotifications = async (): Promise<Notification[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return [...MOCK_NOTIFICATIONS];
};

// Query keys
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
};

// Hooks
export function useNotifications() {
  const { data: notifications, ...rest } = useQuery({
    queryKey: notificationKeys.lists(),
    queryFn: fetchNotifications,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  const unreadCount = notifications?.filter((n) => !n.read).length || 0;

  return {
    data: notifications,
    unreadCount,
    ...rest,
  };
}
