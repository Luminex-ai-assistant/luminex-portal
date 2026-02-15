/**
 * Project types for the portal
 * Projects contain boards and cards
 */

import type { PublicUser } from './user';

/** Project status enum */
export enum ProjectStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  PAUSED = 'paused',
}

/** Project member role */
export enum ProjectMemberRole {
  LEAD = 'lead',
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

/** Project settings */
export interface ProjectSettings {
  defaultBoardId: string | null;
  allowExternalSharing: boolean;
  requireApprovalForChanges: boolean;
  sprintDuration: number; // days
  workingDays: number[]; // 0 = Sunday, 6 = Saturday
  customStatusColors: Record<string, string>;
  estimateUnit: 'points' | 'hours' | 'days';
}

/** Project member */
export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  user: PublicUser;
  role: ProjectMemberRole;
  joinedAt: string;
  invitedBy: string | null;
  isStarred: boolean;
  notificationLevel: 'all' | 'mentions' | 'none';
}

/** Project entity */
export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  startDate: string | null;
  targetEndDate: string | null;
  actualEndDate: string | null;
  ownerId: string;
  settings: ProjectSettings;
  color: string;
  icon: string | null;
  progress: number; // 0-100
  isArchived: boolean;
  boardCount: number;
  memberCount: number;
  cardCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Project with members (detailed view) */
export interface ProjectWithMembers extends Project {
  members: ProjectMember[];
}

/** Project summary for lists */
export interface ProjectSummary {
  id: string;
  name: string;
  color: string;
  status: ProjectStatus;
  progress: number;
  memberCount: number;
}
