import { Bell, Inbox } from 'lucide-react';

export function EmptyNotifications() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
        <Bell className="w-8 h-8 text-slate-600" />
      </div>
      <h3 className="text-lg font-medium text-slate-300 mb-2">
        No notifications yet
      </h3>
      <p className="text-sm text-slate-500 max-w-xs">
        When you receive notifications about mentions, assignments, or updates, they&apos;ll appear here.
      </p>
    </div>
  );
}
