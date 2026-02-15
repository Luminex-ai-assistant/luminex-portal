import React from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { Home, Building2, FolderKanban, LayoutGrid } from 'lucide-react';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useProjects } from '@/hooks/useProjects';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ElementType;
}

export function Breadcrumbs() {
  const { workspaceId, projectId, boardId } = useParams<{
    workspaceId?: string;
    projectId?: string;
    boardId?: string;
  }>();
  const location = useLocation();

  const { data: workspaces } = useWorkspaces();
  const { data: projects } = useProjects(workspaceId);

  // Build breadcrumb items based on current route
  const breadcrumbs: BreadcrumbItem[] = React.useMemo(() => {
    const items: BreadcrumbItem[] = [
      { label: 'Dashboard', href: '/dashboard', icon: Home },
    ];

    // Add workspace if in route
    if (workspaceId) {
      const workspace = workspaces?.find((w) => w.id === workspaceId);
      items.push({
        label: workspace?.name || 'Workspace',
        href: `/w/${workspaceId}`,
        icon: Building2,
      });
    }

    // Add project if in route
    if (projectId && workspaceId) {
      const project = projects?.find((p) => p.id === projectId);
      items.push({
        label: project?.name || 'Project',
        href: `/w/${workspaceId}/p/${projectId}`,
        icon: FolderKanban,
      });
    }

    // Add board if in route
    if (boardId && projectId && workspaceId) {
      items.push({
        label: 'Board',
        href: `/w/${workspaceId}/p/${projectId}/board/${boardId}`,
        icon: LayoutGrid,
      });
    }

    // Handle specific routes
    if (location.pathname === '/templates') {
      items.push({ label: 'Templates' });
    } else if (location.pathname === '/automations') {
      items.push({ label: 'Automations' });
    } else if (location.pathname === '/settings') {
      items.push({ label: 'Settings' });
    } else if (location.pathname === '/workspaces/new') {
      items.push({ label: 'New Workspace' });
    }

    return items;
  }, [workspaceId, projectId, boardId, workspaces, projects, location.pathname]);

  // Get current page title
  const currentPageTitle = React.useMemo(() => {
    if (boardId) return 'Board';
    if (projectId) {
      const project = projects?.find((p) => p.id === projectId);
      return project?.name || 'Project';
    }
    if (workspaceId) {
      const workspace = workspaces?.find((w) => w.id === workspaceId);
      return workspace?.name || 'Workspace';
    }
    if (location.pathname === '/templates') return 'Templates';
    if (location.pathname === '/automations') return 'Automations';
    if (location.pathname === '/settings') return 'Settings';
    return 'Dashboard';
  }, [workspaceId, projectId, boardId, workspaces, projects, location.pathname]);

  return {
    breadcrumbs,
    currentPageTitle,
    BreadcrumbNav: () => (
      <nav aria-label="Breadcrumb" className="hidden sm:block">
        <ol className="flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            const Icon = crumb.icon;

            return (
              <li key={index} className="flex items-center gap-2">
                {index > 0 && <span className="text-slate-600">/</span>}
                {crumb.href && !isLast ? (
                  <Link
                    to={crumb.href}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    <span>{crumb.label}</span>
                  </Link>
                ) : (
                  <span className={`flex items-center gap-1.5 ${isLast ? 'text-slate-300' : 'text-slate-400'}`}>
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    <span>{crumb.label}</span>
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    ),
  };
}

// Simple Breadcrumb component for direct use
export function BreadcrumbNav() {
  const { workspaceId, projectId, boardId } = useParams<{
    workspaceId?: string;
    projectId?: string;
    boardId?: string;
  }>();
  const location = useLocation();

  const { data: workspaces } = useWorkspaces();
  const { data: projects } = useProjects(workspaceId);

  const breadcrumbs: BreadcrumbItem[] = React.useMemo(() => {
    const items: BreadcrumbItem[] = [
      { label: 'Dashboard', href: '/dashboard', icon: Home },
    ];

    if (workspaceId) {
      const workspace = workspaces?.find((w) => w.id === workspaceId);
      items.push({
        label: workspace?.name || 'Workspace',
        href: `/w/${workspaceId}`,
        icon: Building2,
      });
    }

    if (projectId && workspaceId) {
      const project = projects?.find((p) => p.id === projectId);
      items.push({
        label: project?.name || 'Project',
        href: `/w/${workspaceId}/p/${projectId}`,
        icon: FolderKanban,
      });
    }

    if (boardId && projectId && workspaceId) {
      items.push({
        label: 'Board',
        href: `/w/${workspaceId}/p/${projectId}/board/${boardId}`,
        icon: LayoutGrid,
      });
    }

    if (location.pathname === '/templates') {
      items.push({ label: 'Templates' });
    } else if (location.pathname === '/automations') {
      items.push({ label: 'Automations' });
    } else if (location.pathname === '/settings') {
      items.push({ label: 'Settings' });
    } else if (location.pathname === '/workspaces/new') {
      items.push({ label: 'New Workspace' });
    }

    return items;
  }, [workspaceId, projectId, boardId, workspaces, projects, location.pathname]);

  return (
    <nav aria-label="Breadcrumb" className="hidden sm:block">
      <ol className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const Icon = crumb.icon;

          return (
            <li key={index} className="flex items-center gap-2">
              {index > 0 && <span className="text-slate-600">/</span>}
              {crumb.href && !isLast ? (
                <Link
                  to={crumb.href}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{crumb.label}</span>
                </Link>
              ) : (
                <span className={`flex items-center gap-1.5 ${isLast ? 'text-slate-300' : 'text-slate-400'}`}>
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{crumb.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
