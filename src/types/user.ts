/**
 * User types for the portal
 * All IDs are strings, dates are ISO strings
 */

/** User role enum */
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  USER = 'user',
}

/** Notification preferences for a user */
export interface NotificationPreferences {
  email: boolean;
  inApp: boolean;
  desktop: boolean;
  mentionsOnly: boolean;
  digestFrequency: 'immediate' | 'hourly' | 'daily' | 'weekly' | 'never';
}

/** User preferences */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  notifications: NotificationPreferences;
  sidebarCollapsed: boolean;
  defaultBoardView: string;
}

/** User entity */
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: UserRole;
  preferences: UserPreferences;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** User permissions structure */
export interface UserPermissions {
  workspaces: Record<string, {
    level: 'admin' | 'write' | 'read';
    projects: Record<string, 'admin' | 'write' | 'read'>;
  }>;
  version: number;
}

/** Public user info (for sharing) */
export interface PublicUser {
  id: string;
  name: string;
  avatarUrl: string | null;
}

/** User mention in comments */
export interface UserMention {
  userId: string;
  username: string;
  startIndex: number;
  endIndex: number;
}
