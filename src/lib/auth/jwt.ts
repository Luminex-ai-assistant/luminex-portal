import type { User, UserRole } from '@/types/user';

export interface JWTPayload {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  jti: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
  permissions: {
    workspaces: string[];
    version: number;
  };
}

// Tokens stored in memory only (never localStorage for XSS protection)
let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setTokens(access: string, refresh: string): void {
  accessToken = access;
  refreshToken = refresh;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function getRefreshToken(): string | null {
  return refreshToken;
}

export function clearTokens(): void {
  accessToken = null;
  refreshToken = null;
}

export function parseToken(token: string): JWTPayload | null {
  try {
    const base64 = token.split('.')[1];
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = parseToken(token);
  if (!payload) return true;
  return payload.exp * 1000 < Date.now();
}

export function getTokenExpiryTime(token: string): number {
  const payload = parseToken(token);
  if (!payload) return 0;
  return payload.exp * 1000 - Date.now();
}
