import { useState, useEffect } from 'react';
import { RouterProvider, createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { LoginPage } from '@/features/auth/LoginPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';

// Simple error fallback
function ErrorFallback({ error }: { error: Error }) {
  return (
    <div style={{ padding: '2rem', color: '#ef4444', background: '#0f172a', minHeight: '100vh' }}>
      <h1>Error Loading App</h1>
      <pre>{error.message}</pre>
      <pre>{error.stack}</pre>
    </div>
  );
}

// Safe wrapper that catches errors
function SafeRoute({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    try {
      // Try to render
    } catch (e) {
      setError(e as Error);
    }
  }, []);
  
  if (error) return <ErrorFallback error={error} />;
  return <>{children}</>;
}

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
      { path: '/', element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard', element: <DashboardPage /> },
    ],
  },
]);

function App() {
  const [error, setError] = useState<Error | null>(null);
  
  // Catch any errors during router initialization
  try {
    return <RouterProvider router={router} />;
  } catch (e) {
    if (!error) setError(e as Error);
    if (error) return <ErrorFallback error={error} />;
    return null;
  }
}

export default App;
