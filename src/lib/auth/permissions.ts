import { useAuthStore } from '@/stores/authStore';
import type { ProjectPermission, WorkspacePermission } from '@/types/permissions';

export interface PermissionContext {
  workspaceId?: string;
  projectId?: string;
  boardId?: string;
  cardId?: string;
}

export type PermissionLevel = 'none' | 'read' | 'write' | 'admin';

export function usePermission(context: PermissionContext) {
  const { user, permissions } = useAuthStore();

  if (!user) {
    return {
      level: 'none' as PermissionLevel,
      canRead: false,
      canWrite: false,
      isAdmin: false,
    };
  }

  // Super admin has full access
  if (user.role === 'super_admin') {
    return {
      level: 'admin' as PermissionLevel,
      canRead: true,
      canWrite: true,
      isAdmin: true,
    };
  }

  // Calculate effective permission
  let level: PermissionLevel = 'none';

  if (context.workspaceId && permissions.workspaces[context.workspaceId]) {
    const workspacePerm = permissions.workspaces[context.workspaceId];
    level = workspacePerm.level;

    if (context.projectId && workspacePerm.projects[context.projectId]) {
      const projectPerm = workspacePerm.projects[context.projectId];
      // Take minimum of workspace and project permission
      level = getMinPermission(level, projectPerm);
    }
  }

  return {
    level,
    canRead: level !== 'none',
    canWrite: level === 'write' || level === 'admin',
    isAdmin: level === 'admin',
  };
}

function getMinPermission(a: PermissionLevel, b: PermissionLevel): PermissionLevel {
  const levels: PermissionLevel[] = ['none', 'read', 'write', 'admin'];
  const aIndex = levels.indexOf(a);
  const bIndex = levels.indexOf(b);
  return levels[Math.min(aIndex, bIndex)];
}

export function hasPermission(
  required: PermissionLevel,
  actual: PermissionLevel
): boolean {
  const levels: PermissionLevel[] = ['none', 'read', 'write', 'admin'];
  return levels.indexOf(actual) >= levels.indexOf(required);
}
