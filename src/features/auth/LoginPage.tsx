import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import type { User, UserRole } from '@/types/user';

// Mock user for development
const MOCK_USER: User = {
  id: 'user-1',
  email: 'admin@example.com',
  name: 'Admin User',
  avatarUrl: null,
  role: UserRole.SUPER_ADMIN,
  preferences: {
    theme: 'dark',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'YYYY-MM-DD',
    notifications: {
      email: true,
      inApp: true,
      desktop: false,
      mentionsOnly: false,
      digestFrequency: 'daily',
    },
    sidebarCollapsed: false,
    defaultBoardView: 'board',
  },
  isActive: true,
  lastLoginAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Mock authentication - in production this would call an API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simple validation for demo
      if (email && password) {
        // Generate mock tokens
        const mockAccessToken = btoa(
          JSON.stringify({
            iss: 'luminex',
            sub: MOCK_USER.id,
            aud: 'portal',
            exp: Date.now() / 1000 + 3600,
            iat: Date.now() / 1000,
            jti: Math.random().toString(36),
            user: {
              id: MOCK_USER.id,
              email: MOCK_USER.email,
              name: MOCK_USER.name,
              role: MOCK_USER.role,
            },
            permissions: {
              workspaces: ['*'],
              version: 1,
            },
          })
        );
        const mockRefreshToken = btoa(
          JSON.stringify({
            sub: MOCK_USER.id,
            exp: Date.now() / 1000 + 86400 * 7,
            type: 'refresh',
          })
        );

        login(mockAccessToken, mockRefreshToken, MOCK_USER);
        navigate('/dashboard');
      } else {
        setError('Please enter both email and password');
      }
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>
            Sign in to access your workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && (
              <div className="text-sm text-red-500">{error}</div>
            )}
            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
