import { RouterProvider, createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { AppShell } from '@/components/layout/AppShell';
import { LoginPage } from '@/features/auth/LoginPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';

// Protected route
function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

// Public route  
function PublicRoute() {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? <Outlet /> : <Navigate to="/dashboard" replace />;
}

const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [{ path: '/login', element: <LoginPage /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/templates', element: <div style={{padding: '2rem'}}><h1>Templates</h1><p>Coming soon...</p></div> },
          { path: '/automations', element: <div style={{padding: '2rem'}}><h1>Automations</h1><p>Coming soon...</p></div> },
        ],
      },
    ],
  },
  // Fallback for any unmatched routes
  { path: '*', element: <Navigate to="/dashboard" replace /> },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
