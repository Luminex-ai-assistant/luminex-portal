import * as React from 'react';
import { isToday, isYesterday, compareDesc } from 'date-fns';
import type { Notification } from '../types';
import { NotificationItem } from './NotificationItem';

interface NotificationListProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onMarkAsRead: (notificationId: string) => void;
  onDismiss: (notificationId: string) => void;
}

interface GroupedNotifications {
  today: Notification[];
  yesterday: Notification[];
  earlier: Notification[];
}

function groupNotificationsByDate(notifications: Notification[]): GroupedNotifications {
  const grouped: GroupedNotifications = {
    today: [],
    yesterday: [],
    earlier: [],
  };
  
  // Sort by date descending
  const sorted = [...notifications].sort((a, b) => 
    compareDesc(new Date(a.createdAt), new Date(b.createdAt))
  );
  
  sorted.forEach((notification) => {
    const date = new Date(notification.createdAt);
    
    if (isToday(date)) {
      grouped.today.push(notification);
    } else if (isYesterday(date)) {
      grouped.yesterday.push(notification);
    } else {
      grouped.earlier.push(notification);
    }
  });
  
  return grouped;
}

function NotificationGroup({
  title,
  notifications,
  onNotificationClick,
  onMarkAsRead,
  onDismiss,
}: {
  title: string;
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onMarkAsRead: (notificationId: string) => void;
  onDismiss: (notificationId: string) => void;
}) {
  if (notifications.length === 0) return null;
  
  return (
    <div className="py-2">
      <h3 className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider sticky top-0 bg-slate-950 z-10">
        {title}
      </h3>
      <div className="divide-y divide-slate-800/50">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClick={onNotificationClick}
            onMarkAsRead={onMarkAsRead}
            onDismiss={onDismiss}
          />
        ))}
      </div>
    </div>
  );
}

export function NotificationList({
  notifications,
  onNotificationClick,
  onMarkAsRead,
  onDismiss,
}: NotificationListProps) {
  const grouped = React.useMemo(
    () => groupNotificationsByDate(notifications),
    [notifications]
  );
  
  if (notifications.length === 0) {
    return null;
  }
  
  return (
    <div className="flex-1 overflow-y-auto">
      <NotificationGroup
        title="Today"
        notifications={grouped.today}
        onNotificationClick={onNotificationClick}
        onMarkAsRead={onMarkAsRead}
        onDismiss={onDismiss}
      />
      <NotificationGroup
        title="Yesterday"
        notifications={grouped.yesterday}
        onNotificationClick={onNotificationClick}
        onMarkAsRead={onMarkAsRead}
        onDismiss={onDismiss}
      />
      <NotificationGroup
        title="Earlier"
        notifications={grouped.earlier}
        onNotificationClick={onNotificationClick}
        onMarkAsRead={onMarkAsRead}
        onDismiss={onDismiss}
      />
    </div>
  );
}
