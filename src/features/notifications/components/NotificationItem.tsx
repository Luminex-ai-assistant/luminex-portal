import * as React from 'react';
import { AtSign, UserPlus, Clock, MessageCircle, Info, Bell, Check, Trash2, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Notification, NotificationType } from '../types';

interface NotificationItemProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
  onMarkAsRead: (notificationId: string) => void;
  onDismiss: (notificationId: string) => void;
}

// Map notification types to icons
const notificationIcons: Record<NotificationType, typeof Info> = {
  // Mention
  [NotificationType.CARD_MENTION]: AtSign,
  
  // Assignment
  [NotificationType.CARD_ASSIGNED]: UserPlus,
  [NotificationType.CARD_UNASSIGNED]: UserPlus,
  
  // Due date
  [NotificationType.CARD_DUE_SOON]: Clock,
  [NotificationType.CARD_OVERDUE]: Clock,
  
  // Comment
  [NotificationType.CARD_COMMENT]: MessageCircle,
  
  // System
  [NotificationType.SYSTEM_ANNOUNCEMENT]: Info,
  [NotificationType.SYSTEM_MAINTENANCE]: Info,
  
  // Others default to Info
  [NotificationType.CARD_STATUS_CHANGED]: Info,
  [NotificationType.CARD_MOVED]: Info,
  [NotificationType.PROJECT_INVITE]: UserPlus,
  [NotificationType.PROJECT_ROLE_CHANGED]: UserPlus,
  [NotificationType.PROJECT_ARCHIVED]: Info,
  [NotificationType.WORKSPACE_INVITE]: UserPlus,
  [NotificationType.WORKSPACE_ROLE_CHANGED]: UserPlus,
  [NotificationType.AUTOMATION_TRIGGERED]: Info,
};

// Get icon color based on notification type
function getIconColor(type: NotificationType): string {
  switch (type) {
    case NotificationType.CARD_MENTION:
      return 'text-indigo-400 bg-indigo-400/10';
    case NotificationType.CARD_ASSIGNED:
    case NotificationType.CARD_UNASSIGNED:
      return 'text-blue-400 bg-blue-400/10';
    case NotificationType.CARD_DUE_SOON:
      return 'text-amber-400 bg-amber-400/10';
    case NotificationType.CARD_OVERDUE:
      return 'text-red-400 bg-red-400/10';
    case NotificationType.CARD_COMMENT:
      return 'text-emerald-400 bg-emerald-400/10';
    case NotificationType.SYSTEM_ANNOUNCEMENT:
    case NotificationType.SYSTEM_MAINTENANCE:
      return 'text-purple-400 bg-purple-400/10';
    default:
      return 'text-slate-400 bg-slate-400/10';
  }
}

export function NotificationItem({
  notification,
  onClick,
  onMarkAsRead,
  onDismiss,
}: NotificationItemProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  
  const Icon = notificationIcons[notification.type] || Info;
  const iconColorClass = getIconColor(notification.type);
  const isUnread = notification.status === 'unread';
  
  const handleClick = () => {
    onClick(notification);
  };
  
  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead(notification.id);
  };
  
  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDismiss(notification.id);
  };
  
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });
  
  return (
    <div
      className={cn(
        'group relative flex items-start gap-3 p-4 cursor-pointer transition-colors',
        'hover:bg-slate-800/50',
        isUnread && 'bg-slate-800/30'
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Unread indicator */}
      {isUnread && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
      )}
      
      {/* Icon */}
      <div className={cn(
        'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
        iconColorClass
      )}>
        <Icon className="w-5 h-5" />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className={cn(
            'text-sm font-medium text-slate-200',
            isUnread && 'text-white'
          )}>
            {notification.title}
          </h4>
          
          {/* Hover actions */}
          <div className={cn(
            'flex items-center gap-1 transition-opacity',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}>
            {isUnread && (
              <button
                onClick={handleMarkAsRead}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
                title="Mark as read"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"
              title="Dismiss"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        
        <p className="text-sm text-slate-400 mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        
        <span className="text-xs text-slate-500 mt-1.5 block">
          {timeAgo}
        </span>
      </div>
    </div>
  );
}
