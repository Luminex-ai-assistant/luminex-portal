import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileSidebar } from './MobileSidebar';

interface AppShellProps {
  children?: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onCollapseChange={setSidebarCollapsed}
        />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'
        }`}
      >
        {/* Header */}
        <Header
          onMenuClick={() => setMobileSidebarOpen(true)}
          showMobileMenu
        />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
