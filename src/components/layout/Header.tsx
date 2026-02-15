import React, { useState } from 'react';
import { Search, Bell, User, Menu, Command } from 'lucide-react';
import { SearchModal } from '@/features/search';
import { useCommandK } from '@/features/search';
import { NotificationsPanel, useNotifications } from '@/features/notifications';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface HeaderProps {
  title: string;
  actions?: React.ReactNode;
  breadcrumbs?: Breadcrumb[];
  onMenuClick?: () => void;
  showMobileMenu?: boolean;
}

export function Header({
  title,
  actions,
  breadcrumbs,
  onMenuClick,
  showMobileMenu = false,
}: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { unreadCount } = useNotifications();

  // Register Cmd/Ctrl+K shortcut
  useCommandK(() => setIsSearchOpen(true));

  return (
    <>
      <header className="h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
        {/* Left side: Mobile menu + Title + Breadcrumbs */}
        <div className="flex items-center gap-4 min-w-0">
          {showMobileMenu && (
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 -ml-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="min-w-0">
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav aria-label="Breadcrumb" className="hidden sm:block">
                <ol className="flex items-center gap-2 text-sm">
                  {breadcrumbs.map((crumb, index) => (
                    <li key={index} className="flex items-center gap-2">
                      {index > 0 && (
                        <span className="text-slate-600">/</span>
                      )}
                      {crumb.href ? (
                        <a
                          href={crumb.href}
                          className="text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          {crumb.label}
                        </a>
                      ) : (
                        <span className="text-slate-400">{crumb.label}</span>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            )}
            <h1 className="text-lg sm:text-xl font-semibold text-white truncate">{title}</h1>
          </div>
        </div>

        {/* Right side: Search, Notifications, User */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Actions slot */}
          {actions && (
            <div className="hidden sm:flex items-center gap-2 pr-4 border-r border-slate-800">
              {actions}
            </div>
          )}

          {/* Search */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="group flex items-center gap-2 p-2 sm:pr-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
            {/* Keyboard shortcut hint - hidden on mobile */}
            <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-800 group-hover:bg-slate-700 rounded text-[10px] font-mono text-slate-500 group-hover:text-slate-400 transition-colors">
              <Command className="w-3 h-3" />
              <span>K</span>
            </kbd>
          </button>

          {/* Notifications */}
          <button
            onClick={() => setNotificationsOpen(true)}
            className="relative p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span 
                className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-medium rounded-full ring-2 ring-slate-950" 
                aria-hidden="true"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Avatar */}
          <button
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="User menu"
          >
            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-slate-400" />
            </div>
          </button>
        </div>
      </header>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      
      {/* Notifications Panel */}
      <NotificationsPanel 
        isOpen={notificationsOpen} 
        onOpenChange={setNotificationsOpen} 
      />
    </>
  );
}
