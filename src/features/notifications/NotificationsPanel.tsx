import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Bell, X, Check, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useNotifications } from './hooks/useNotifications';
import { NotificationList } from './components/NotificationList';
import { EmptyNotifications } from './components/EmptyNotifications';
import type { Notification } from './types';

interface NotificationsPanelProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationsPanel({ isOpen, onOpenChange }: NotificationsPanelProps) {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    isMarkingAsRead,
    isMarkingAllAsRead,
    isDismissing,
  } = useNotifications();
  
  const handleNotificationClick = React.useCallback(
    (notification: Notification) => {
      // Mark as read if unread
      if (notification.status === 'unread') {
        markAsRead(notification.id);
      }
      
      // Navigate to the related entity
      if (notification.actionUrl) {
        navigate(notification.actionUrl);
        onOpenChange(false);
      }
    },
    [markAsRead, navigate, onOpenChange]
  );
  
  const handleMarkAllAsRead = React.useCallback(() => {
    markAllAsRead();
  }, [markAllAsRead]);
  
  const hasNotifications = notifications.length > 0;
  const hasUnread = unreadCount > 0;
  
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Backdrop */}
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
          )}
        />
        
        {/* Drawer Content */}
        <DialogPrimitive.Content
          className={cn(
            'fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-950 shadow-2xl',
            'border-l border-slate-800',
            'flex flex-col',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-full',
            'duration-300 ease-out',
            'focus:outline-none'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="w-5 h-5 text-slate-300" />
                {hasUnread && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full ring-2 ring-slate-950" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Notifications</h2>
                {hasUnread && (
                  <p className="text-xs text-slate-400">
                    {unreadCount} unread
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {hasUnread && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={isMarkingAllAsRead}
                  className="text-slate-400 hover:text-slate-200"
                >
                  {isMarkingAllAsRead ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  ) : (
                    <Check className="w-4 h-4 mr-1.5" />
                  )}
                  Mark all read
                </Button>
              )}
              <DialogPrimitive.Close asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </Button>
              </DialogPrimitive.Close>
            </div>
          </div>
          
          {/* Content */}
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="text-sm">Loading notifications...</span>
              </div>
            </div>
          ) : !hasNotifications ? (
            <EmptyNotifications />
          ) : (
            <NotificationList
              notifications={notifications}
              onNotificationClick={handleNotificationClick}
              onMarkAsRead={markAsRead}
              onDismiss={dismissNotification}
            />
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
