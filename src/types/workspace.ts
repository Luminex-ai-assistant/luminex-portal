/**
 * Workspace types for the portal
 * Workspaces are top-level containers for projects
 */

import type { PublicUser } from './user';

/** Workspace visibility */
export enum WorkspaceVisibility {
  PRIVATE = 'private',
  INTERNAL = 'internal',
  PUBLIC = 'public',
}

/** Workspace settings */
export interface WorkspaceSettings {
  allowPublicProjects: boolean;
  allowGuestAccess: boolean;
  defaultProjectTemplate: string | null;
  retentionDays: number;
  customFields: WorkspaceCustomField[];
}

/** Custom field definition for workspace */
export interface WorkspaceCustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multi_select' | 'boolean';
  options?: string[];
  required: boolean;
}

/** Workspace member role */
export enum WorkspaceMemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  GUEST = 'guest',
}

/** Workspace member */
export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  user: PublicUser;
  role: WorkspaceMemberRole;
  joinedAt: string;
  invitedBy: string | null;
  permissions: string[];
}

/** Workspace entity */
export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  visibility: WorkspaceVisibility;
  ownerId: string;
  settings: WorkspaceSettings;
  logoUrl: string | null;
  isArchived: boolean;
  memberCount: number;
  projectCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Workspace with members (detailed view) */
export interface WorkspaceWithMembers extends Workspace {
  members: WorkspaceMember[];
}
