/**
 * Permission types for the portal
 * Defines access control for workspaces and projects
 */

import type { UserRole } from './user';
import { WorkspaceMemberRole } from './workspace';
import { ProjectMemberRole } from './project';

/** Permission levels */
export type PermissionLevel = 'none' | 'view' | 'comment' | 'edit' | 'admin' | 'owner';

/** Workspace permission scopes */
export enum WorkspacePermissionScope {
  // Workspace-level
  WORKSPACE_VIEW = 'workspace:view',
  WORKSPACE_EDIT = 'workspace:edit',
  WORKSPACE_DELETE = 'workspace:delete',
  WORKSPACE_MANAGE_MEMBERS = 'workspace:manage_members',
  WORKSPACE_MANAGE_SETTINGS = 'workspace:manage_settings',
  
  // Project creation/management
  PROJECT_CREATE = 'project:create',
  PROJECT_DELETE = 'project:delete',
  
  // Billing (for future)
  BILLING_VIEW = 'billing:view',
  BILLING_MANAGE = 'billing:manage',
}

/** Project permission scopes */
export enum ProjectPermissionScope {
  // Project-level
  PROJECT_VIEW = 'project:view',
  PROJECT_EDIT = 'project:edit',
  PROJECT_ARCHIVE = 'project:archive',
  PROJECT_MANAGE_MEMBERS = 'project:manage_members',
  PROJECT_MANAGE_SETTINGS = 'project:manage_settings',
  
  // Board-level
  BOARD_CREATE = 'board:create',
  BOARD_EDIT = 'board:edit',
  BOARD_DELETE = 'board:delete',
  
  // Card-level
  CARD_CREATE = 'card:create',
  CARD_EDIT = 'card:edit',
  CARD_DELETE = 'card:delete',
  CARD_MOVE = 'card:move',
  CARD_ASSIGN = 'card:assign',
  
  // Comment-level
  COMMENT_CREATE = 'comment:create',
  COMMENT_EDIT_OWN = 'comment:edit_own',
  COMMENT_DELETE_OWN = 'comment:delete_own',
  COMMENT_DELETE_ANY = 'comment:delete_any',
  
  // Attachment-level
  ATTACHMENT_CREATE = 'attachment:create',
  ATTACHMENT_DELETE_OWN = 'attachment:delete_own',
  ATTACHMENT_DELETE_ANY = 'attachment:delete_any',
}

/** Workspace permission definition */
export interface WorkspacePermission {
  id: string;
  workspaceId: string;
  role: WorkspaceMemberRole;
  userRole: UserRole | null;
  permissions: WorkspacePermissionScope[];
  createdAt: string;
  updatedAt: string;
}

/** Project permission definition */
export interface ProjectPermission {
  id: string;
  projectId: string;
  role: ProjectMemberRole;
  permissions: ProjectPermissionScope[];
  createdAt: string;
  updatedAt: string;
}

/** Permission check result */
export interface PermissionCheck {
  allowed: boolean;
  reason: string | null;
  required: string[];
}

/** Role permission mapping for workspaces */
export const WORKSPACE_ROLE_PERMISSIONS: Record<WorkspaceMemberRole, WorkspacePermissionScope[]> = {
  [WorkspaceMemberRole.OWNER]: [
    WorkspacePermissionScope.WORKSPACE_VIEW,
    WorkspacePermissionScope.WORKSPACE_EDIT,
    WorkspacePermissionScope.WORKSPACE_DELETE,
    WorkspacePermissionScope.WORKSPACE_MANAGE_MEMBERS,
    WorkspacePermissionScope.WORKSPACE_MANAGE_SETTINGS,
    WorkspacePermissionScope.PROJECT_CREATE,
    WorkspacePermissionScope.PROJECT_DELETE,
    WorkspacePermissionScope.BILLING_VIEW,
    WorkspacePermissionScope.BILLING_MANAGE,
  ],
  [WorkspaceMemberRole.ADMIN]: [
    WorkspacePermissionScope.WORKSPACE_VIEW,
    WorkspacePermissionScope.WORKSPACE_EDIT,
    WorkspacePermissionScope.WORKSPACE_MANAGE_MEMBERS,
    WorkspacePermissionScope.WORKSPACE_MANAGE_SETTINGS,
    WorkspacePermissionScope.PROJECT_CREATE,
    WorkspacePermissionScope.PROJECT_DELETE,
    WorkspacePermissionScope.BILLING_VIEW,
  ],
  [WorkspaceMemberRole.MEMBER]: [
    WorkspacePermissionScope.WORKSPACE_VIEW,
    WorkspacePermissionScope.PROJECT_CREATE,
    WorkspacePermissionScope.BILLING_VIEW,
  ],
  [WorkspaceMemberRole.GUEST]: [
    WorkspacePermissionScope.WORKSPACE_VIEW,
  ],
};

/** Role permission mapping for projects */
export const PROJECT_ROLE_PERMISSIONS: Record<ProjectMemberRole, ProjectPermissionScope[]> = {
  [ProjectMemberRole.LEAD]: [
    ProjectPermissionScope.PROJECT_VIEW,
    ProjectPermissionScope.PROJECT_EDIT,
    ProjectPermissionScope.PROJECT_ARCHIVE,
    ProjectPermissionScope.PROJECT_MANAGE_MEMBERS,
    ProjectPermissionScope.PROJECT_MANAGE_SETTINGS,
    ProjectPermissionScope.BOARD_CREATE,
    ProjectPermissionScope.BOARD_EDIT,
    ProjectPermissionScope.BOARD_DELETE,
    ProjectPermissionScope.CARD_CREATE,
    ProjectPermissionScope.CARD_EDIT,
    ProjectPermissionScope.CARD_DELETE,
    ProjectPermissionScope.CARD_MOVE,
    ProjectPermissionScope.CARD_ASSIGN,
    ProjectPermissionScope.COMMENT_CREATE,
    ProjectPermissionScope.COMMENT_EDIT_OWN,
    ProjectPermissionScope.COMMENT_DELETE_OWN,
    ProjectPermissionScope.COMMENT_DELETE_ANY,
    ProjectPermissionScope.ATTACHMENT_CREATE,
    ProjectPermissionScope.ATTACHMENT_DELETE_OWN,
    ProjectPermissionScope.ATTACHMENT_DELETE_ANY,
  ],
  [ProjectMemberRole.ADMIN]: [
    ProjectPermissionScope.PROJECT_VIEW,
    ProjectPermissionScope.PROJECT_EDIT,
    ProjectPermissionScope.PROJECT_MANAGE_MEMBERS,
    ProjectPermissionScope.PROJECT_MANAGE_SETTINGS,
    ProjectPermissionScope.BOARD_CREATE,
    ProjectPermissionScope.BOARD_EDIT,
    ProjectPermissionScope.BOARD_DELETE,
    ProjectPermissionScope.CARD_CREATE,
    ProjectPermissionScope.CARD_EDIT,
    ProjectPermissionScope.CARD_DELETE,
    ProjectPermissionScope.CARD_MOVE,
    ProjectPermissionScope.CARD_ASSIGN,
    ProjectPermissionScope.COMMENT_CREATE,
    ProjectPermissionScope.COMMENT_EDIT_OWN,
    ProjectPermissionScope.COMMENT_DELETE_OWN,
    ProjectPermissionScope.ATTACHMENT_CREATE,
    ProjectPermissionScope.ATTACHMENT_DELETE_OWN,
  ],
  [ProjectMemberRole.MEMBER]: [
    ProjectPermissionScope.PROJECT_VIEW,
    ProjectPermissionScope.BOARD_CREATE,
    ProjectPermissionScope.CARD_CREATE,
    ProjectPermissionScope.CARD_EDIT,
    ProjectPermissionScope.CARD_MOVE,
    ProjectPermissionScope.CARD_ASSIGN,
    ProjectPermissionScope.COMMENT_CREATE,
    ProjectPermissionScope.COMMENT_EDIT_OWN,
    ProjectPermissionScope.COMMENT_DELETE_OWN,
    ProjectPermissionScope.ATTACHMENT_CREATE,
    ProjectPermissionScope.ATTACHMENT_DELETE_OWN,
  ],
  [ProjectMemberRole.VIEWER]: [
    ProjectPermissionScope.PROJECT_VIEW,
    ProjectPermissionScope.COMMENT_CREATE,
  ],
};
