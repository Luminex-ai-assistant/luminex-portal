import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { RootErrorBoundary } from '@/lib/errors/boundaries';
import { AppShell } from '@/components/layout/AppShell';
import { LoginPage } from '@/features/auth/LoginPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { WorkspacePage } from '@/features/workspace/WorkspacePage';
import { ProjectPage } from '@/features/project/ProjectPage';
import { BoardPage } from '@/features/board/BoardPage';

// Protected route wrapper
function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

// Public route wrapper (redirects to dashboard if already logged in)
function PublicRoute() {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? <Outlet /> : <Navigate to="/dashboard" replace />;
}

export const router = createBrowserRouter([
  {
    element: <RootErrorBoundary />,
    children: [
      {
        element: <PublicRoute />,
        children: [
          { path: '/login', element: <LoginPage /> },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppShell />,
            children: [
              { path: '/', element: <Navigate to="/dashboard" replace /> },
              { path: '/dashboard', element: <DashboardPage /> },
              { path: '/w/:workspaceId', element: <WorkspacePage /> },
              { path: '/w/:workspaceId/p/:projectId', element: <ProjectPage /> },
              { path: '/w/:workspaceId/p/:projectId/board/:boardId', element: <BoardPage /> },
            ],
          },
        ],
      },
    ],
  },
]);
